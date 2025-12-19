-- Add email column to customers table
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);

-- Backfill existing customers with email from auth.users
UPDATE public.customers c
SET email = u.email
FROM auth.users u
WHERE c.id = u.id AND c.email IS NULL;

-- Update the trigger function to include email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.customers (id, full_name, email, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$;

-- Comment for documentation
COMMENT ON COLUMN public.customers.email IS 'User email address from auth.users';
