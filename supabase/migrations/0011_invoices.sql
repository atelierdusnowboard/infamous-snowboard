-- Série distincte pour les ventes du site Infamous, sans remise à zéro annuelle.
CREATE TABLE public.invoice_counter (
  singleton boolean PRIMARY KEY DEFAULT true CHECK (singleton),
  last_number bigint NOT NULL DEFAULT 0,
  last_issued_at timestamptz
);
INSERT INTO public.invoice_counter (singleton) VALUES (true);

CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE RESTRICT,
  number text NOT NULL UNIQUE,
  issued_at timestamptz NOT NULL,
  snapshot jsonb NOT NULL CHECK (snapshot->>'version' = '1'),
  pdf_base64 text
);
ALTER TABLE public.invoice_counter ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read invoices" ON public.invoices FOR SELECT TO authenticated
  USING (public.is_admin());
REVOKE ALL ON public.invoice_counter FROM anon, authenticated;
REVOKE ALL ON public.invoices FROM anon, authenticated;
GRANT SELECT ON public.invoices TO authenticated;
GRANT ALL ON public.invoices, public.invoice_counter TO service_role;

-- Le verrou du compteur rend l'attribution continue, chronologique et transactionnelle.
-- Un double clic, même concurrent, renvoie toujours la même facture.
CREATE FUNCTION public.issue_invoice(p_order_id uuid, p_snapshot jsonb)
RETURNS public.invoices LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_invoice public.invoices;
  v_order public.orders;
  v_number bigint;
  v_date timestamptz;
BEGIN
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Commande introuvable'; END IF;
  SELECT * INTO v_invoice FROM public.invoices WHERE order_id = p_order_id;
  IF FOUND THEN RETURN v_invoice; END IF;
  IF v_order.payment_intent_id IS NULL
    OR v_order.payment_intent_id IS DISTINCT FROM p_snapshot->>'paymentIntentId'
    OR p_snapshot->>'orderId' IS DISTINCT FROM p_order_id::text
    OR (p_snapshot->>'totalGross')::bigint IS DISTINCT FROM round(v_order.total * 100)::bigint
    OR p_snapshot->>'version' IS DISTINCT FROM '1'
    OR p_snapshot->>'currency' IS DISTINCT FROM 'eur'
    OR p_snapshot->>'vatRate' IS DISTINCT FROM '20'
    OR p_snapshot->'customer'->>'country' IS DISTINCT FROM 'FR'
    OR p_snapshot->'shipping'->>'country' IS DISTINCT FROM 'FR'
    OR v_order.status IN ('pending', 'cancelled') THEN
    RAISE EXCEPTION 'Commande non éligible à la facturation';
  END IF;
  UPDATE public.invoice_counter SET
    last_number = last_number + 1,
    last_issued_at = greatest(clock_timestamp(), coalesce(last_issued_at, '-infinity'::timestamptz))
    WHERE singleton RETURNING last_number, last_issued_at INTO v_number, v_date;
  INSERT INTO public.invoices (order_id, number, issued_at, snapshot)
    VALUES (p_order_id, 'INF-' || lpad(v_number::text, greatest(6, length(v_number::text)), '0'), v_date, p_snapshot)
    RETURNING * INTO v_invoice;
  RETURN v_invoice;
END;
$$;
REVOKE ALL ON FUNCTION public.issue_invoice(uuid, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.issue_invoice(uuid, jsonb) TO service_role;

-- Les données émises sont immuables, y compris pour le rôle service.
-- Seul l'archivage initial du PDF peut compléter une facture.
CREATE FUNCTION public.protect_invoice() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN RAISE EXCEPTION 'Une facture émise ne peut pas être supprimée'; END IF;
  IF (to_jsonb(NEW) - 'pdf_base64') IS DISTINCT FROM (to_jsonb(OLD) - 'pdf_base64')
    OR OLD.pdf_base64 IS NOT NULL OR NEW.pdf_base64 IS NULL THEN
    RAISE EXCEPTION 'Une facture émise ne peut pas être modifiée';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER protect_invoice BEFORE UPDATE OR DELETE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.protect_invoice();
