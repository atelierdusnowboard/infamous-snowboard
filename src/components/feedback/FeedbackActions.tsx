"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addFeedbackComment, setFeedbackStatus } from "@/lib/actions/feedback";
import { FEEDBACK_STATUS_LABELS, type FeedbackStatus } from "@/lib/feedback";

// Transitions proposées selon le statut courant.
const TRANSITIONS: Record<FeedbackStatus, FeedbackStatus[]> = {
  a_traiter: ["a_valider"],
  a_revoir: ["a_valider"],
  a_valider: ["valide", "a_revoir"],
  valide: ["a_revoir"],
};

const ACTION_LABELS: Record<FeedbackStatus, string> = {
  a_traiter: "Remettre à traiter",
  a_valider: "Marquer comme traité",
  a_revoir: "À revoir",
  valide: "Valider",
};

export function FeedbackActions({ feedbackId, status }: { feedbackId: string; status: FeedbackStatus }) {
  const router = useRouter();
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function run(fn: () => Promise<{ error?: string }>) {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (res.error) {
        setError(res.error);
        return;
      }
      setComment("");
      router.refresh();
    });
  }

  function changeStatus(next: FeedbackStatus) {
    if (next === "a_revoir" && !comment.trim()) {
      setError("Pour passer en « À revoir », explique ce qui ne va pas dans le commentaire ci-dessus.");
      document.getElementById("feedback-comment")?.focus();
      return;
    }
    run(() => setFeedbackStatus({ feedbackId, status: next, comment: comment.trim() || undefined }));
  }

  return (
    <div className="border border-black">
      <div className="px-4 py-3 border-b border-black">
        <h2 className="text-xs font-bold uppercase tracking-widest">Répondre</h2>
      </div>
      <div className="p-4 space-y-3">
        <textarea
          id="feedback-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          placeholder="Ajouter un commentaire… (obligatoire pour passer en « À revoir »)"
          className="w-full border border-black p-3 text-sm focus:outline-none focus:ring-1 focus:ring-black resize-y"
        />

        {error && <p className="text-xs text-red-600">{error}</p>}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={isPending || !comment.trim()}
            onClick={() => run(() => addFeedbackComment({ feedbackId, message: comment }))}
            className="px-4 py-2.5 border border-black text-xs font-bold uppercase tracking-widest hover:bg-black hover:!text-white transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:!text-black"
          >
            Commenter
          </button>

          <div className="ml-auto flex flex-wrap gap-2">
            {TRANSITIONS[status].map((next) => (
              <button
                key={next}
                type="button"
                disabled={isPending}
                onClick={() => changeStatus(next)}
                className={`px-4 py-2.5 text-xs font-bold uppercase tracking-widest transition-opacity disabled:opacity-40 ${
                  next === "a_revoir"
                    ? "bg-red-600 text-white hover:opacity-80"
                    : next === "valide"
                      ? "bg-green-700 text-white hover:opacity-80"
                      : "bg-black text-white hover:opacity-80"
                }`}
                title={FEEDBACK_STATUS_LABELS[next]}
              >
                {ACTION_LABELS[next]}
              </button>
            ))}
          </div>
        </div>
        {status === "a_valider" && (
          <p className="text-[11px] text-black/50">
            Le correctif est en ligne : vérifie-le puis valide, ou passe en « À revoir » en expliquant ce qui ne va pas.
          </p>
        )}
      </div>
    </div>
  );
}
