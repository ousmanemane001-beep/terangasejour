
CREATE OR REPLACE FUNCTION public.notify_admins_new_listing(_title text, _message text, _data jsonb DEFAULT '{}'::jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _admin RECORD;
BEGIN
  FOR _admin IN SELECT user_id FROM public.user_roles WHERE role = 'admin'
  LOOP
    INSERT INTO public.notifications (user_id, type, title, message, data)
    VALUES (_admin.user_id, 'new_listing', _title, _message, _data);
  END LOOP;
END;
$$;
