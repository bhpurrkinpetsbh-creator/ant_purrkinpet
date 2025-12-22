-- Ensure RLS is enabled for the customers table
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists to avoid conflicts
DROP POLICY IF EXISTS "Admins can view all customers" ON public.customers;

-- Create policy to allow users with 'admin' role to view all customers
CREATE POLICY "Admins can view all customers"
ON public.customers
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Create policy to allow users to view their own profile
CREATE POLICY "Users can view own profile"
ON public.customers
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Documentation
COMMENT ON TABLE public.customers IS 'Customer profiles. Admins can view all, users can view their own.';
