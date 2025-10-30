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
  const [paymentInitialized, setPaymentInitialized] = useState(false);

  useEffect(() => {
    const data = sessionStorage.getItem("checkoutData");
    if (!data) {
      navigate("/cart");
      return;
    }
    setCheckoutData(JSON.parse(data));
  }, [navigate]);

  useEffect(() => {
    // Automatically initialize payment when checkout data is loaded
    if (checkoutData && !paymentInitialized) {
      initializeCheckoutPayment();
    }
  }, [checkoutData, paymentInitialized]);

  const initializeCheckoutPayment = async () => {
    if (!checkoutData || paymentInitialized) return;

    setIsProcessing(true);

    try {
      // Convert BHD to fils (smallest unit, 1 BHD = 1000 fils)
      const amountInFils = Math.round(checkoutData.total * 1000);
      
      // Generate order reference
      const orderRef = `ORD-${Date.now()}`;

      // Store order reference in session for later use
      sessionStorage.setItem('pendingOrderRef', orderRef);

      console.log('Creating payment session...');

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

      if (sessionError || !sessionData?.success) {
        throw new Error(sessionData?.error || 'Failed to create payment session');
      }

      console.log('Payment session created:', sessionData.paymentSession.id);

      // Get public key from Supabase secrets (stored as CHECKOUT_COM_PUBLIC_KEY)
      const publicKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? 
        'pk_sbox_o7qyixbvi4ge3pxlfv5htx3bafm' : // Use the actual public key provided by user
        'pk_sbox_o7qyixbvi4ge3pxlfv5htx3bafm';
      
      if (!window.CheckoutWebComponents) {
        throw new Error('Checkout.com script not loaded. Please refresh the page.');
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
    }
  };

  if (!checkoutData) return null;

  if (!paymentInitialized && isProcessing) {
    return (
      <div className="container py-12 min-h-[60vh] flex items-center justify-center">
        <p className="text-muted-foreground">Loading payment gateway...</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Button variant="ghost" className="mb-6" asChild disabled={paymentInitialized}>
        <Link to="/checkout">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Checkout
        </Link>
      </Button>

      <h1 className="text-3xl font-bold mb-8">Payment</h1>

      <div className="max-w-2xl mx-auto">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Lock className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Secure payment powered by Checkout.com (Sandbox)
            </p>
          </div>

          <div className="space-y-3 mb-6 pb-6 border-b">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold">{checkoutData.subtotal.toFixed(3)} BHD</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery Fee</span>
              <span className="font-semibold">{checkoutData.deliveryFee.toFixed(3)} BHD</span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="font-bold">Total Amount</span>
              <span className="text-2xl font-bold text-primary">
                {checkoutData.total.toFixed(3)} BHD
              </span>
            </div>
          </div>

          <div id="payment-widget-container" className="min-h-[400px]"></div>
        </Card>
      </div>
    </div>
  );
};

export default Payment;
