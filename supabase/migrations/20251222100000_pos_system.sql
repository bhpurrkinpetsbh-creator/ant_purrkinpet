-- POS System Database Schema
-- Add channel tracking and external order IDs

-- 1. Add channel column to orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS channel TEXT DEFAULT 'website';

-- 2. Add external order ID for Talabat/partner references
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS external_order_id TEXT;

-- 3. Add comment for channel values
COMMENT ON COLUMN public.orders.channel IS 'Sales channel: website, pos_store, talabat, other_delivery';

-- 4. Create index for channel filtering
CREATE INDEX IF NOT EXISTS idx_orders_channel ON public.orders(channel);

-- 5. Add pos_admin role (separate from regular admin)
-- This role is specifically for POS access
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'pos_admin'
FROM auth.users
WHERE email = 'mail2shaid@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
