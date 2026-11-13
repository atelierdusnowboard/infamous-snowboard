"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { createFeedback } from "@/lib/actions/feedback";
import { FEEDBACK_TYPES, FEEDBACK_TYPE_LABELS, type FeedbackType } from "@/lib/feedback";

/**
 * Bouton flottant « Retour » — visible uniquement pour les admins connectés.
 * La vérification admin se fait côté navigateur pour ne pas rendre dynamiques
 * les pages statiques de la boutique.
 */
export function FeedbackWidget() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<FeedbackType>("probleme");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function check(userId: string | undefined) {
      if (!userId) {
        if (!cancelled) setIsAdmin(false);
        return;
      }
      const { data } = await supabase.from("profiles").select("is_admin").eq("id", userId).single();
      if (!cancelled) setIsAdmin(data?.is_admin === true);
    }

    supabase.auth.getUser().then(({ data }) => check(data.user?.id));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      check(session?.user?.id);
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!isAdmin) return null;

  function close() {
    setOpen(false);
    setError(null);
    setSent(null);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await createFeedback({
        type,
        message,
        pageUrl: window.location.href,
        userAgent: navigator.userAgent,
      });
      if (res.error) {
        setError(res.error);
        return;
      }
      setSent(res.number ?? null);
      setMessage("");
      setType("probleme");
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 bg-black text-white px-4 py-3 text-xs font-bold uppercase tracking-widest shadow-lg hover:opacity-80 transition-opacity"
        aria-label="Faire un retour"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        Retour
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={close}>
          <div className="absolute inset-0 bg-black/60" />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-title"
            className="relative z-10 bg-white border border-black w-full sm:max-w-md sm:mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-black">
              <h2 id="feedback-title" className="text-sm font-bold uppercase tracking-widest">
                Remonter un retour
              </h2>
              <button onClick={close} className="hover:opacity-60" aria-label="Fermer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {sent !== null ? (
              <div className="p-5 space-y-4">
                <p className="text-sm">
                  Merci ! Ticket <strong>#{sent}</strong> enregistré, il sera traité rapidement.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSent(null)}
                    className="flex-1 px-4 py-2.5 border border-black text-xs font-bold uppercase tracking-widest hover:bg-black hover:!text-white transition-colors"
                  >
                    Nouveau retour
                  </button>
                  <Link
                    href="/admin/feedback"
                    onClick={close}
                    className="flex-1 px-4 py-2.5 bg-black text-white text-center text-xs font-bold uppercase tracking-widest hover:opacity-80"
                  >
                    Voir les tickets
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {FEEDBACK_TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`px-3 py-2.5 border border-black text-xs font-bold uppercase tracking-widest transition-colors ${
                        type === t ? "bg-black text-white" : "bg-white text-black hover:bg-black/5"
                      }`}
                    >
                      {FEEDBACK_TYPE_LABELS[t]}
                    </button>
                  ))}
                </div>

                <div>
                  <label htmlFor="feedback-message" className="block text-xs font-bold uppercase tracking-widest mb-2">
                    {type === "probleme" ? "Quel est le souci ?" : "Quelle amélioration ?"}
                  </label>
                  <textarea
                    id="feedback-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={6}
                    autoFocus
                    required
                    placeholder={
                      type === "probleme"
                        ? "Ce qui se passe, ce que tu attendais…"
                        : "Ce que tu aimerais changer ou ajouter…"
                    }
                    className="w-full border border-black p-3 text-sm focus:outline-none focus:ring-1 focus:ring-black resize-y"
                  />
                  <p className="mt-1 text-[11px] text-black/50">
                    La page actuelle est jointe automatiquement.
                  </p>
                </div>

                {error && <p className="text-xs text-red-600">{error}</p>}

                <div className="flex items-center justify-between gap-2">
                  <Link
                    href="/admin/feedback"
                    onClick={close}
                    className="text-xs uppercase tracking-widest text-black/50 hover:text-black"
                  >
                    Voir les tickets
                  </Link>
                  <button
                    type="submit"
                    disabled={isPending || message.trim().length < 3}
                    className="px-5 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-widest hover:opacity-80 disabled:opacity-40"
                  >
                    {isPending ? "Envoi…" : "Envoyer"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
