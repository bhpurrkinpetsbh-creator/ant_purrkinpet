import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// Using ESM CDN for Resend
const Resend = (await import("https://esm.sh/resend@4.0.0")).Resend;

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FeatureUpdateRequest {
  to: string[];
  cc?: string[];
  imageBase64?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: FeatureUpdateRequest = await req.json();
    console.log("Sending feature update email to:", requestData.to);

    const subject = "🐾 Purrkin Pets - December 22, 2025 Feature Update";

    // Check if we have an image to embed
    const hasImage = requestData.imageBase64 && requestData.imageBase64.length > 0;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Feature Update - December 2025</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #1e3a5f 0%, #0d4f6e 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">🐾 Feature Update</h1>
                      <p style="margin: 10px 0 0; color: #f59e0b; font-size: 16px;">December 22, 2025</p>
                    </td>
                  </tr>
                  
                  ${hasImage ? `
                  <!-- Image Banner -->
                  <tr>
                    <td style="padding: 0;">
                      <img src="cid:feature-banner" alt="Feature Update" style="width: 100%; height: auto; display: block;" />
                    </td>
                  </tr>
                  ` : ''}
                  
                  <!-- Body -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                        Hello,
                      </p>
                      
                      <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                        We're excited to share the latest updates to your Purrkin Pets admin panel! Here's what's new:
                      </p>
                      
                      <!-- Feature 1 -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0fdf4; border: 2px solid #10b981; border-radius: 8px; margin-bottom: 20px;">
                        <tr>
                          <td style="padding: 24px;">
                            <h2 style="margin: 0 0 16px; color: #10b981; font-size: 18px; font-weight: 600;">📤 Bulk Product Upload</h2>
                            <ul style="margin: 0; padding-left: 20px; color: #333333; font-size: 14px; line-height: 1.8;">
                              <li>Upload up to <strong>15 products at once</strong> via Excel</li>
                              <li>Drag & drop template with guided instructions</li>
                              <li>Auto-match product images by number (1.jpg, 2.png...)</li>
                              <li>Auto-generate SKU numbers for new products</li>
                              <li>Supports all categories: Dogs, Cats, Birds, Fish, Small Pets</li>
                            </ul>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Feature 2 -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; margin-bottom: 30px;">
                        <tr>
                          <td style="padding: 24px;">
                            <h2 style="margin: 0 0 16px; color: #d97706; font-size: 18px; font-weight: 600;">☑️ Multi-Select Product Management</h2>
                            <ul style="margin: 0; padding-left: 20px; color: #333333; font-size: 14px; line-height: 1.8;">
                              <li>Select multiple products with checkboxes</li>
                              <li>One-click bulk delete selected items</li>
                              <li>Products moved to trash for 30-day recovery</li>
                              <li>Streamlined inventory management</li>
                            </ul>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                        These features are now live in your admin panel. Log in to try them out!
                      </p>
                      
                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="https://purrkinpetsbh.com/admin/products" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">Go to Admin Panel</a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                      <p style="margin: 0 0 8px; color: #666666; font-size: 14px;">Making pet product management easier! 🐕🐈</p>
                      <p style="margin: 0; color: #999999; font-size: 12px;">© 2025 Purrkin Pet Store. All rights reserved.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    // Prepare email options
    const emailOptions: any = {
      from: "Purrkin Pet Store <noreply@purrkinpetsbh.com>",
      to: requestData.to,
      subject,
      html,
    };

    // Add CC if provided
    if (requestData.cc && requestData.cc.length > 0) {
      emailOptions.cc = requestData.cc;
    }

    // Add image as inline attachment if provided
    if (hasImage) {
      emailOptions.attachments = [
        {
          filename: "feature-update.png",
          content: requestData.imageBase64,
          content_id: "feature-banner",
        },
      ];
    }

    const { error } = await resend.emails.send(emailOptions);

    if (error) {
      console.error("Resend error:", error);
      throw error;
    }

    console.log("Feature update email sent successfully to:", requestData.to);

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
    console.error("Error in send-feature-update function:", error);
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
