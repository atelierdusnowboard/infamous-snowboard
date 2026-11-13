import type { Metadata } from "next";
import Link from "next/link";
import { getFeedbackCounts, getFeedbackList } from "@/lib/queries/feedback";
import { FeedbackStatusBadge } from "@/components/feedback/FeedbackStatusBadge";
import {
  FEEDBACK_STATUSES,
  FEEDBACK_STATUS_LABELS,
  FEEDBACK_TYPE_LABELS,
  authorName,
  formatFeedbackDate,
  type Feedback,
  type FeedbackStatus,
} from "@/lib/feedback";

export const metadata: Metadata = {
  title: "Admin — Retours",
  robots: { index: false, follow: false },
};

// Par défaut : tout ce qui n'est pas encore validé.
const OPEN: FeedbackStatus[] = ["a_traiter", "a_revoir", "a_valider"];

export default async function AdminFeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const current = status ?? "open";
  const statuses: FeedbackStatus[] | undefined =
    current === "all"
      ? undefined
      : current === "open"
        ? OPEN
        : (FEEDBACK_STATUSES as readonly string[]).includes(current)
          ? [current as FeedbackStatus]
          : OPEN;

  let items: Feedback[] = [];
  let counts: Record<FeedbackStatus, number> = { a_traiter: 0, a_valider: 0, a_revoir: 0, valide: 0 };
  try {
    [items, counts] = await Promise.all([getFeedbackList(statuses), getFeedbackCounts()]);
  } catch {
    // Table absente / DB non configurée
  }

  const openCount = counts.a_traiter + counts.a_revoir + counts.a_valider;
  const tabs = [
    { key: "open", label: "En cours", count: openCount },
    ...FEEDBACK_STATUSES.map((s) => ({ key: s, label: FEEDBACK_STATUS_LABELS[s], count: counts[s] })),
    { key: "all", label: "Tous", count: openCount + counts.valide },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black uppercase tracking-widest">Retours</h1>
        <p className="mt-2 text-xs text-black/50">
          Problèmes et demandes d&apos;amélioration remontés via le bouton « Retour » en bas à droite du site.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={t.key === "open" ? "/admin/feedback" : `/admin/feedback?status=${t.key}`}
            className={`px-3 py-2 border border-black text-xs font-bold uppercase tracking-widest transition-colors ${
              current === t.key ? "bg-black text-white" : "hover:bg-black/5"
            }`}
          >
            {t.label} <span className="opacity-60">({t.count})</span>
          </Link>
        ))}
      </div>

      <div className="border border-black">
        {items.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-xs text-black/40 uppercase tracking-widest">Aucun ticket.</p>
          </div>
        ) : (
          items.map((f) => {
            const lastComment = f.comments.filter((c) => c.message).at(-1);
            return (
              <Link
                key={f.id}
                href={`/admin/feedback/${f.id}`}
                className="block px-4 py-4 border-b border-black last:border-b-0 hover:bg-black/5 transition-colors"
              >
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <span className="text-xs font-mono font-bold">#{f.number}</span>
                  <FeedbackStatusBadge status={f.status} />
                  <span className="text-[10px] uppercase tracking-widest text-black/50">
                    {FEEDBACK_TYPE_LABELS[f.type]}
                  </span>
                  <span className="ml-auto text-[11px] text-black/50">
                    {authorName(f.author)} · {formatFeedbackDate(f.created_at)}
                    {f.comments.length > 0 && ` · ${f.comments.length} activité${f.comments.length > 1 ? "s" : ""}`}
                  </span>
                </div>
                <p className="text-sm line-clamp-2 whitespace-pre-line">{f.message}</p>
                {lastComment && (
                  <p className="mt-2 text-xs text-black/60 line-clamp-1">
                    ↳ {authorName(lastComment.author)} : {lastComment.message}
                  </p>
                )}
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
