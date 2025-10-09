-- Create function to trigger push notification on new message
CREATE OR REPLACE FUNCTION public.trigger_push_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  request_id bigint;
BEGIN
  -- Call edge function to send push notification
  SELECT net.http_post(
    url := 'https://qxyngdiehpsaublqlnkq.supabase.co/functions/v1/on-new-message',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4eW5nZGllaHBzYXVibHFsbmtxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMjI2OTAsImV4cCI6MjA2ODU5ODY5MH0.wMV1i1AN5b6w__b_e-eDrdztqRVcBrnYGtiRJLInJGY"}'::jsonb,
    body := json_build_object('record', row_to_json(NEW))::jsonb
  ) INTO request_id;
  
  RETURN NEW;
END;
$function$;

-- Create trigger on messages table
DROP TRIGGER IF EXISTS on_message_created ON public.messages;
CREATE TRIGGER on_message_created
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_push_notification();

-- Enable pg_net extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;