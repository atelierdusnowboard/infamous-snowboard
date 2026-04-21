-- Junction table for many-to-many products ↔ categories
CREATE TABLE IF NOT EXISTS public.product_categories (
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, category_id)
);

-- Migrate existing category_id data into the junction table
INSERT INTO public.product_categories (product_id, category_id)
SELECT id, category_id
FROM public.products
WHERE category_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- RLS
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read product_categories" ON public.product_categories
  FOR SELECT USING (true);

CREATE POLICY "Admin write product_categories" ON public.product_categories
  FOR ALL USING (is_admin());

-- Index
CREATE INDEX IF NOT EXISTS idx_product_categories_product  ON public.product_categories(product_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_category ON public.product_categories(category_id);
