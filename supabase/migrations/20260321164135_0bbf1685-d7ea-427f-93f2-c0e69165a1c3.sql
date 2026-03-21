
-- 1. Create a security definer function for creating notifications
-- This prevents direct INSERT from clients
CREATE OR REPLACE FUNCTION public.create_notification(
  _user_id uuid,
  _type text,
  _title text,
  _message text,
  _data jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _id uuid;
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, data)
  VALUES (_user_id, _type, _title, _message, _data)
  RETURNING id INTO _id;
  RETURN _id;
END;
$$;

-- 2. Remove the INSERT policy entirely - notifications will be created via the security definer function
DROP POLICY IF EXISTS "Authenticated can insert notifications" ON public.notifications;

-- 3. Create a secure view that hides phone for non-owners
CREATE OR REPLACE VIEW public.safe_profiles AS
SELECT 
  id,
  first_name,
  last_name,
  avatar_url,
  is_host,
  created_at,
  updated_at
FROM public.profiles;
