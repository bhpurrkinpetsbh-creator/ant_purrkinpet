import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Lock, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const paymentSchema = z.object({
  card_number: z.string().min(16, "Card number must be 16 digits").max(19),
  card_name: z.string().min(2, "Name on card is required").max(100),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, "Format: MM/YY"),
  cvv: z.string().min(3, "CVV must be 3 digits").max(4),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

const Payment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutData, setCheckoutData] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
  });

  useEffect(() => {
    const data = sessionStorage.getItem("checkoutData");
    if (!data) {
      navigate("/cart");
      return;
    }
    setCheckoutData(JSON.parse(data));
  }, [navigate]);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.slice(0, 2) + "/" + v.slice(2, 4);
    }
    return v;
  };

  const onSubmit = async (data: PaymentFormData) => {
    if (!checkoutData) return;

    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to complete your order.",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      // Ensure customer profile exists
      const { data: customerData } = await supabase
        .from("customers")
        .select("id")
        .eq("id", user.id)
        .single();

      if (!customerData) {
        await supabase.from("customers").insert({
          id: user.id,
          full_name: checkoutData.full_name,
          phone: checkoutData.phone,
          address_line1: checkoutData.address_line1,
          address_line2: checkoutData.address_line2,
          city: checkoutData.city,
          postal_code: checkoutData.postal_code,
        });
      }

      // Create order
      const orderNumber = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert([{
          order_number: orderNumber,
          customer_id: user.id,
          customer_email: checkoutData.email,
          customer_phone: checkoutData.phone,
          shipping_name: checkoutData.full_name,
          shipping_address_line1: checkoutData.address_line1,
          shipping_address_line2: checkoutData.address_line2 || null,
          shipping_city: checkoutData.city,
          shipping_postal_code: checkoutData.postal_code || null,
          subtotal: checkoutData.subtotal,
          delivery_fee: checkoutData.deliveryFee,
          total: checkoutData.total,
          payment_method: "card",
          payment_status: "paid",
          status: "confirmed",
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = checkoutData.cartItems.map((item: any) => ({
        order_id: orderData.id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_sku: item.product_sku,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart
      const { data: cartData } = await supabase
        .from("cart_items")
        .select("id")
        .eq("customer_id", user.id);

      if (cartData && cartData.length > 0) {
        await supabase
          .from("cart_items")
          .delete()
          .eq("customer_id", user.id);
      }

      // Clear checkout data
      sessionStorage.removeItem("checkoutData");

      // Dispatch cart update event
      window.dispatchEvent(new Event("cart:updated"));

      toast({
        title: "Order placed successfully!",
        description: `Your order #${orderData.order_number} has been confirmed.`,
      });

      navigate("/orders");
    } catch (error) {
      console.error("Error processing payment:", error);
      toast({
        title: "Payment failed",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!checkoutData) return null;

  return (
    <div className="container py-8">
      <Button variant="ghost" className="mb-6" asChild>
        <Link to="/checkout">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Checkout
        </Link>
      </Button>

      <h1 className="text-3xl font-bold mb-8">Payment</h1>

      <div className="max-w-2xl mx-auto">
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              This is a demo payment page. No real charges will be made.
            </p>
          </div>
          
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Card Details
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="card_number">Card Number *</Label>
              <Input
                id="card_number"
                {...register("card_number")}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                onChange={(e) => {
                  const formatted = formatCardNumber(e.target.value);
                  setValue("card_number", formatted);
                }}
              />
              {errors.card_number && (
                <p className="text-sm text-destructive mt-1">
                  {errors.card_number.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="card_name">Name on Card *</Label>
              <Input
                id="card_name"
                {...register("card_name")}
                placeholder="JOHN DOE"
              />
              {errors.card_name && (
                <p className="text-sm text-destructive mt-1">
                  {errors.card_name.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiry">Expiry Date *</Label>
                <Input
                  id="expiry"
                  {...register("expiry")}
                  placeholder="MM/YY"
                  maxLength={5}
                  onChange={(e) => {
                    const formatted = formatExpiry(e.target.value);
                    setValue("expiry", formatted);
                  }}
                />
                {errors.expiry && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.expiry.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="cvv">CVV *</Label>
                <Input
                  id="cvv"
                  type="password"
                  {...register("cvv")}
                  placeholder="123"
                  maxLength={4}
                />
                {errors.cvv && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.cvv.message}
                  </p>
                )}
              </div>
            </div>

            <div className="border-t pt-4 mt-6">
              <div className="flex justify-between mb-4">
                <span className="font-semibold">Total Amount</span>
                <span className="text-2xl font-bold text-primary">
                  {checkoutData.total.toFixed(2)} BHD
                </span>
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-hero hover:opacity-90"
                size="lg"
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Pay Now"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Payment;
