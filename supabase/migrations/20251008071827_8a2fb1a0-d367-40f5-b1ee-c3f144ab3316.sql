-- Public, privacy-safe RPC to fetch booked slots for a date
CREATE OR REPLACE FUNCTION public.get_booked_slots(p_date date)
RETURNS TABLE (appointment_time time without time zone)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT appointment_time
  FROM public.appointments
  WHERE appointment_date = p_date
    AND COALESCE(status, 'pending') <> 'cancelled';
$$;

-- Ensure only explicit roles can execute
REVOKE ALL ON FUNCTION public.get_booked_slots(date) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_booked_slots(date) TO anon, authenticated;