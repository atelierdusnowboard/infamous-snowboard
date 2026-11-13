// Constantes partagées (client + serveur) du système de retours admin.

export const FEEDBACK_STATUSES = ["a_traiter", "a_valider", "a_revoir", "valide"] as const;
export type FeedbackStatus = (typeof FEEDBACK_STATUSES)[number];

export const FEEDBACK_STATUS_LABELS: Record<FeedbackStatus, string> = {
  a_traiter: "À traiter",
  a_valider: "Traité · à valider",
  a_revoir: "À revoir",
  valide: "Validé",
};

export const FEEDBACK_TYPES = ["probleme", "amelioration"] as const;
export type FeedbackType = (typeof FEEDBACK_TYPES)[number];

export const FEEDBACK_TYPE_LABELS: Record<FeedbackType, string> = {
  probleme: "Problème",
  amelioration: "Amélioration",
};

export interface FeedbackAuthor {
  email: string;
  full_name: string | null;
}

export interface FeedbackComment {
  id: string;
  message: string | null;
  status_from: FeedbackStatus | null;
  status_to: FeedbackStatus | null;
  created_at: string;
  author: FeedbackAuthor | null;
}

export interface Feedback {
  id: string;
  number: number;
  type: FeedbackType;
  message: string;
  page_url: string | null;
  status: FeedbackStatus;
  created_at: string;
  updated_at: string;
  author: FeedbackAuthor | null;
  comments: FeedbackComment[];
}

export function authorName(author: FeedbackAuthor | null): string {
  if (!author) return "Inconnu";
  return author.full_name || author.email;
}

export function formatFeedbackDate(date: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Paris",
  }).format(new Date(date));
}
