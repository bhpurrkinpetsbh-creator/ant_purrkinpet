-- Enable the required extensions
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Grant permissions to postgres user to manage cron jobs
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- Schedule the product expiry check function to run daily at 9:00 AM (server time)
-- Note: '0 9 * * *' means minute 0, hour 9, every day
SELECT cron.schedule(
  'daily-product-expiry-check',
  '0 9 * * *',
  $$
  SELECT net.http_post(
    url := 'https://cutwflpcyiuguoggwxwo.supabase.co/functions/v1/check-expiring-products',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := '{}'::jsonb
  );
  $$
);
