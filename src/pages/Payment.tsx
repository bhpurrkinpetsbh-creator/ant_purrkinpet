import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, QrCode } from "lucide-react";
import { Link } from "react-router-dom";
import QRCode from "react-qr-code";

const Payment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    const data = sessionStorage.getItem("checkoutData");
    if (!data) {
      navigate("/cart");
      return;
    }
    setCheckoutData(JSON.parse(data));
  }, [navigate]);

  const handleProceedToPay = () => {
    setShowQR(true);
  };

  const onSubmit = async () => {
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
          full_name: checkoutData.name,
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
          shipping_name: checkoutData.name,
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

  const qrData = JSON.stringify({
    iban: "BH30ALSA00354347100100",
    amount: checkoutData.total.toFixed(3)
  });

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
          {!showQR ? (
            <>
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{checkoutData.subtotal.toFixed(3)} BHD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span>{checkoutData.deliveryFee.toFixed(3)} BHD</span>
                </div>
                <div className="border-t pt-4 flex justify-between">
                  <span className="font-semibold text-lg">Total Amount</span>
                  <span className="text-2xl font-bold text-primary">
                    {checkoutData.total.toFixed(3)} BHD
                  </span>
                </div>
              </div>

              <Button
                onClick={handleProceedToPay}
                className="w-full bg-gradient-hero hover:opacity-90"
                size="lg"
              >
                Proceed to Pay
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-6 justify-center">
                <QrCode className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-bold">Scan to Pay</h2>
              </div>

              <div className="flex flex-col items-center justify-center space-y-6">
                <div className="bg-white p-6 rounded-lg">
                  <QRCode value={qrData} size={256} />
                </div>

                <div className="text-center space-y-2">
                  <p className="text-lg font-semibold">
                    Amount: {checkoutData.total.toFixed(3)} BHD
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Scan the QR code with your banking app to complete the payment
                  </p>
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">IBAN</p>
                    <p className="font-mono text-sm">BH30ALSA00354347100100</p>
                  </div>
                </div>

                <Button
                  onClick={onSubmit}
                  className="w-full bg-gradient-hero hover:opacity-90"
                  size="lg"
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : "I've Completed the Payment"}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setShowQR(false)}
                  className="w-full"
                >
                  Back
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Payment;
