
import fs from 'fs';
import path from 'path';

// Read .env file manually since we don't want to rely on dotenv package
const envPath = path.resolve(process.cwd(), '.env');
let resendApiKey = '';

try {
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf8');
        const lines = envConfig.split('\n');
        for (const line of lines) {
            const match = line.match(/^RESEND_API_KEY=(.*)$/);
            if (match) {
                resendApiKey = match[1].trim();
                // Remove quotes if present
                if ((resendApiKey.startsWith('"') && resendApiKey.endsWith('"')) ||
                    (resendApiKey.startsWith("'") && resendApiKey.endsWith("'"))) {
                    resendApiKey = resendApiKey.slice(1, -1);
                }
                break;
            }
        }
    }
} catch (e) {
    console.error('Error reading .env file:', e);
}

if (!resendApiKey) {
    console.error('❌ Error: RESEND_API_KEY not found in .env file');
    process.exit(1);
}

const emailData = {
    from: "Purrkin Pet Store <noreply@purrkinpetsbh.com>",
    to: ["mail2shaid@gmail.com"],
    subject: "Purrkin Pets - December 30, 2025 Website Updates",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Website Updates - December 30, 2025</title>
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
                      <p style="margin: 10px 0 0; color: #f59e0b; font-size: 16px;">December 30, 2025</p>
                    </td>
                  </tr>
                  
                  <!-- Body -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                        Hello,
                      </p>
                      
                      <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                        We've just deployed a major upgrade to the Purrkin Pets experience! Here are the details:
                      </p>
                      
                      <!-- Feature 1: Header Redesign -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0fdf4; border: 2px solid #10b981; border-radius: 8px; margin-bottom: 20px;">
                        <tr>
                          <td style="padding: 24px;">
                            <h2 style="margin: 0 0 16px; color: #059669; font-size: 18px; font-weight: 600;">🎨 Header & Navigation Redesign ("Modern Pill")</h2>
                            <ul style="margin: 0; padding-left: 20px; color: #333333; font-size: 14px; line-height: 1.8;">
                              <li><strong>Interactive Pill Links:</strong> Navigation items now feature a rounded "pill" design with soft hover backgrounds.</li>
                              <li><strong>Playful Animations:</strong> Icons bounce and scale up on hover for a lively feel.</li>
                              <li><strong>Two-Row Layout:</strong> Separation of actions (Search, Cart) and Navigation for a spacious, clean look.</li>
                              <li><strong>Restored Icons:</strong> Wishlist, Cart, and User icons are now permanently visible.</li>
                              <li><strong>New Categories:</strong> Added "Dogs & Cats", "Rabbits", and "Turtles" to the main menu.</li>
                            </ul>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Feature 2: Subcategories -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; margin-bottom: 20px;">
                        <tr>
                          <td style="padding: 24px;">
                            <h2 style="margin: 0 0 16px; color: #d97706; font-size: 18px; font-weight: 600;">📂 Subcategories Implementation</h2>
                            <ul style="margin: 0; padding-left: 20px; color: #333333; font-size: 14px; line-height: 1.8;">
                              <li><strong>Full Database Support:</strong> Subcategories are now dynamically managed in the database.</li>
                              <li><strong>Admin Management:</strong> Create, Edit, and Delete subcategories directly from the Admin Panel.</li>
                              <li><strong>Mega Menu Integration:</strong> Hovering a category now shows a rich dropdown of subcategories.</li>
                            </ul>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                        These changes bring a polished, premium feel to the store. Let us know what you think!
                      </p>
                      
                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="https://purrkinpetsbh.com" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">Visit Purrkin Pets</a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                      <p style="margin: 0 0 8px; color: #666666; font-size: 14px;">Better design, happier pets! 🐕🐈</p>
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
    `
};

console.log('📨 Sending email via Resend API...');

fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(emailData)
})
    .then(async response => {
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Email sent successfully!');
            console.log('ID:', data.id);
        } else {
            const errorText = await response.text();
            console.error('❌ Error sending email:', response.status, response.statusText);
            console.error('Details:', errorText);
        }
    })
    .catch(error => {
        console.error('❌ Network error:', error);
    });
