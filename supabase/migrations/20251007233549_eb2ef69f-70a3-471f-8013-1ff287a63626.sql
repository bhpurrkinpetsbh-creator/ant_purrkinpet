-- Enable reliable realtime payloads for cart_items
ALTER TABLE public.cart_items REPLICA IDENTITY FULL;

-- Ensure the table is part of the realtime publication
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.cart_items;
  EXCEPTION WHEN duplicate_object THEN
    -- already added; ignore
    NULL;
  END;
END;
$$;