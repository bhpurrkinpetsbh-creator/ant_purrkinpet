import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentSessionRequest {
  amount: number;
  currency: string;
  reference: string;
  customerName: string;
  customerEmail: string;
  successUrl: string;
  failureUrl: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Creating payment session...');
    
    const { 
      amount, 
      currency, 
      reference, 
      customerName, 
      customerEmail,
      successUrl,
      failureUrl
    }: PaymentSessionRequest = await req.json();

    console.log('Payment session request:', { amount, currency, reference, customerEmail });

    // Validate input
    if (!amount || !currency || !reference || !customerEmail) {
      throw new Error('Missing required fields');
    }

    const checkoutSecretKey = Deno.env.get('CHECKOUT_COM_SECRET_KEY');
    if (!checkoutSecretKey) {
      throw new Error('Checkout.com secret key not configured');
    }

    // Create payment session with Checkout.com
    const paymentSessionResponse = await fetch('https://api.sandbox.checkout.com/payment-sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${checkoutSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency,
        reference,
        display_name: 'Purrkin Pets',
        billing: {
          address: {
            country: 'BH'
          }
        },
        customer: {
          name: customerName,
          email: customerEmail
        },
        success_url: successUrl,
        failure_url: failureUrl
      }),
    });

    if (!paymentSessionResponse.ok) {
      const errorText = await paymentSessionResponse.text();
      console.error('Checkout.com API error:', errorText);
      throw new Error(`Payment session creation failed: ${errorText}`);
    }

    const paymentSessionData = await paymentSessionResponse.json();
    console.log('Payment session created successfully:', paymentSessionData.id);

    return new Response(
      JSON.stringify({ 
        success: true,
        paymentSession: paymentSessionData 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error creating payment session:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMessage
      }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});