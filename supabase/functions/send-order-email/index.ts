import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// Using ESM CDN for Resend to avoid npm resolution in local build
const Resend = (await import("https://esm.sh/resend@4.0.0")).Resend;

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderEmailRequest {
  type: 'payment_submitted' | 'payment_confirmed' | 'payment_rejected';
  customerEmail: string;
  customerName: string;
  orderNumber: string;
  orderTotal: string;
  orderDate: string;
}

const getEmailTemplate = (data: OrderEmailRequest): { subject: string; html: string } => {
  const { type, customerName, orderNumber, orderTotal, orderDate } = data;

  if (type === 'payment_submitted') {
    return {
      subject: `Payment Submitted - Order ${orderNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Payment Submitted</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Payment Submitted ⏳</h1>
                      </td>
                    </tr>
                    
                    <!-- Body -->
                    <tr>
                      <td style="padding: 40px 30px;">
                        <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                          Hello ${customerName},
                        </p>
                        
                        <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                          Thank you for your order! We've received your payment submission and it's currently under review.
                        </p>
                        
                        <!-- Order Details Box -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9ff; border: 2px solid #667eea; border-radius: 8px; margin-bottom: 30px;">
                          <tr>
                            <td style="padding: 24px;">
                              <h2 style="margin: 0 0 16px; color: #667eea; font-size: 18px; font-weight: 600;">Order Details</h2>
                              <table width="100%" cellpadding="8" cellspacing="0">
                                <tr>
                                  <td style="color: #666666; font-size: 14px;">Order Number:</td>
                                  <td style="color: #333333; font-size: 14px; font-weight: 600; text-align: right;">${orderNumber}</td>
                                </tr>
                                <tr>
                                  <td style="color: #666666; font-size: 14px;">Total Amount:</td>
                                  <td style="color: #333333; font-size: 14px; font-weight: 600; text-align: right;">${orderTotal} BHD</td>
                                </tr>
                                <tr>
                                  <td style="color: #666666; font-size: 14px;">Order Date:</td>
                                  <td style="color: #333333; font-size: 14px; font-weight: 600; text-align: right;">${orderDate}</td>
                                </tr>
                                <tr>
                                  <td style="color: #666666; font-size: 14px;">Status:</td>
                                  <td style="text-align: right;">
                                    <span style="background-color: #fbbf24; color: #78350f; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">UNDER REVIEW</span>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                        
                        <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                          Our admin team will verify your payment shortly. Once confirmed, we'll send you another email and begin processing your order.
                        </p>
                        
                        <p style="margin: 0 0 30px; color: #666666; font-size: 14px; line-height: 1.6;">
                          You can track your order status on our orders page anytime.
                        </p>
                        
                        <!-- CTA Button -->
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td align="center" style="padding: 20px 0;">
                              <a href="https://purrkinpetsbh.com/orders" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">View Order Status</a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                        <p style="margin: 0 0 8px; color: #666666; font-size: 14px;">Thank you for shopping with Purrkin Pet Store!</p>
                        <p style="margin: 0; color: #999999; font-size: 12px;">© 2025 Purrkin Pet Store. All rights reserved.</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    };
  }

  if (type === 'payment_confirmed') {
    return {
      subject: `Payment Confirmed - Order ${orderNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Payment Confirmed</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Payment Confirmed! 🎉</h1>
                      </td>
                    </tr>
                    
                    <!-- Body -->
                    <tr>
                      <td style="padding: 40px 30px;">
                        <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                          Hello ${customerName},
                        </p>
                        
                        <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                          Great news! Your payment has been verified and your order is confirmed. We're now processing it for delivery.
                        </p>
                        
                        <!-- Order Details Box -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0fdf4; border: 2px solid #10b981; border-radius: 8px; margin-bottom: 30px;">
                          <tr>
                            <td style="padding: 24px;">
                              <h2 style="margin: 0 0 16px; color: #10b981; font-size: 18px; font-weight: 600;">Order Details</h2>
                              <table width="100%" cellpadding="8" cellspacing="0">
                                <tr>
                                  <td style="color: #666666; font-size: 14px;">Order Number:</td>
                                  <td style="color: #333333; font-size: 14px; font-weight: 600; text-align: right;">${orderNumber}</td>
                                </tr>
                                <tr>
                                  <td style="color: #666666; font-size: 14px;">Total Amount:</td>
                                  <td style="color: #333333; font-size: 14px; font-weight: 600; text-align: right;">${orderTotal} BHD</td>
                                </tr>
                                <tr>
                                  <td style="color: #666666; font-size: 14px;">Order Date:</td>
                                  <td style="color: #333333; font-size: 14px; font-weight: 600; text-align: right;">${orderDate}</td>
                                </tr>
                                <tr>
                                  <td style="color: #666666; font-size: 14px;">Payment Status:</td>
                                  <td style="text-align: right;">
                                    <span style="background-color: #10b981; color: #ffffff; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">CONFIRMED</span>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                        
                        <h3 style="margin: 0 0 16px; color: #333333; font-size: 18px; font-weight: 600;">What's Next?</h3>
                        
                        <ul style="margin: 0 0 30px; padding-left: 20px; color: #333333; font-size: 16px; line-height: 1.8;">
                          <li>Your order is now being prepared for shipment</li>
                          <li>You'll receive a notification when your order is dispatched</li>
                          <li>Track your order status on our website anytime</li>
                        </ul>
                        
                        <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                          Thank you for choosing Purrkin Pet Store. We're excited to get your order to you!
                        </p>
                        
                        <!-- CTA Button -->
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td align="center" style="padding: 20px 0;">
                              <a href="https://purrkinpetsbh.com/orders" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">Track Your Order</a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                        <p style="margin: 0 0 8px; color: #666666; font-size: 14px;">Thank you for shopping with Purrkin Pet Store!</p>
                        <p style="margin: 0; color: #999999; font-size: 12px;">© 2025 Purrkin Pet Store. All rights reserved.</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    };
  }

  // payment_rejected
  return {
    subject: `Payment Issue - Order ${orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment Issue</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Payment Not Credited</h1>
                    </td>
                  </tr>
                  
                  <!-- Body -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                        Hello ${customerName},
                      </p>
                      
                      <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                        We regret to inform you that we were unable to verify the payment for your order. The payment was not credited to our account.
                      </p>
                      
                      <!-- Order Details Box -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef2f2; border: 2px solid #ef4444; border-radius: 8px; margin-bottom: 30px;">
                        <tr>
                          <td style="padding: 24px;">
                            <h2 style="margin: 0 0 16px; color: #ef4444; font-size: 18px; font-weight: 600;">Order Details</h2>
                            <table width="100%" cellpadding="8" cellspacing="0">
                              <tr>
                                <td style="color: #666666; font-size: 14px;">Order Number:</td>
                                <td style="color: #333333; font-size: 14px; font-weight: 600; text-align: right;">${orderNumber}</td>
                              </tr>
                              <tr>
                                <td style="color: #666666; font-size: 14px;">Total Amount:</td>
                                <td style="color: #333333; font-size: 14px; font-weight: 600; text-align: right;">${orderTotal} BHD</td>
                              </tr>
                              <tr>
                                <td style="color: #666666; font-size: 14px;">Order Date:</td>
                                <td style="color: #333333; font-size: 14px; font-weight: 600; text-align: right;">${orderDate}</td>
                              </tr>
                              <tr>
                                <td style="color: #666666; font-size: 14px;">Status:</td>
                                <td style="text-align: right;">
                                  <span style="background-color: #ef4444; color: #ffffff; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">CANCELLED</span>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                      
                      <h3 style="margin: 0 0 16px; color: #333333; font-size: 18px; font-weight: 600;">Why did this happen?</h3>
                      
                      <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                        Our verification team did not find a payment credit corresponding to your order. This could happen if:
                      </p>
                      
                      <ul style="margin: 0 0 30px; padding-left: 20px; color: #333333; font-size: 16px; line-height: 1.8;">
                        <li>The payment was sent to an incorrect account</li>
                        <li>There was an error during the transaction</li>
                        <li>The payment is still processing on your bank's end</li>
                      </ul>
                      
                      <h3 style="margin: 0 0 16px; color: #333333; font-size: 18px; font-weight: 600;">What should you do?</h3>
                      
                      <ul style="margin: 0 0 30px; padding-left: 20px; color: #333333; font-size: 16px; line-height: 1.8;">
                        <li>Check your bank account to verify if the payment was deducted</li>
                        <li>If deducted, please contact our support team with your payment proof</li>
                        <li>If not deducted, you can place a new order anytime</li>
                      </ul>
                      
                      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin-bottom: 30px; border-radius: 4px;">
                        <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                          <strong>Need Help?</strong><br>
                          Contact us at <a href="mailto:bhpurrkinpetsbh@gmail.com" style="color: #92400e; text-decoration: underline;">bhpurrkinpetsbh@gmail.com</a> or WhatsApp us at <strong>+973 XXXX XXXX</strong>
                        </p>
                      </div>
                      
                      <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                        We apologize for any inconvenience. We're here to help resolve this quickly.
                      </p>
                      
                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="https://purrkinpetsbh.com/shop" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">Continue Shopping</a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                      <p style="margin: 0 0 8px; color: #666666; font-size: 14px;">Thank you for shopping with Purrkin Pet Store!</p>
                      <p style="margin: 0; color: #999999; font-size: 12px;">© 2025 Purrkin Pet Store. All rights reserved.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  };
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: OrderEmailRequest = await req.json();
    console.log("Sending email:", requestData.type, "to:", requestData.customerEmail);

    const { subject, html } = getEmailTemplate(requestData);

    const { error } = await resend.emails.send({
      from: "Purrkin Pet Store <noreply@purrkinpetsbh.com>",
      to: [requestData.customerEmail],
      subject,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      throw error;
    }

    console.log("Email sent successfully:", requestData.type);

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-order-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
