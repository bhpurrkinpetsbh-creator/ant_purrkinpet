import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, QrCode, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";
import QRCode from "react-qr-code";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Payment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [showQR, setShowQR] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("qr"); // "qr" or "benefit"
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  });

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

  const handlePaymentSubmission = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmPayment = async () => {
    setShowConfirmDialog(false);
    await onSubmit();
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
          payment_method: "benefit_bank_scan",
          payment_status: "pending",
          status: "pending",
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
        title: "Order submitted successfully!",
        description: `Your order #${orderData.order_number} has been submitted for review.`,
      });

      // Send email notification (non-blocking)
      try {
        await supabase.functions.invoke('send-order-email', {
          body: {
            type: 'payment_submitted',
            customerEmail: checkoutData.email,
            customerName: checkoutData.name,
            orderNumber: orderData.order_number,
            orderTotal: checkoutData.total.toFixed(3),
            orderDate: new Date(orderData.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })
          }
        });
        console.log('Order confirmation email sent');
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
        // Don't block the flow if email fails
      }

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

              {/* Payment Method Selection */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Select Payment Method</h3>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="space-y-3">
                    {/* QR Payment Option */}
                    <Card className={`p-4 cursor-pointer transition-colors ${paymentMethod === 'qr' ? 'border-primary' : ''}`}>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="qr" id="qr" />
                        <Label htmlFor="qr" className="flex items-center gap-3 cursor-pointer flex-1">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <QrCode className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold">QR Code Payment</p>
                            <p className="text-sm text-muted-foreground">Pay via bank transfer using QR code</p>
                          </div>
                        </Label>
                      </div>
                    </Card>

                    {/* Benefit Card Payment Option */}
                    <Card className={`p-4 cursor-pointer transition-colors ${paymentMethod === 'benefit' ? 'border-primary' : ''}`}>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="benefit" id="benefit" />
                        <Label htmlFor="benefit" className="flex items-center gap-3 cursor-pointer flex-1">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <CreditCard className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold">Benefit Card Payment</p>
                            <p className="text-sm text-muted-foreground">Pay securely with your Benefit card</p>
                          </div>
                        </Label>
                      </div>
                    </Card>
                  </div>
                </RadioGroup>
              </div>

              {/* Alert for Benefit Payment Integration Pending */}
              {paymentMethod === 'benefit' && (
                <Alert className="mb-6 border-orange-500 bg-orange-50 dark:bg-orange-950">
                  <AlertDescription className="text-orange-800 dark:text-orange-200">
                    ⚠️ <strong>Benefit payment integration is pending.</strong> Please select QR payment method to proceed with your order.
                  </AlertDescription>
                </Alert>
              )}

              {/* Card Details Form - Only show when Benefit is selected */}
              {paymentMethod === 'benefit' && (
                <div className="space-y-4 mb-6">
                  <h3 className="text-lg font-semibold">Card Details</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={cardDetails.cardNumber}
                        onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: e.target.value })}
                        maxLength={19}
                        disabled
                      />
                    </div>
                    <div>
                      <Label htmlFor="cardName">Cardholder Name</Label>
                      <Input
                        id="cardName"
                        placeholder="JOHN DOE"
                        value={cardDetails.cardName}
                        onChange={(e) => setCardDetails({ ...cardDetails, cardName: e.target.value })}
                        disabled
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiryDate">Expiry Date</Label>
                        <Input
                          id="expiryDate"
                          placeholder="MM/YY"
                          value={cardDetails.expiryDate}
                          onChange={(e) => setCardDetails({ ...cardDetails, expiryDate: e.target.value })}
                          maxLength={5}
                          disabled
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          placeholder="123"
                          type="password"
                          value={cardDetails.cvv}
                          onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                          maxLength={3}
                          disabled
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={handleProceedToPay}
                className="w-full bg-gradient-hero hover:opacity-90"
                size="lg"
                disabled={paymentMethod === 'benefit'}
              >
                {paymentMethod === 'benefit' ? 'Payment Method Unavailable' : 'Proceed to Pay'}
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
                  onClick={handlePaymentSubmission}
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

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Payment Confirmation</AlertDialogTitle>
            <AlertDialogDescription className="text-base leading-relaxed space-y-2">
              <p className="font-semibold text-foreground">Thank you for placing your order! 🎉</p>

              <p>We will review your payment and confirm your order once the payment is credited to our account.</p>

              <p>You will receive an email confirmation with your order details. Please check your inbox (and spam folder if you don't see it) for updates on your order status.</p>

              <p>You can also track your order anytime on the Orders page.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleConfirmPayment} disabled={isProcessing}>
              {isProcessing ? "Processing..." : "I Understand"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Payment;
