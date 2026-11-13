import { createClient } from "@/lib/supabase/server";
import type { Feedback, FeedbackStatus } from "@/lib/feedback";

const SELECT = `
  id, number, type, message, page_url, status, created_at, updated_at,
  author:profiles!feedback_user_id_fkey(email, full_name),
  comments:feedback_comments(
    id, message, status_from, status_to, created_at,
    author:profiles!feedback_comments_user_id_fkey(email, full_name)
  )
`;

function normalize(row: Feedback): Feedback {
  return {
    ...row,
    comments: [...(row.comments ?? [])].sort((a, b) => a.created_at.localeCompare(b.created_at)),
  };
}

export async function getFeedbackList(statuses?: FeedbackStatus[]): Promise<Feedback[]> {
  const supabase = await createClient();
  let query = supabase.from("feedback").select(SELECT).order("updated_at", { ascending: false });
  if (statuses && statuses.length > 0) query = query.in("status", statuses);
  const { data, error } = await query;
  if (error) throw error;
  return ((data ?? []) as unknown as Feedback[]).map(normalize);
}

export async function getFeedback(id: string): Promise<Feedback | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("feedback").select(SELECT).eq("id", id).maybeSingle();
  if (error || !data) return null;
  return normalize(data as unknown as Feedback);
}

export async function getFeedbackCounts(): Promise<Record<FeedbackStatus, number>> {
  const supabase = await createClient();
  const { data } = await supabase.from("feedback").select("status");
  const counts: Record<FeedbackStatus, number> = { a_traiter: 0, a_valider: 0, a_revoir: 0, valide: 0 };
  for (const row of (data ?? []) as { status: FeedbackStatus }[]) counts[row.status]++;
  return counts;
}
