-- Retours admin (signalements de problèmes & demandes d'amélioration).
-- Saisis via le bouton flottant visible uniquement par les admins.
--
-- Cycle de vie :
--   a_traiter  → nouveau ticket, à prendre en charge par le dev
--   a_valider  → traité par le dev, en attente de validation par le demandeur
--   a_revoir   → le demandeur refuse le traitement (commentaire obligatoire)
--   valide     → le demandeur confirme, ticket clos

CREATE TABLE IF NOT EXISTS public.feedback (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number      SERIAL UNIQUE,
  user_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  type        TEXT NOT NULL CHECK (type IN ('probleme', 'amelioration')),
  message     TEXT NOT NULL CHECK (length(btrim(message)) > 0),
  page_url    TEXT,
  user_agent  TEXT,
  status      TEXT NOT NULL DEFAULT 'a_traiter'
              CHECK (status IN ('a_traiter', 'a_valider', 'a_revoir', 'valide')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_status  ON public.feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_created ON public.feedback(created_at DESC);

-- Fil de discussion : commentaires libres + traces de changement de statut.
CREATE TABLE IF NOT EXISTS public.feedback_comments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id  UUID NOT NULL REFERENCES public.feedback(id) ON DELETE CASCADE,
  user_id      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  message      TEXT,
  status_from  TEXT,
  status_to    TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (message IS NOT NULL OR status_to IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_feedback_comments_feedback
  ON public.feedback_comments(feedback_id, created_at);

-- RLS : réservé aux admins.
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access feedback" ON public.feedback
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin full access feedback_comments" ON public.feedback_comments
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Changement de statut atomique (statut + trace dans le fil).
-- Passer en « à revoir » exige un commentaire expliquant pourquoi.
CREATE OR REPLACE FUNCTION public.set_feedback_status(
  p_feedback_id UUID,
  p_status      TEXT,
  p_comment     TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_from    TEXT;
  v_comment TEXT := NULLIF(btrim(COALESCE(p_comment, '')), '');
BEGIN
  IF p_status = 'a_revoir' AND v_comment IS NULL THEN
    RAISE EXCEPTION 'Un commentaire est obligatoire pour passer un ticket en « à revoir ».';
  END IF;

  SELECT status INTO v_from FROM feedback WHERE id = p_feedback_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Ticket introuvable.';
  END IF;
  IF v_from = p_status THEN
    RAISE EXCEPTION 'Le ticket est déjà dans ce statut.';
  END IF;

  UPDATE feedback SET status = p_status, updated_at = NOW() WHERE id = p_feedback_id;

  INSERT INTO feedback_comments (feedback_id, user_id, message, status_from, status_to)
  VALUES (p_feedback_id, auth.uid(), v_comment, v_from, p_status);
END;
$$;

REVOKE ALL ON FUNCTION public.set_feedback_status(UUID, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_feedback_status(UUID, TEXT, TEXT) TO authenticated;
