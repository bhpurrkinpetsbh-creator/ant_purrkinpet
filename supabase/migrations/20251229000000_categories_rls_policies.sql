-- Add RLS policies for categories table to allow admin updates
-- This fixes the issue where category updates were silently failing

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public can view categories" ON categories;
DROP POLICY IF EXISTS "Admins can insert categories" ON categories;
DROP POLICY IF EXISTS "Admins can update categories" ON categories;
DROP POLICY IF EXISTS "Admins can delete categories" ON categories;

-- Create policy for public read access
CREATE POLICY "Public can view categories"
  ON categories
  FOR SELECT
  USING (is_active = true);

-- Create policy for admin insert
CREATE POLICY "Admins can insert categories"
  ON categories
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role = 'admin'
    )
  );

-- Create policy for admin update
CREATE POLICY "Admins can update categories"
  ON categories
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role = 'admin'
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role = 'admin'
    )
  );

-- Create policy for admin delete
CREATE POLICY "Admins can delete categories"
  ON categories
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role = 'admin'
    )
  );

-- Ensure RLS is enabled
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
