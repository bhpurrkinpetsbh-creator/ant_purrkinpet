-- Migration: Add offer pricing fields to products table
-- This implements a 3-tier pricing strategy:
-- 1. compare_at_price = MRP/Cost Price (already exists)
-- 2. price = Website/Regular Price (already exists)
-- 3. offer_price = Special Offer Price (NEW)
-- 4. is_on_offer = Toggle to enable/disable offer (NEW)

-- Add offer_price column
ALTER TABLE products ADD COLUMN IF NOT EXISTS offer_price DECIMAL(10, 3);

-- Add is_on_offer toggle column
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_on_offer BOOLEAN DEFAULT false;

-- Create index for faster offer queries
CREATE INDEX IF NOT EXISTS idx_products_is_on_offer ON products(is_on_offer) WHERE is_on_offer = true;

-- Add comment for documentation
COMMENT ON COLUMN products.offer_price IS 'Special discounted price when product is on offer';
COMMENT ON COLUMN products.is_on_offer IS 'Toggle to enable/disable offer price display';
