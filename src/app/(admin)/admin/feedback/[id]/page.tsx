import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getFeedback } from "@/lib/queries/feedback";
import { FeedbackStatusBadge } from "@/components/feedback/FeedbackStatusBadge";
import { FeedbackActions } from "@/components/feedback/FeedbackActions";
import {
  FEEDBACK_STATUS_LABELS,
  FEEDBACK_TYPE_LABELS,
  authorName,
  formatFeedbackDate,
} from "@/lib/feedback";

export const metadata: Metadata = {
  title: "Admin — Ticket",
  robots: { index: false, follow: false },
};

export default async function AdminFeedbackDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const feedback = await getFeedback(id);
  if (!feedback) notFound();

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/feedback"
        className="text-xs uppercase tracking-widest text-black/50 hover:text-black"
      >
        &larr; Tous les retours
      </Link>

      <div className="mt-4 mb-6 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-black uppercase tracking-widest">Ticket #{feedback.number}</h1>
        <FeedbackStatusBadge status={feedback.status} />
        <span className="text-[10px] uppercase tracking-widest text-black/50">
          {FEEDBACK_TYPE_LABELS[feedback.type]}
        </span>
      </div>

      <div className="border border-black p-5 mb-6">
        <p className="text-[11px] text-black/50 mb-3">
          {authorName(feedback.author)} · {formatFeedbackDate(feedback.created_at)}
        </p>
        <p className="text-sm whitespace-pre-line">{feedback.message}</p>
        {feedback.page_url && (
          <p className="mt-4 text-xs text-black/60 break-all">
            Page :{" "}
            <a href={feedback.page_url} className="underline hover:text-black" target="_blank" rel="noreferrer">
              {feedback.page_url}
            </a>
          </p>
        )}
      </div>

      {feedback.comments.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-widest mb-3">Historique</h2>
          <ol className="space-y-3">
            {feedback.comments.map((c) => (
              <li key={c.id} className="border-l-2 border-black pl-4">
                <p className="text-[11px] text-black/50">
                  {authorName(c.author)} · {formatFeedbackDate(c.created_at)}
                  {c.status_to && (
                    <>
                      {" "}· a passé le ticket en{" "}
                      <strong className="text-black">{FEEDBACK_STATUS_LABELS[c.status_to]}</strong>
                    </>
                  )}
                </p>
                {c.message && <p className="mt-1 text-sm whitespace-pre-line">{c.message}</p>}
              </li>
            ))}
          </ol>
        </div>
      )}

      <FeedbackActions feedbackId={feedback.id} status={feedback.status} />
    </div>
  );
}
