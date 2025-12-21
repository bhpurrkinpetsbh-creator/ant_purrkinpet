-- Migration: Product History/Audit Log System
-- Description: Tracks all product changes including creation, updates, status changes, and deletions

-- 1. Create product_history table to store audit logs
CREATE TABLE IF NOT EXISTS product_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL,
  product_name TEXT NOT NULL,
  product_sku TEXT,
  action_type TEXT NOT NULL CHECK (action_type IN (
    'created', 
    'updated', 
    'activated', 
    'deactivated', 
    'featured', 
    'unfeatured', 
    'deleted', 
    'restored',
    'price_changed',
    'category_changed',
    'brand_changed'
  )),
  changed_fields JSONB, -- Stores {field: {old: value, new: value}}
  performed_by UUID REFERENCES auth.users(id),
  performed_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_product_history_product_id ON product_history(product_id);
CREATE INDEX IF NOT EXISTS idx_product_history_performed_at ON product_history(performed_at DESC);
CREATE INDEX IF NOT EXISTS idx_product_history_action_type ON product_history(action_type);

-- 2. Trigger function to log product creation
CREATE OR REPLACE FUNCTION log_product_created()
RETURNS TRIGGER AS $$
BEGIN
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
    'created',
    jsonb_build_object(
      'name', jsonb_build_object('new', NEW.name),
      'price', jsonb_build_object('new', NEW.price),
      'is_active', jsonb_build_object('new', COALESCE(NEW.is_active, true)),
      'is_featured', jsonb_build_object('new', COALESCE(NEW.is_featured, false)),
      'category_id', jsonb_build_object('new', NEW.category_id),
      'brand_id', jsonb_build_object('new', NEW.brand_id),
      'description', jsonb_build_object('new', NEW.description),
      'stock_quantity', jsonb_build_object('new', COALESCE(NEW.stock_quantity, 0))
    ),
    auth.uid(),
    'Product created'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger function to log product updates
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

-- 4. Create triggers on products table
DROP TRIGGER IF EXISTS trigger_log_product_created ON products;
CREATE TRIGGER trigger_log_product_created
  AFTER INSERT ON products
  FOR EACH ROW
  EXECUTE FUNCTION log_product_created();

DROP TRIGGER IF EXISTS trigger_log_product_updated ON products;
CREATE TRIGGER trigger_log_product_updated
  AFTER UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION log_product_updated();

-- 5. Modify soft_delete_product to also log to history
CREATE OR REPLACE FUNCTION soft_delete_product(
  p_product_id UUID,
  p_deletion_reason TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_product_data JSONB;
  v_product_name TEXT;
  v_product_sku TEXT;
BEGIN
  -- Get complete product data
  SELECT row_to_json(p.*), p.name, p.sku INTO v_product_data, v_product_name, v_product_sku
  FROM products p
  WHERE p.id = p_product_id;

  IF v_product_data IS NULL THEN
    RAISE EXCEPTION 'Product not found';
  END IF;

  -- Log deletion to product_history
  INSERT INTO product_history (
    product_id,
    product_name,
    product_sku,
    action_type,
    changed_fields,
    performed_by,
    notes
  ) VALUES (
    p_product_id,
    v_product_name,
    v_product_sku,
    'deleted',
    v_product_data,
    auth.uid(),
    COALESCE(p_deletion_reason, 'Product deleted')
  );

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

-- 6. Modify restore_deleted_product to also log to history
CREATE OR REPLACE FUNCTION restore_deleted_product(
  p_deleted_product_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_product_data JSONB;
  v_product_id UUID;
  v_product_name TEXT;
  v_product_sku TEXT;
BEGIN
  -- Get the deleted product data
  SELECT product_data, product_id INTO v_product_data, v_product_id
  FROM deleted_products
  WHERE id = p_deleted_product_id;

  IF v_product_data IS NULL THEN
    RAISE EXCEPTION 'Deleted product not found';
  END IF;

  v_product_name := v_product_data->>'name';
  v_product_sku := v_product_data->>'sku';

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

  -- Log restoration to product_history
  INSERT INTO product_history (
    product_id,
    product_name,
    product_sku,
    action_type,
    changed_fields,
    performed_by,
    notes
  ) VALUES (
    v_product_id,
    v_product_name,
    v_product_sku,
    'restored',
    v_product_data,
    auth.uid(),
    'Product restored from trash'
  );

  -- Remove from deleted_products
  DELETE FROM deleted_products WHERE id = p_deleted_product_id;

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to restore product: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. RLS Policies for product_history table
ALTER TABLE product_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view product history" ON product_history;
DROP POLICY IF EXISTS "Admins can insert product history" ON product_history;

-- Admins can view all product history
CREATE POLICY "Admins can view product history"
  ON product_history
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Allow insert through triggers (SECURITY DEFINER functions)
CREATE POLICY "Admins can insert product history"
  ON product_history
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- 8. Create view for product history with user email
CREATE OR REPLACE VIEW product_history_view AS
SELECT
  ph.id,
  ph.product_id,
  ph.product_name,
  ph.product_sku,
  ph.action_type,
  ph.changed_fields,
  ph.performed_at,
  ph.notes,
  u.email as performed_by_email
FROM product_history ph
LEFT JOIN auth.users u ON ph.performed_by = u.id
ORDER BY ph.performed_at DESC;

-- Grant access to the view
GRANT SELECT ON product_history_view TO authenticated;

-- 9. Add comments for documentation
COMMENT ON TABLE product_history IS 'Audit log for all product changes including creation, updates, and deletions';
COMMENT ON COLUMN product_history.action_type IS 'Type of action: created, updated, activated, deactivated, featured, unfeatured, deleted, restored, price_changed, category_changed, brand_changed';
COMMENT ON COLUMN product_history.changed_fields IS 'JSON object containing field names with old and new values';
