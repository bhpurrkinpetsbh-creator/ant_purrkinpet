-- Create subcategories table
CREATE TABLE IF NOT EXISTS subcategories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category_id, name)
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_subcategories_category_id ON subcategories(category_id);

-- Add RLS policies
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;

-- Anyone can view subcategories
CREATE POLICY "Public can view subcategories"
  ON subcategories
  FOR SELECT
  USING (true);

-- Admins can insert subcategories
CREATE POLICY "Admins can insert subcategories"
  ON subcategories
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role = 'admin'
    )
  );

-- Admins can update subcategories
CREATE POLICY "Admins can update subcategories"
  ON subcategories
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

-- Admins can delete subcategories
CREATE POLICY "Admins can delete subcategories"
  ON subcategories
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role = 'admin'
    )
  );
