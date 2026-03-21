
-- Drop the security definer view and recreate as invoker
DROP VIEW IF EXISTS public.safe_profiles;
CREATE VIEW public.safe_profiles
WITH (security_invoker = true)
AS
SELECT id, first_name, last_name, avatar_url, is_host, created_at, updated_at
FROM public.profiles;
