import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// Using ESM CDN for Resend
const Resend = (await import("https://esm.sh/resend@4.0.0")).Resend;

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UpdateRequest {
  to: string[];
  cc?: string[];
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: UpdateRequest = await req.json();
    console.log("Sending Dec 24 feature update email to:", requestData.to);

    const subject = "🐾 Purrkin Pets - December 24, 2025 Update: Dynamic Category Management & New Features";

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Feature Update - December 24, 2025</title>
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
                      <p style="margin: 10px 0 0; color: #f59e0b; font-size: 16px;">December 24, 2025</p>
                    </td>
                  </tr>
                  
                  <!-- Body -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                        Hello,
                      </p>
                      
                      <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                        We're excited to share the latest updates to Purrkin Pets! Here's what's new:
                      </p>
                      
                      <!-- Feature 1: New Categories -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; margin-bottom: 20px;">
                        <tr>
                          <td style="padding: 24px;">
                            <h2 style="margin: 0 0 16px; color: #d97706; font-size: 18px; font-weight: 600;">🐰🐢 New Pet Categories Added</h2>
                            <p style="margin: 0; color: #333333; font-size: 14px; line-height: 1.6;">
                              We've expanded our pet categories to include <strong>Rabbits</strong> and <strong>Turtles</strong>! You can now add products for these adorable pets.
                            </p>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Feature 2: Category Management - HIGHLIGHTED -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0fdf4; border: 3px solid #10b981; border-radius: 8px; margin-bottom: 20px;">
                        <tr>
                          <td style="padding: 28px;">
                            <h2 style="margin: 0 0 16px; color: #059669; font-size: 20px; font-weight: 700;">⭐ NEW: Category Management System</h2>
                            <p style="margin: 0 0 16px; color: #333333; font-size: 15px; line-height: 1.6; font-weight: 500;">
                              Great news! You no longer need to add subcategories from the "Add New Product" button in Product Management.
                            </p>
                            <p style="margin: 0 0 16px; color: #333333; font-size: 14px; line-height: 1.6;">
                              A dedicated <strong>"Categories" tab</strong> has been added to the Product Management page where you can:
                            </p>
                            <ul style="margin: 0; padding-left: 20px; color: #333333; font-size: 14px; line-height: 2;">
                              <li>✅ <strong>Add new categories</strong> directly</li>
                              <li>✅ <strong>Add new subcategories</strong> under any category</li>
                              <li>✅ <strong>Edit</strong> existing categories and subcategories</li>
                              <li>✅ <strong>Delete</strong> categories and subcategories (with product protection)</li>
                              <li>✅ <strong>Toggle</strong> category active/inactive status</li>
                              <li>✅ <strong>View</strong> product counts per category</li>
                            </ul>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Feature 3: UX Improvements -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fdf4ff; border: 2px solid #a855f7; border-radius: 8px; margin-bottom: 30px;">
                        <tr>
                          <td style="padding: 24px;">
                            <h2 style="margin: 0 0 16px; color: #7c3aed; font-size: 18px; font-weight: 600;">✨ User Experience Improvements</h2>
                            <ul style="margin: 0; padding-left: 20px; color: #333333; font-size: 14px; line-height: 1.8;">
                              <li><strong>Scroll Position Preservation:</strong> When editing products in admin, the page remembers your position</li>
                              <li><strong>Free Shipping Banner:</strong> Updated with improved contrast for better readability</li>
                            </ul>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                        These features are now live! Log in to try them out.
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
                      <p style="margin: 0 0 8px; color: #666666; font-size: 14px;">Making pet product management easier! 🐕🐈🐰🐢</p>
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

    const { error } = await resend.emails.send(emailOptions);

    if (error) {
      console.error("Resend error:", error);
      throw error;
    }

    console.log("Dec 24 feature update email sent successfully to:", requestData.to);

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
    console.error("Error in send-dec24-update function:", error);
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
