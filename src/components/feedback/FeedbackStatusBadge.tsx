import { FEEDBACK_STATUS_LABELS, type FeedbackStatus } from "@/lib/feedback";

const STYLES: Record<FeedbackStatus, string> = {
  a_traiter: "bg-black text-white border-black",
  a_valider: "bg-amber-100 text-amber-900 border-amber-400",
  a_revoir: "bg-red-100 text-red-800 border-red-400",
  valide: "bg-green-100 text-green-800 border-green-400",
};

export function FeedbackStatusBadge({ status }: { status: FeedbackStatus }) {
  return (
    <span
      className={`inline-block whitespace-nowrap border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${STYLES[status]}`}
    >
      {FEEDBACK_STATUS_LABELS[status]}
    </span>
  );
}
