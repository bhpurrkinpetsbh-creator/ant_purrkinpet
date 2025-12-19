-- Add email column to user_roles table and add admin user
-- User ID: a883d429-2766-46c0-841a-67312f6a4a06

-- Step 1: Add email column to user_roles table
ALTER TABLE public.user_roles
ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Step 2: Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_user_roles_email ON public.user_roles(email);

-- Step 3: Backfill existing user_roles with emails from auth.users
UPDATE public.user_roles ur
SET email = au.email
FROM auth.users au
WHERE ur.user_id = au.id AND ur.email IS NULL;

-- Step 4: Insert admin role for the user (if not already exists)
INSERT INTO public.user_roles (user_id, role, email)
SELECT
  'a883d429-2766-46c0-841a-67312f6a4a06',
  'admin',
  au.email
FROM auth.users au
WHERE au.id = 'a883d429-2766-46c0-841a-67312f6a4a06'
ON CONFLICT (user_id, role)
DO UPDATE SET email = EXCLUDED.email;

-- Step 5: Add comment for documentation
COMMENT ON COLUMN public.user_roles.email IS 'User email address from auth.users';

-- Step 6: Verify the admin role was added
SELECT
  ur.user_id,
  ur.role,
  ur.email,
  ur.created_at
FROM public.user_roles ur
WHERE ur.user_id = 'a883d429-2766-46c0-841a-67312f6a4a06';
