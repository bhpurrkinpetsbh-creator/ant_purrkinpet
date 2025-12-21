-- Migration: Add Product Expiration Date
-- Description: Adds expiration_date column to products for tracking product expiry

-- 1. Add expiration_date column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS expiration_date DATE;

-- 2. Create index for faster queries on expiration date
CREATE INDEX IF NOT EXISTS idx_products_expiration_date ON products(expiration_date);

-- 3. Create a view for products expiring within the next 2 months
CREATE OR REPLACE VIEW expiring_products_view AS
SELECT 
  p.id,
  p.name,
  p.sku,
  p.image_url,
  p.price,
  p.stock_quantity,
  p.expiration_date,
  p.is_active,
  c.name as category_name,
  b.name as brand_name,
  CASE 
    WHEN p.expiration_date <= CURRENT_DATE THEN 'expired'
    WHEN p.expiration_date <= CURRENT_DATE + INTERVAL '1 month' THEN 'critical'
    WHEN p.expiration_date <= CURRENT_DATE + INTERVAL '2 months' THEN 'warning'
    ELSE 'ok'
  END as expiry_status,
  p.expiration_date - CURRENT_DATE as days_until_expiry
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN brands b ON p.brand_id = b.id
WHERE p.expiration_date IS NOT NULL
ORDER BY p.expiration_date ASC;

-- Grant access to the view (admin only via RLS on underlying table)
GRANT SELECT ON expiring_products_view TO authenticated;

-- 4. Update product_history trigger to track expiration_date changes
CREATE OR REPLACE FUNCTION log_product_updated()
RETURNS TRIGGER AS $$
DECLARE
  v_changed_fields JSONB := '{}'::jsonb;
  v_action_type TEXT := 'updated';
  v_notes TEXT := '';
BEGIN
  -- Check for specific field changes and build changed_fields object
  
  -- Name change
  IF NEW.name IS DISTINCT FROM OLD.name THEN
    v_changed_fields := v_changed_fields || jsonb_build_object('name', 
      jsonb_build_object('old', OLD.name, 'new', NEW.name));
  END IF;
  
  -- Description change
  IF NEW.description IS DISTINCT FROM OLD.description THEN
    v_changed_fields := v_changed_fields || jsonb_build_object('description', 
      jsonb_build_object('old', OLD.description, 'new', NEW.description));
  END IF;
  
  -- Price change
  IF NEW.price IS DISTINCT FROM OLD.price THEN
    v_changed_fields := v_changed_fields || jsonb_build_object('price', 
      jsonb_build_object('old', OLD.price, 'new', NEW.price));
    v_action_type := 'price_changed';
    v_notes := 'Price changed from ' || COALESCE(OLD.price::text, 'null') || ' to ' || NEW.price::text || ' BHD';
  END IF;
  
  -- Compare at price (sale price) change
  IF NEW.compare_at_price IS DISTINCT FROM OLD.compare_at_price THEN
    v_changed_fields := v_changed_fields || jsonb_build_object('compare_at_price', 
      jsonb_build_object('old', OLD.compare_at_price, 'new', NEW.compare_at_price));
    IF v_action_type = 'updated' THEN
      v_notes := 'Sale price updated';
    END IF;
  END IF;
  
  -- Category change
  IF NEW.category_id IS DISTINCT FROM OLD.category_id THEN
    v_changed_fields := v_changed_fields || jsonb_build_object('category_id', 
      jsonb_build_object('old', OLD.category_id, 'new', NEW.category_id));
    v_action_type := 'category_changed';
    v_notes := 'Category changed';
  END IF;
  
  -- Brand change
  IF NEW.brand_id IS DISTINCT FROM OLD.brand_id THEN
    v_changed_fields := v_changed_fields || jsonb_build_object('brand_id', 
      jsonb_build_object('old', OLD.brand_id, 'new', NEW.brand_id));
    v_action_type := 'brand_changed';
    v_notes := 'Brand changed';
  END IF;
  
  -- Active status change (special handling)
  IF NEW.is_active IS DISTINCT FROM OLD.is_active THEN
    v_changed_fields := v_changed_fields || jsonb_build_object('is_active', 
      jsonb_build_object('old', COALESCE(OLD.is_active, true), 'new', COALESCE(NEW.is_active, true)));
    IF COALESCE(NEW.is_active, true) = true THEN
      v_action_type := 'activated';
      v_notes := 'Product activated';
    ELSE
      v_action_type := 'deactivated';
      v_notes := 'Product deactivated';
    END IF;
  END IF;
  
  -- Featured status change (special handling)
  IF NEW.is_featured IS DISTINCT FROM OLD.is_featured THEN
    v_changed_fields := v_changed_fields || jsonb_build_object('is_featured', 
      jsonb_build_object('old', COALESCE(OLD.is_featured, false), 'new', COALESCE(NEW.is_featured, false)));
    -- Only override action_type if not already set to activated/deactivated
    IF v_action_type = 'updated' THEN
      IF COALESCE(NEW.is_featured, false) = true THEN
        v_action_type := 'featured';
        v_notes := 'Product marked as featured';
      ELSE
        v_action_type := 'unfeatured';
        v_notes := 'Product removed from featured';
      END IF;
    END IF;
  END IF;
  
  -- Stock quantity change
  IF NEW.stock_quantity IS DISTINCT FROM OLD.stock_quantity THEN
    v_changed_fields := v_changed_fields || jsonb_build_object('stock_quantity', 
      jsonb_build_object('old', COALESCE(OLD.stock_quantity, 0), 'new', COALESCE(NEW.stock_quantity, 0)));
  END IF;
  
  -- SKU change
  IF NEW.sku IS DISTINCT FROM OLD.sku THEN
    v_changed_fields := v_changed_fields || jsonb_build_object('sku', 
      jsonb_build_object('old', OLD.sku, 'new', NEW.sku));
  END IF;
  
  -- Image URL change
  IF NEW.image_url IS DISTINCT FROM OLD.image_url THEN
    v_changed_fields := v_changed_fields || jsonb_build_object('image_url', 
      jsonb_build_object('old', OLD.image_url, 'new', NEW.image_url));
  END IF;
  
  -- Expiration date change
  IF NEW.expiration_date IS DISTINCT FROM OLD.expiration_date THEN
    v_changed_fields := v_changed_fields || jsonb_build_object('expiration_date', 
      jsonb_build_object('old', OLD.expiration_date::text, 'new', NEW.expiration_date::text));
    IF v_action_type = 'updated' THEN
      v_notes := 'Expiration date updated';
    END IF;
  END IF;
  
  -- Only insert if there are actual changes
  IF v_changed_fields != '{}'::jsonb THEN
    INSERT INTO product_history (
      product_id,
      product_name,
      product_sku,
      action_type,
      changed_fields,
      performed_by,
      notes
    ) VALUES (
      NEW.id,
      NEW.name,
      NEW.sku,
      v_action_type,
      v_changed_fields,
      auth.uid(),
      CASE WHEN v_notes = '' THEN 'Product updated' ELSE v_notes END
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Add comment for documentation
COMMENT ON COLUMN products.expiration_date IS 'Product expiration/best before date - visible only to admins';
