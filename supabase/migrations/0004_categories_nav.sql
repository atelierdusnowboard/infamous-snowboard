ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS show_in_nav BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS sort_order  INT     NOT NULL DEFAULT 0;

UPDATE public.categories SET sort_order = 0 WHERE slug = 'snowboards';
UPDATE public.categories SET show_in_nav = false WHERE slug IN ('kids', 'park', 'freeride');

INSERT INTO public.categories (name, slug, show_in_nav, sort_order) VALUES
  ('Bindings', 'bindings', true, 1),
  ('Clothing', 'clothing', true, 2)
ON CONFLICT (slug) DO NOTHING;
