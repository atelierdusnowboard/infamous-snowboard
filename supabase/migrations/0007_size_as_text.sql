-- Replace numeric size_cm + is_wide boolean with a free-text size field.
-- This allows boards (159, 159W), bindings, clothing (S, M, L, XL), etc.

ALTER TABLE public.product_variants DROP COLUMN IF EXISTS is_wide;
ALTER TABLE public.order_items DROP COLUMN IF EXISTS is_wide;

ALTER TABLE public.product_variants ADD COLUMN size text;
UPDATE public.product_variants SET size = size_cm::text;
ALTER TABLE public.product_variants DROP COLUMN size_cm;

ALTER TABLE public.order_items ADD COLUMN size text;
UPDATE public.order_items SET size = size_cm::text WHERE size_cm IS NOT NULL;
ALTER TABLE public.order_items DROP COLUMN size_cm;
