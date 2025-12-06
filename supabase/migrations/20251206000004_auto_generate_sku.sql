-- Migration: Auto-generate SKU for Products
-- Description: Creates function to generate next SKU number based on existing products

-- Function to generate the next SKU
CREATE OR REPLACE FUNCTION generate_next_sku()
RETURNS TEXT AS $$
DECLARE
  v_last_sku TEXT;
  v_last_number INTEGER;
  v_next_number INTEGER;
  v_next_sku TEXT;
BEGIN
  -- Get the last SKU that matches the pattern SKU followed by numbers
  SELECT sku INTO v_last_sku
  FROM products
  WHERE sku ~ '^SKU[0-9]+$'
  ORDER BY
    -- Extract the numeric part and order by it as integer
    (SUBSTRING(sku FROM '[0-9]+$'))::INTEGER DESC
  LIMIT 1;

  -- If no SKU exists, start with SKU1
  IF v_last_sku IS NULL THEN
    RETURN 'SKU1';
  END IF;

  -- Extract the numeric part from the last SKU
  v_last_number := (SUBSTRING(v_last_sku FROM '[0-9]+$'))::INTEGER;

  -- Increment the number
  v_next_number := v_last_number + 1;

  -- Generate the next SKU
  v_next_sku := 'SKU' || v_next_number;

  RETURN v_next_sku;
EXCEPTION
  WHEN OTHERS THEN
    -- If any error occurs, return SKU1
    RETURN 'SKU1';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Also check deleted products to avoid SKU conflicts
CREATE OR REPLACE FUNCTION generate_next_sku_safe()
RETURNS TEXT AS $$
DECLARE
  v_last_sku_products TEXT;
  v_last_sku_deleted TEXT;
  v_last_number_products INTEGER := 0;
  v_last_number_deleted INTEGER := 0;
  v_max_number INTEGER;
  v_next_sku TEXT;
BEGIN
  -- Get the last SKU from active products
  SELECT sku INTO v_last_sku_products
  FROM products
  WHERE sku ~ '^SKU[0-9]+$'
  ORDER BY (SUBSTRING(sku FROM '[0-9]+$'))::INTEGER DESC
  LIMIT 1;

  -- Get the last SKU from deleted products
  SELECT product_data->>'sku' INTO v_last_sku_deleted
  FROM deleted_products
  WHERE product_data->>'sku' ~ '^SKU[0-9]+$'
  ORDER BY (SUBSTRING(product_data->>'sku' FROM '[0-9]+$'))::INTEGER DESC
  LIMIT 1;

  -- Extract numbers
  IF v_last_sku_products IS NOT NULL THEN
    v_last_number_products := (SUBSTRING(v_last_sku_products FROM '[0-9]+$'))::INTEGER;
  END IF;

  IF v_last_sku_deleted IS NOT NULL THEN
    v_last_number_deleted := (SUBSTRING(v_last_sku_deleted FROM '[0-9]+$'))::INTEGER;
  END IF;

  -- Get the maximum number
  v_max_number := GREATEST(v_last_number_products, v_last_number_deleted);

  -- If no SKU exists anywhere, start with SKU1
  IF v_max_number = 0 THEN
    RETURN 'SKU1';
  END IF;

  -- Generate the next SKU
  v_next_sku := 'SKU' || (v_max_number + 1);

  RETURN v_next_sku;
EXCEPTION
  WHEN OTHERS THEN
    -- If any error occurs, return SKU1
    RETURN 'SKU1';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION generate_next_sku() TO authenticated;
GRANT EXECUTE ON FUNCTION generate_next_sku_safe() TO authenticated;

-- Add comments
COMMENT ON FUNCTION generate_next_sku IS 'Generates the next SKU number based on existing products';
COMMENT ON FUNCTION generate_next_sku_safe IS 'Generates the next SKU number checking both active and deleted products to avoid conflicts';
