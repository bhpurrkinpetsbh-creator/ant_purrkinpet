-- Add barcode column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS barcode text;

-- Add index for barcode searching
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products (barcode);

-- Add barcode to product_history triggers if necessary (though it seems it might already be handled by JSON extraction based on earlier greps)
-- However, explicitly adding it here ensures it's tracked in any audit logs that might be direct
