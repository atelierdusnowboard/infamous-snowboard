-- Trigger: when a user creates an account, link any guest orders placed
-- with the same email address so they appear in their account history.

CREATE OR REPLACE FUNCTION public.link_guest_orders_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.orders
  SET user_id   = NEW.id,
      updated_at = NOW()
  WHERE user_id        IS NULL
    AND shipping_email = NEW.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created_link_orders
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.link_guest_orders_on_signup();
