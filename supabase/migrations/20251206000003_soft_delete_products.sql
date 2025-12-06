-- Migration: Soft Delete System for Products
-- Description: Implements soft delete with 30-day retention and restore capability

-- 1. Create deleted_products table to store soft-deleted products
CREATE TABLE IF NOT EXISTS deleted_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL,
  product_data JSONB NOT NULL, -- Store complete product data
  deleted_at TIMESTAMPTZ DEFAULT now(),
  deleted_by UUID REFERENCES auth.users(id),
  deletion_reason TEXT,
  auto_purge_date TIMESTAMPTZ -- Will be set via trigger
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_deleted_products_deleted_at ON deleted_products(deleted_at DESC);
CREATE INDEX IF NOT EXISTS idx_deleted_products_auto_purge ON deleted_products(auto_purge_date);
CREATE INDEX IF NOT EXISTS idx_deleted_products_product_id ON deleted_products(product_id);

-- 2. Trigger to automatically set auto_purge_date
CREATE OR REPLACE FUNCTION set_auto_purge_date()
RETURNS TRIGGER AS $$
BEGIN
  NEW.auto_purge_date := NEW.deleted_at + INTERVAL '30 days';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_auto_purge_date ON deleted_products;
CREATE TRIGGER trigger_set_auto_purge_date
  BEFORE INSERT ON deleted_products
  FOR EACH ROW
  EXECUTE FUNCTION set_auto_purge_date();

-- 3. Function to soft delete a product
CREATE OR REPLACE FUNCTION soft_delete_product(
  p_product_id UUID,
  p_deletion_reason TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_product_data JSONB;
BEGIN
  -- Get complete product data
  SELECT row_to_json(p.*) INTO v_product_data
  FROM products p
  WHERE p.id = p_product_id;

  IF v_product_data IS NULL THEN
    RAISE EXCEPTION 'Product not found';
  END IF;

  -- Insert into deleted_products
  INSERT INTO deleted_products (
    product_id,
    product_data,
    deleted_by,
    deletion_reason
  ) VALUES (
    p_product_id,
    v_product_data,
    auth.uid(),
    p_deletion_reason
  );

  -- Delete from products table
  DELETE FROM products WHERE id = p_product_id;

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to soft delete product: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Function to restore a deleted product
CREATE OR REPLACE FUNCTION restore_deleted_product(
  p_deleted_product_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_product_data JSONB;
  v_product_id UUID;
BEGIN
  -- Get the deleted product data
  SELECT product_data, product_id INTO v_product_data, v_product_id
  FROM deleted_products
  WHERE id = p_deleted_product_id;

  IF v_product_data IS NULL THEN
    RAISE EXCEPTION 'Deleted product not found';
  END IF;

  -- Check if product with same ID already exists
  IF EXISTS (SELECT 1 FROM products WHERE id = v_product_id) THEN
    RAISE EXCEPTION 'A product with this ID already exists';
  END IF;

  -- Restore product to products table
  INSERT INTO products (
    id,
    name,
    slug,
    description,
    price,
    compare_at_price,
    cost_per_item,
    sku,
    barcode,
    stock_quantity,
    low_stock_threshold,
    track_quantity,
    continue_selling,
    category_id,
    brand_id,
    tags,
    image_url,
    additional_images,
    weight,
    dimensions,
    is_active,
    is_featured,
    meta_title,
    meta_description,
    created_at,
    updated_at
  )
  SELECT
    (v_product_data->>'id')::UUID,
    v_product_data->>'name',
    v_product_data->>'slug',
    v_product_data->>'description',
    (v_product_data->>'price')::DECIMAL,
    (v_product_data->>'compare_at_price')::DECIMAL,
    (v_product_data->>'cost_per_item')::DECIMAL,
    v_product_data->>'sku',
    v_product_data->>'barcode',
    (v_product_data->>'stock_quantity')::INTEGER,
    (v_product_data->>'low_stock_threshold')::INTEGER,
    (v_product_data->>'track_quantity')::BOOLEAN,
    (v_product_data->>'continue_selling')::BOOLEAN,
    (v_product_data->>'category_id')::UUID,
    (v_product_data->>'brand_id')::UUID,
    v_product_data->'tags',
    v_product_data->>'image_url',
    v_product_data->'additional_images',
    (v_product_data->>'weight')::DECIMAL,
    v_product_data->'dimensions',
    (v_product_data->>'is_active')::BOOLEAN,
    (v_product_data->>'is_featured')::BOOLEAN,
    v_product_data->>'meta_title',
    v_product_data->>'meta_description',
    (v_product_data->>'created_at')::TIMESTAMPTZ,
    now();

  -- Remove from deleted_products
  DELETE FROM deleted_products WHERE id = p_deleted_product_id;

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to restore product: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Function to permanently delete a product (no recovery)
CREATE OR REPLACE FUNCTION permanently_delete_product(
  p_deleted_product_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  -- Permanently remove from deleted_products
  DELETE FROM deleted_products WHERE id = p_deleted_product_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Deleted product not found';
  END IF;

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to permanently delete product: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Function to auto-purge products older than 30 days
CREATE OR REPLACE FUNCTION auto_purge_old_deleted_products()
RETURNS INTEGER AS $$
DECLARE
  v_purged_count INTEGER;
BEGIN
  -- Delete products that have passed their auto_purge_date
  DELETE FROM deleted_products
  WHERE auto_purge_date <= now();

  GET DIAGNOSTICS v_purged_count = ROW_COUNT;

  RETURN v_purged_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create a cron job to run auto-purge daily (requires pg_cron extension)
-- Note: This requires pg_cron extension to be enabled in Supabase
-- You can also run this manually or via a scheduled edge function

-- Enable pg_cron extension (if not already enabled)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule auto-purge to run daily at 2 AM
-- SELECT cron.schedule(
--   'auto-purge-deleted-products',
--   '0 2 * * *', -- Every day at 2 AM
--   'SELECT auto_purge_old_deleted_products();'
-- );

-- 8. RLS Policies for deleted_products table
ALTER TABLE deleted_products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view deleted products" ON deleted_products;
DROP POLICY IF EXISTS "Admins can delete permanently" ON deleted_products;

-- Admins can view all deleted products
CREATE POLICY "Admins can view deleted products"
  ON deleted_products
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Admins can permanently delete from deleted_products
CREATE POLICY "Admins can delete permanently"
  ON deleted_products
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- 9. Create view for deleted products with days remaining
CREATE OR REPLACE VIEW deleted_products_view AS
SELECT
  dp.id,
  dp.product_id,
  dp.product_data->>'name' as product_name,
  dp.product_data->>'sku' as sku,
  dp.product_data->>'image_url' as image_url,
  (dp.product_data->>'price')::DECIMAL as price,
  dp.deleted_at,
  dp.auto_purge_date,
  EXTRACT(DAY FROM (dp.auto_purge_date - now()))::INTEGER as days_until_purge,
  dp.deletion_reason,
  u.email as deleted_by_email
FROM deleted_products dp
LEFT JOIN auth.users u ON dp.deleted_by = u.id
ORDER BY dp.deleted_at DESC;

-- Grant access to the view
GRANT SELECT ON deleted_products_view TO authenticated;

-- 10. Add comments for documentation
COMMENT ON TABLE deleted_products IS 'Stores soft-deleted products for 30 days before automatic purge';
COMMENT ON COLUMN deleted_products.auto_purge_date IS 'Automatically calculated as deleted_at + 30 days';
COMMENT ON FUNCTION soft_delete_product IS 'Moves product to deleted_products table instead of permanent deletion';
COMMENT ON FUNCTION restore_deleted_product IS 'Restores a soft-deleted product back to products table';
COMMENT ON FUNCTION permanently_delete_product IS 'Permanently deletes a product - cannot be recovered';
COMMENT ON FUNCTION auto_purge_old_deleted_products IS 'Automatically removes deleted products older than 30 days';
