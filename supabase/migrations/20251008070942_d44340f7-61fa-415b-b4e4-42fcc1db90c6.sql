-- Enable full row data capture for realtime updates
ALTER TABLE public.appointments REPLICA IDENTITY FULL;