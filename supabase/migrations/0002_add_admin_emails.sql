CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, is_admin)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.email IN ('atelierdusnow@yahoo.fr', 'expertnocode@gmail.com')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
