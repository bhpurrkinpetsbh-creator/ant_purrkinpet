import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);
  const [orderNumber, setOrderNumber] = useState<string>("");

  useEffect(() => {
    const processOrder = async () => {
      try {
        const paymentId = searchParams.get('cko-payment-id');
        const checkoutDataStr = sessionStorage.getItem("checkoutData");
        const pendingOrderRef = sessionStorage.getItem("pendingOrderRef");

        if (!checkoutDataStr || !paymentId) {
          toast({
            title: "Error",
            description: "Payment information not found.",
            variant: "destructive",
          });
          navigate("/cart");
          return;
        }

        const checkoutData = JSON.parse(checkoutDataStr);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
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
        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .insert([{
            order_number: pendingOrderRef || `ORD-${Date.now()}`,
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
            payment_method: "checkout.com",
            payment_status: "paid",
            status: "confirmed",
            admin_notes: `Payment ID: ${paymentId}`,
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
        await supabase
          .from("cart_items")
          .delete()
          .eq("customer_id", user.id);

        // Clear session data
        sessionStorage.removeItem("checkoutData");
        sessionStorage.removeItem("pendingOrderRef");
        sessionStorage.removeItem("paymentId");

        // Dispatch cart update event
        window.dispatchEvent(new Event("cart:updated"));

        setOrderNumber(orderData.order_number);
        setIsProcessing(false);

        toast({
          title: "Payment Successful!",
          description: `Your order #${orderData.order_number} has been confirmed.`,
        });
      } catch (error) {
        console.error("Error processing order:", error);
        toast({
          title: "Error",
          description: "Failed to process order. Please contact support.",
          variant: "destructive",
        });
        setIsProcessing(false);
      }
    };

    processOrder();
  }, [searchParams, navigate, toast]);

  if (isProcessing) {
    return (
      <div className="container py-12 min-h-[60vh] flex items-center justify-center">
        <p className="text-muted-foreground">Processing your order...</p>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 text-center">
          <div className="flex justify-center mb-6">
            <CheckCircle2 className="h-20 w-20 text-green-500" />
          </div>
          
          <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
          
          <p className="text-muted-foreground mb-6">
            Thank you for your order. Your payment has been processed successfully.
          </p>

          {orderNumber && (
            <div className="bg-muted p-4 rounded-lg mb-6">
              <p className="text-sm text-muted-foreground mb-1">Order Number</p>
              <p className="text-xl font-bold">{orderNumber}</p>
            </div>
          )}

          <p className="text-sm text-muted-foreground mb-8">
            A confirmation email has been sent to your email address.
          </p>

          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => navigate("/orders")}
              className="bg-gradient-hero hover:opacity-90"
            >
              <Package className="mr-2 h-4 w-4" />
              View Orders
            </Button>
            <Button
              onClick={() => navigate("/shop")}
              variant="outline"
            >
              Continue Shopping
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PaymentSuccess;