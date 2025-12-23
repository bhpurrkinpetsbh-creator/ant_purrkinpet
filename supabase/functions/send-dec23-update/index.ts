import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const Resend = (await import("https://esm.sh/resend@4.0.0")).Resend;
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UpdateRequest {
  to: string[];
  cc?: string[];
  bannerBeforeBase64?: string;
  bannerAfterBase64?: string;
  carouselImage1Base64?: string;
  carouselImage2Base64?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: UpdateRequest = await req.json();
    console.log("Sending December 23 update email to:", requestData.to);

    const subject = "🐾 Purrkin Pets - December 23, 2025 Website Updates";

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Website Updates - December 23, 2025</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #1e3a5f 0%, #0d4f6e 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">🐾 Website Updates</h1>
                      <p style="margin: 10px 0 0; color: #f59e0b; font-size: 16px;">December 23, 2025</p>
                    </td>
                  </tr>
                  
                  <!-- Body -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                        Hello,
                      </p>
                      
                      <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                        We've made some improvements to your Purrkin Pets website today. Here's what's new:
                      </p>
                      
                      <!-- Update 1: Banner Readability -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #eff6ff; border: 2px solid #3b82f6; border-radius: 8px; margin-bottom: 20px;">
                        <tr>
                          <td style="padding: 24px;">
                            <h2 style="margin: 0 0 16px; color: #1d4ed8; font-size: 18px; font-weight: 600;">🎨 Flying Banner Text Readability</h2>
                            <p style="margin: 0 0 16px; color: #333333; font-size: 14px; line-height: 1.6;">
                              The "Free Delivery" flying banner now has <strong>blue text</strong> instead of white for much better readability on the orange background.
                            </p>
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td width="48%" style="padding: 8px; text-align: center;">
                                  <p style="margin: 0 0 8px; color: #dc2626; font-size: 12px; font-weight: 600;">❌ BEFORE</p>
                                  <img src="cid:banner-before" alt="Before - Hard to read" style="max-width: 100%; border-radius: 8px; border: 1px solid #ddd;" />
                                </td>
                                <td width="4%"></td>
                                <td width="48%" style="padding: 8px; text-align: center;">
                                  <p style="margin: 0 0 8px; color: #16a34a; font-size: 12px; font-weight: 600;">✅ AFTER</p>
                                  <img src="cid:banner-after" alt="After - Easy to read" style="max-width: 100%; border-radius: 8px; border: 1px solid #ddd;" />
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Update 2: New Carousel Images -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0fdf4; border: 2px solid #10b981; border-radius: 8px; margin-bottom: 30px;">
                        <tr>
                          <td style="padding: 24px;">
                            <h2 style="margin: 0 0 16px; color: #059669; font-size: 18px; font-weight: 600;">🖼️ New Home Page Carousel Images</h2>
                            <p style="margin: 0 0 16px; color: #333333; font-size: 14px; line-height: 1.6;">
                              Added two new promotional images to the home page carousel with blur background effect:
                            </p>
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td width="48%" style="padding: 8px; text-align: center;">
                                  <p style="margin: 0 0 8px; color: #059669; font-size: 12px; font-weight: 600;">🚚 Home Delivery</p>
                                  <img src="cid:carousel-delivery" alt="Home Delivery - Jahez & Talabat" style="max-width: 100%; border-radius: 8px; border: 1px solid #ddd;" />
                                </td>
                                <td width="4%"></td>
                                <td width="48%" style="padding: 8px; text-align: center;">
                                  <p style="margin: 0 0 8px; color: #059669; font-size: 12px; font-weight: 600;">🐕 Royal Canin Stock</p>
                                  <img src="cid:carousel-royalcanin" alt="Royal Canin Now in Stock" style="max-width: 100%; border-radius: 8px; border: 1px solid #ddd;" />
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                        These changes are now live on your website!
                      </p>
                      
                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="https://purrkinpetsbh.com" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">View Website</a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                      <p style="margin: 0 0 8px; color: #666666; font-size: 14px;">Continuous improvements for your pet store! 🐕🐈</p>
                      <p style="margin: 0 0 20px; color: #999999; font-size: 12px;">© 2025 Purrkin Pet Store. All rights reserved.</p>
                      
                      <!-- S.H.A.A.I Solutions Branding -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #e0e0e0; padding-top: 20px; margin-top: 10px;">
                        <tr>
                          <td align="center">
                            <p style="margin: 0 0 8px; color: #6b7280; font-size: 11px; letter-spacing: 0.5px;">
                              ✨ Designed, Thought & Crafted with 💙 by
                            </p>
                            <a href="https://ai.shaid360.com/" style="text-decoration: none;">
                              <span style="font-size: 16px; font-weight: 700; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                                S.H.A.A.I Solutions
                              </span>
                            </a>
                            <p style="margin: 8px 0 12px; color: #9ca3af; font-size: 10px; font-style: italic;">
                              Shaping Human & AI Intelligence
                            </p>
                            
                            <!-- Social Links -->
                            <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                              <tr>
                                <td width="100" style="padding: 0 16px; text-align: center; vertical-align: top;">
                                  <a href="https://instagram.com/ai360_with_shaid" style="display: inline-block; text-decoration: none;">
                                    <img src="https://cdn-icons-png.flaticon.com/512/174/174855.png" alt="Instagram" width="36" height="36" style="border-radius: 8px;" />
                                  </a>
                                  <p style="margin: 6px 0 0; color: #6b7280; font-size: 10px;">
                                    <a href="https://instagram.com/ai360_with_shaid" style="color: #6b7280; text-decoration: none;">@ai360_with_shaid</a>
                                  </p>
                                </td>
                                <td width="100" style="padding: 0 16px; text-align: center; vertical-align: top;">
                                  <a href="https://ai.shaid360.com/" style="display: inline-block; text-decoration: none;">
                                    <img src="https://cdn-icons-png.flaticon.com/512/1006/1006771.png" alt="Website" width="36" height="36" style="border-radius: 8px;" />
                                  </a>
                                  <p style="margin: 6px 0 0; color: #6b7280; font-size: 10px;">
                                    <a href="https://ai.shaid360.com/" style="color: #6b7280; text-decoration: none;">ai.shaid360.com</a>
                                  </p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    const emailOptions: any = {
      from: "Purrkin Pet Store <noreply@purrkinpetsbh.com>",
      to: requestData.to,
      subject,
      html,
      attachments: [],
    };

    if (requestData.cc && requestData.cc.length > 0) {
      emailOptions.cc = requestData.cc;
    }

    // Add images as inline attachments
    if (requestData.bannerBeforeBase64) {
      emailOptions.attachments.push({
        filename: "banner-before.png",
        content: requestData.bannerBeforeBase64,
        content_id: "banner-before",
      });
    }
    if (requestData.bannerAfterBase64) {
      emailOptions.attachments.push({
        filename: "banner-after.png",
        content: requestData.bannerAfterBase64,
        content_id: "banner-after",
      });
    }
    if (requestData.carouselImage1Base64) {
      emailOptions.attachments.push({
        filename: "carousel-delivery.png",
        content: requestData.carouselImage1Base64,
        content_id: "carousel-delivery",
      });
    }
    if (requestData.carouselImage2Base64) {
      emailOptions.attachments.push({
        filename: "carousel-royalcanin.jpg",
        content: requestData.carouselImage2Base64,
        content_id: "carousel-royalcanin",
      });
    }

    const { error } = await resend.emails.send(emailOptions);

    if (error) {
      console.error("Resend error:", error);
      throw error;
    }

    console.log("December 23 update email sent successfully to:", requestData.to);

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-dec23-update function:", error);
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
