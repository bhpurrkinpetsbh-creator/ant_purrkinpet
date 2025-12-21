import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Using ESM CDN for Resend to avoid npm resolution in local build
const Resend = (await import("https://esm.sh/resend@4.0.0")).Resend;

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Admin email addresses to notify
const ADMIN_EMAILS = [
  "mail2shaid@gmail.com",
  "purrkinpets@gmail.com"
];

interface ExpiringProduct {
  id: string;
  name: string;
  sku: string | null;
  image_url: string;
  price: number;
  stock_quantity: number | null;
  expiration_date: string;
  category_name: string | null;
  brand_name: string | null;
  expiry_status: string;
  days_until_expiry: number;
}

const generateEmailHtml = (products: ExpiringProduct[]): string => {
  const criticalProducts = products.filter(p => p.expiry_status === 'critical' || p.days_until_expiry < 0);
  const warningProducts = products.filter(p => p.expiry_status === 'warning');

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const generateProductRow = (product: ExpiringProduct) => {
    const isExpired = product.days_until_expiry < 0;
    const statusColor = isExpired ? '#ef4444' : (product.expiry_status === 'critical' ? '#ef4444' : '#f97316');
    const statusBgColor = isExpired ? '#fef2f2' : (product.expiry_status === 'critical' ? '#fef2f2' : '#fff7ed');
    const statusText = isExpired ? 'EXPIRED' : (product.expiry_status === 'critical' ? `${product.days_until_expiry} days left` : `${product.days_until_expiry} days left`);

    return `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 16px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <img src="${product.image_url}" alt="${product.name}" style="width: 48px; height: 48px; object-fit: cover; border-radius: 8px;" />
            <div>
              <div style="font-weight: 600; color: #1f2937;">${product.name}</div>
              ${product.sku ? `<div style="font-size: 12px; color: #6b7280;">SKU: ${product.sku}</div>` : ''}
            </div>
          </div>
        </td>
        <td style="padding: 16px; text-align: center; color: #6b7280;">${product.category_name || '-'}</td>
        <td style="padding: 16px; text-align: center; font-weight: 600; color: #1f2937;">${formatDate(product.expiration_date)}</td>
        <td style="padding: 16px; text-align: center;">
          <span style="background-color: ${statusBgColor}; color: ${statusColor}; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">
            ${statusText}
          </span>
        </td>
        <td style="padding: 16px; text-align: center; color: #6b7280;">${product.stock_quantity ?? 0}</td>
      </tr>
    `;
  };

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Product Expiration Alert</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="700" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">⚠️ Product Expiration Alert</h1>
                    <p style="margin: 12px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
                      ${products.length} products require attention
                    </p>
                  </td>
                </tr>
                
                <!-- Summary -->
                <tr>
                  <td style="padding: 30px;">
                    <div style="display: flex; gap: 20px; margin-bottom: 30px;">
                      ${criticalProducts.length > 0 ? `
                        <div style="flex: 1; background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; text-align: center;">
                          <div style="font-size: 32px; font-weight: 700; color: #dc2626;">${criticalProducts.length}</div>
                          <div style="font-size: 14px; color: #991b1b;">Critical (≤30 days)</div>
                        </div>
                      ` : ''}
                      ${warningProducts.length > 0 ? `
                        <div style="flex: 1; background-color: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 20px; text-align: center;">
                          <div style="font-size: 32px; font-weight: 700; color: #ea580c;">${warningProducts.length}</div>
                          <div style="font-size: 14px; color: #9a3412;">Warning (≤60 days)</div>
                        </div>
                      ` : ''}
                    </div>

                    ${criticalProducts.length > 0 ? `
                      <!-- Critical Products -->
                      <h2 style="margin: 0 0 16px; color: #dc2626; font-size: 18px; font-weight: 600;">🔴 Critical - Expiring within 30 days or Expired</h2>
                      <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #fecaca; border-radius: 8px; margin-bottom: 30px; overflow: hidden;">
                        <thead>
                          <tr style="background-color: #fef2f2;">
                            <th style="padding: 12px 16px; text-align: left; color: #991b1b; font-weight: 600;">Product</th>
                            <th style="padding: 12px 16px; text-align: center; color: #991b1b; font-weight: 600;">Category</th>
                            <th style="padding: 12px 16px; text-align: center; color: #991b1b; font-weight: 600;">Expiry Date</th>
                            <th style="padding: 12px 16px; text-align: center; color: #991b1b; font-weight: 600;">Status</th>
                            <th style="padding: 12px 16px; text-align: center; color: #991b1b; font-weight: 600;">Stock</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${criticalProducts.map(generateProductRow).join('')}
                        </tbody>
                      </table>
                    ` : ''}

                    ${warningProducts.length > 0 ? `
                      <!-- Warning Products -->
                      <h2 style="margin: 0 0 16px; color: #ea580c; font-size: 18px; font-weight: 600;">🟠 Warning - Expiring within 60 days</h2>
                      <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #fed7aa; border-radius: 8px; margin-bottom: 30px; overflow: hidden;">
                        <thead>
                          <tr style="background-color: #fff7ed;">
                            <th style="padding: 12px 16px; text-align: left; color: #9a3412; font-weight: 600;">Product</th>
                            <th style="padding: 12px 16px; text-align: center; color: #9a3412; font-weight: 600;">Category</th>
                            <th style="padding: 12px 16px; text-align: center; color: #9a3412; font-weight: 600;">Expiry Date</th>
                            <th style="padding: 12px 16px; text-align: center; color: #9a3412; font-weight: 600;">Status</th>
                            <th style="padding: 12px 16px; text-align: center; color: #9a3412; font-weight: 600;">Stock</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${warningProducts.map(generateProductRow).join('')}
                        </tbody>
                      </table>
                    ` : ''}

                    <p style="margin: 0 0 20px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                      This is an automated daily check. Please take appropriate action for these products.
                    </p>

                    <!-- CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="https://purrkinpetsbh.com/admin/products" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">View All Products</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                    <p style="margin: 0 0 8px; color: #666666; font-size: 14px;">Purrkin Pet Store - Admin Notification</p>
                    <p style="margin: 0; color: #999999; font-size: 12px;">Generated on ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Checking for expiring products...");

    // Query products expiring within the next 2 months
    const today = new Date();
    const twoMonthsFromNow = new Date(today);
    twoMonthsFromNow.setMonth(twoMonthsFromNow.getMonth() + 2);

    const { data: expiringProducts, error: queryError } = await supabase
      .from('products')
      .select(`
        id,
        name,
        sku,
        image_url,
        price,
        stock_quantity,
        expiration_date,
        categories (name),
        brands (name)
      `)
      .not('expiration_date', 'is', null)
      .lte('expiration_date', twoMonthsFromNow.toISOString().split('T')[0])
      .order('expiration_date', { ascending: true });

    if (queryError) {
      console.error("Error querying expiring products:", queryError);
      throw queryError;
    }

    if (!expiringProducts || expiringProducts.length === 0) {
      console.log("No expiring products found.");
      return new Response(
        JSON.stringify({ success: true, message: "No expiring products found", count: 0 }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Transform data to match our interface
    const products: ExpiringProduct[] = expiringProducts.map((p: any) => {
      const expiry = new Date(p.expiration_date);
      const diffTime = expiry.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let expiry_status = 'ok';
      if (diffDays < 0) expiry_status = 'expired';
      else if (diffDays <= 30) expiry_status = 'critical';
      else if (diffDays <= 60) expiry_status = 'warning';

      return {
        id: p.id,
        name: p.name,
        sku: p.sku,
        image_url: p.image_url,
        price: p.price,
        stock_quantity: p.stock_quantity,
        expiration_date: p.expiration_date,
        category_name: p.categories?.name || null,
        brand_name: p.brands?.name || null,
        expiry_status,
        days_until_expiry: diffDays
      };
    });

    console.log(`Found ${products.length} expiring products`);

    // Generate and send email
    const htmlContent = generateEmailHtml(products);

    const { error: emailError } = await resend.emails.send({
      from: "Purrkin Pet Store <noreply@purrkinpetsbh.com>",
      to: ADMIN_EMAILS,
      subject: `⚠️ Product Expiration Alert - ${products.length} products need attention`,
      html: htmlContent,
    });

    if (emailError) {
      console.error("Error sending email:", emailError);
      throw emailError;
    }

    console.log(`Email sent successfully to ${ADMIN_EMAILS.join(', ')}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Email sent for ${products.length} expiring products`,
        count: products.length,
        recipients: ADMIN_EMAILS
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in check-expiring-products function:", error);
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
