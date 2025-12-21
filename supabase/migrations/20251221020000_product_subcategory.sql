-- Migration: Add Subcategory to Products
-- Description: Adds a subcategory text field to products for categorization

-- 1. Add subcategory column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS subcategory TEXT;

-- 2. Create index for faster queries on subcategory
CREATE INDEX IF NOT EXISTS idx_products_subcategory ON products(subcategory);

-- 3. Add comment for documentation
COMMENT ON COLUMN products.subcategory IS 'Product subcategory (e.g., Dry Food, Wet Food, Treats, Toys, etc.)';
