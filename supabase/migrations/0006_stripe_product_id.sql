ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS stripe_product_id TEXT;
