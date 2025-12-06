-- Migration: Inventory Management System
-- Description: Adds inventory tracking, audit logs, and automatic stock deduction

-- 1. Create inventory_transactions table for audit trail
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('stock_in', 'stock_out', 'adjustment', 'order', 'return')),
  quantity_change INTEGER NOT NULL,
  previous_quantity INTEGER NOT NULL,
  new_quantity INTEGER NOT NULL,
  reference_id UUID, -- order_id or other reference
  reference_type TEXT, -- 'order', 'manual', 'return', etc.
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for faster queries
CREATE INDEX idx_inventory_transactions_product ON inventory_transactions(product_id);
CREATE INDEX idx_inventory_transactions_created ON inventory_transactions(created_at DESC);
CREATE INDEX idx_inventory_transactions_type ON inventory_transactions(transaction_type);

-- 2. Function to log inventory changes
CREATE OR REPLACE FUNCTION log_inventory_transaction(
  p_product_id UUID,
  p_transaction_type TEXT,
  p_quantity_change INTEGER,
  p_reference_id UUID DEFAULT NULL,
  p_reference_type TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
) RETURNS void AS $$
DECLARE
  v_previous_quantity INTEGER;
  v_new_quantity INTEGER;
BEGIN
  -- Get current stock
  SELECT stock_quantity INTO v_previous_quantity
  FROM products
  WHERE id = p_product_id;

  -- Calculate new quantity
  v_new_quantity := v_previous_quantity + p_quantity_change;

  -- Insert transaction log
  INSERT INTO inventory_transactions (
    product_id,
    transaction_type,
    quantity_change,
    previous_quantity,
    new_quantity,
    reference_id,
    reference_type,
    notes,
    created_by
  ) VALUES (
    p_product_id,
    p_transaction_type,
    p_quantity_change,
    v_previous_quantity,
    v_new_quantity,
    p_reference_id,
    p_reference_type,
    p_notes,
    auth.uid()
  );

  -- Update product stock
  UPDATE products
  SET stock_quantity = v_new_quantity,
      updated_at = now()
  WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Function to deduct stock when order is confirmed
CREATE OR REPLACE FUNCTION deduct_stock_on_order_confirmation()
RETURNS TRIGGER AS $$
DECLARE
  v_item RECORD;
BEGIN
  -- Only process when payment status changes to 'paid' and order is confirmed
  IF NEW.payment_status = 'paid' AND OLD.payment_status != 'paid' THEN
    -- Loop through all order items and deduct stock
    FOR v_item IN
      SELECT product_id, quantity, product_name
      FROM order_items
      WHERE order_id = NEW.id
    LOOP
      -- Log and deduct inventory
      PERFORM log_inventory_transaction(
        v_item.product_id,
        'order',
        -v_item.quantity, -- negative for deduction
        NEW.id, -- order_id as reference
        'order',
        'Stock deducted for order #' || NEW.order_number || ' - ' || v_item.product_name
      );
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create trigger on orders table
DROP TRIGGER IF EXISTS trigger_deduct_stock_on_order_confirmation ON orders;
CREATE TRIGGER trigger_deduct_stock_on_order_confirmation
  AFTER UPDATE ON orders
  FOR EACH ROW
  WHEN (NEW.payment_status = 'paid' AND OLD.payment_status IS DISTINCT FROM 'paid')
  EXECUTE FUNCTION deduct_stock_on_order_confirmation();

-- 5. Function to restore stock when order is cancelled
CREATE OR REPLACE FUNCTION restore_stock_on_order_cancellation()
RETURNS TRIGGER AS $$
DECLARE
  v_item RECORD;
BEGIN
  -- Only restore stock if order was previously paid and now cancelled
  IF NEW.status = 'cancelled' AND OLD.payment_status = 'paid' AND NEW.payment_status = 'failed' THEN
    -- Loop through all order items and restore stock
    FOR v_item IN
      SELECT product_id, quantity, product_name
      FROM order_items
      WHERE order_id = NEW.id
    LOOP
      -- Log and restore inventory
      PERFORM log_inventory_transaction(
        v_item.product_id,
        'return',
        v_item.quantity, -- positive for addition
        NEW.id, -- order_id as reference
        'cancelled_order',
        'Stock restored for cancelled order #' || NEW.order_number || ' - ' || v_item.product_name
      );
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create trigger for stock restoration
DROP TRIGGER IF EXISTS trigger_restore_stock_on_order_cancellation ON orders;
CREATE TRIGGER trigger_restore_stock_on_order_cancellation
  AFTER UPDATE ON orders
  FOR EACH ROW
  WHEN (NEW.status = 'cancelled' AND OLD.payment_status = 'paid')
  EXECUTE FUNCTION restore_stock_on_order_cancellation();

-- 7. RLS Policies for inventory_transactions
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;

-- Admins can view all inventory transactions
CREATE POLICY "Admins can view inventory transactions"
  ON inventory_transactions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Admins can insert inventory transactions (for manual adjustments)
CREATE POLICY "Admins can create inventory transactions"
  ON inventory_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- 8. Add comment to products table for low_stock_threshold usage
COMMENT ON COLUMN products.low_stock_threshold IS 'Alert threshold for low stock warnings. If stock_quantity <= low_stock_threshold, product is considered low stock';

-- 9. Create view for low stock products (admin dashboard)
CREATE OR REPLACE VIEW low_stock_products AS
SELECT
  p.id,
  p.name,
  p.sku,
  p.stock_quantity,
  p.low_stock_threshold,
  p.price,
  p.image_url,
  c.name as category_name,
  b.name as brand_name
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN brands b ON p.brand_id = b.id
WHERE p.is_active = true
  AND p.low_stock_threshold IS NOT NULL
  AND p.stock_quantity <= p.low_stock_threshold
ORDER BY p.stock_quantity ASC;

-- Grant access to low_stock_products view
GRANT SELECT ON low_stock_products TO authenticated;

-- 10. Initialize inventory transactions for existing products (one-time)
-- This creates a baseline record for all existing products
INSERT INTO inventory_transactions (
  product_id,
  transaction_type,
  quantity_change,
  previous_quantity,
  new_quantity,
  reference_type,
  notes
)
SELECT
  id,
  'adjustment',
  COALESCE(stock_quantity, 0),
  0,
  COALESCE(stock_quantity, 0),
  'initial_import',
  'Initial inventory baseline during migration'
FROM products
WHERE NOT EXISTS (
  SELECT 1 FROM inventory_transactions WHERE product_id = products.id
);

-- 11. Set default low_stock_threshold for products that don't have one
UPDATE products
SET low_stock_threshold = 5
WHERE low_stock_threshold IS NULL;
