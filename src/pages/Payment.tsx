import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Lock, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

// Declare Checkout.com types
declare global {
  interface Window {
    CheckoutWebComponents: any;
  }
}

const Payment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [showPaymentWidget, setShowPaymentWidget] = useState(false);
  const [paymentInitialized, setPaymentInitialized] = useState(false);

  useEffect(() => {
    const data = sessionStorage.getItem("checkoutData");
    if (!data) {
      navigate("/cart");
      return;
    }
    setCheckoutData(JSON.parse(data));
  }, [navigate]);

  const initializeCheckoutPayment = async () => {
    if (!checkoutData || paymentInitialized) return;

    setIsProcessing(true);
    setShowPaymentWidget(true);

    try {
      // Convert BHD to fils (smallest unit, 1 BHD = 1000 fils)
      const amountInFils = Math.round(checkoutData.total * 1000);
      
      // Generate order reference
      const orderRef = `ORD-${Date.now()}`;

      // Store order reference in session for later use
      sessionStorage.setItem('pendingOrderRef', orderRef);

      // Create payment session via edge function
      const { data: sessionData, error: sessionError } = await supabase.functions.invoke(
        'create-payment-session',
        {
          body: {
            amount: amountInFils,
            currency: 'BHD',
            reference: orderRef,
            customerName: checkoutData.full_name,
            customerEmail: checkoutData.email,
            successUrl: `${window.location.origin}/payment-success`,
            failureUrl: `${window.location.origin}/payment-failure`,
          },
        }
      );

      if (sessionError || !sessionData.success) {
        throw new Error(sessionData?.error || 'Failed to create payment session');
      }

      console.log('Payment session created:', sessionData.paymentSession.id);

      // Get public key from environment
      const publicKey = import.meta.env.VITE_CHECKOUT_COM_PUBLIC_KEY;
      
      if (!publicKey || publicKey === 'pk_sbox_YOUR_PUBLIC_KEY_HERE') {
        throw new Error('Checkout.com public key not configured. Please update VITE_CHECKOUT_COM_PUBLIC_KEY in .env file');
      }
      
      if (!window.CheckoutWebComponents) {
        throw new Error('Checkout.com script not loaded');
      }

      const checkout = await window.CheckoutWebComponents({
        paymentSession: sessionData.paymentSession,
        publicKey: publicKey,
        environment: 'sandbox',
        onPaymentCompleted: async (self: any, paymentResponse: any) => {
          console.log('Payment completed:', paymentResponse.id);
          
          // Store payment ID and redirect
          sessionStorage.setItem('paymentId', paymentResponse.id);
          window.location.href = `${window.location.origin}/payment-success?cko-payment-id=${paymentResponse.id}`;
        },
        onError: (error: any) => {
          console.error('Payment error:', error);
          toast({
            title: "Payment Error",
            description: "An error occurred during payment. Please try again.",
            variant: "destructive",
          });
          setIsProcessing(false);
          setShowPaymentWidget(false);
        }
      });

      const flowComponent = checkout.create('flow');
      flowComponent.mount('#payment-widget-container');
      
      setPaymentInitialized(true);
      setIsProcessing(false);

    } catch (error) {
      console.error("Error initializing payment:", error);
      toast({
        title: "Payment initialization failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
      setShowPaymentWidget(false);
    }
  };

  if (!checkoutData) return null;

  return (
    <div className="container py-8">
      <Button variant="ghost" className="mb-6" asChild disabled={showPaymentWidget}>
        <Link to="/checkout">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Checkout
        </Link>
      </Button>

      <h1 className="text-3xl font-bold mb-8">Payment</h1>

      <div className="max-w-2xl mx-auto">
        {!showPaymentWidget ? (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Lock className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Secure payment powered by Checkout.com (Sandbox)
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">{checkoutData.subtotal.toFixed(3)} BHD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span className="font-semibold">{checkoutData.deliveryFee.toFixed(3)} BHD</span>
              </div>
              <div className="border-t pt-4 flex justify-between">
                <span className="text-lg font-bold">Total Amount</span>
                <span className="text-2xl font-bold text-primary">
                  {checkoutData.total.toFixed(3)} BHD
                </span>
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg mb-6">
              <p className="text-sm font-semibold mb-2">Test Card Details:</p>
              <p className="text-sm text-muted-foreground">Card: 4242 4242 4242 4242</p>
              <p className="text-sm text-muted-foreground">CVV: Any 3 digits</p>
              <p className="text-sm text-muted-foreground">Expiry: Any future date</p>
            </div>

            <Button
              onClick={initializeCheckoutPayment}
              className="w-full bg-gradient-hero hover:opacity-90"
              size="lg"
              disabled={isProcessing}
            >
              <Lock className="mr-2 h-4 w-4" />
              {isProcessing ? "Initializing Payment..." : "Proceed to Pay"}
            </Button>
          </Card>
        ) : (
          <Card className="p-6">
            <div id="payment-widget-container" className="min-h-[400px]"></div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Payment;
