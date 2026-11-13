"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { feedbackNotifyEmail, sendEmail } from "@/lib/email/notify";
import {
  FEEDBACK_STATUSES,
  FEEDBACK_STATUS_LABELS,
  FEEDBACK_TYPES,
  FEEDBACK_TYPE_LABELS,
  type FeedbackStatus,
} from "@/lib/feedback";

type ActionResult = { error?: string; number?: number };

async function getAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = (await supabase
    .from("profiles")
    .select("is_admin, email, full_name")
    .eq("id", user.id)
    .single()) as any;
  if (!profile?.is_admin) return null;
  return {
    supabase,
    userId: user.id,
    email: profile.email as string,
    name: (profile.full_name as string | null) || (profile.email as string),
  };
}

function ticketUrl(id: string): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.infamous-snowboard.com").replace(/\/$/, "");
  return `${base}/admin/feedback/${id}`;
}

/** Notifie le dev, sauf s'il est lui-même l'auteur de l'action. */
function notifyDev(actorEmail: string, subject: string, text: string, id: string) {
  const to = feedbackNotifyEmail();
  if (actorEmail.toLowerCase() === to.toLowerCase()) return;
  after(() => sendEmail({ to, subject, text, link: ticketUrl(id) }));
}

const createSchema = z.object({
  type: z.enum(FEEDBACK_TYPES),
  message: z.string().trim().min(3, "Décris le souci ou la demande.").max(5000),
  pageUrl: z.string().max(2000).optional(),
  userAgent: z.string().max(500).optional(),
});

export async function createFeedback(input: z.input<typeof createSchema>): Promise<ActionResult> {
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Données invalides" };

  const admin = await getAdmin();
  if (!admin) return { error: "Accès réservé aux administrateurs." };

  const { data, error } = await admin.supabase
    .from("feedback")
    .insert({
      user_id: admin.userId,
      type: parsed.data.type,
      message: parsed.data.message,
      page_url: parsed.data.pageUrl ?? null,
      user_agent: parsed.data.userAgent ?? null,
    })
    .select("id, number")
    .single();

  if (error || !data) return { error: "Impossible d'enregistrer le retour." };

  notifyDev(
    admin.email,
    `[Infamous] Nouveau ticket #${data.number} — ${FEEDBACK_TYPE_LABELS[parsed.data.type]}`,
    `${admin.name} a ouvert le ticket #${data.number} (${FEEDBACK_TYPE_LABELS[parsed.data.type]}).\n\n` +
      `${parsed.data.message}\n\n` +
      (parsed.data.pageUrl ? `Page : ${parsed.data.pageUrl}` : ""),
    data.id
  );

  revalidatePath("/admin/feedback");
  return { number: data.number };
}

const commentSchema = z.object({
  feedbackId: z.string().uuid(),
  message: z.string().trim().min(1, "Le commentaire est vide.").max(5000),
});

export async function addFeedbackComment(input: z.input<typeof commentSchema>): Promise<ActionResult> {
  const parsed = commentSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Données invalides" };

  const admin = await getAdmin();
  if (!admin) return { error: "Accès réservé aux administrateurs." };

  const { data: ticket } = await admin.supabase
    .from("feedback")
    .select("number")
    .eq("id", parsed.data.feedbackId)
    .single();
  if (!ticket) return { error: "Ticket introuvable." };

  const { error } = await admin.supabase.from("feedback_comments").insert({
    feedback_id: parsed.data.feedbackId,
    user_id: admin.userId,
    message: parsed.data.message,
  });
  if (error) return { error: "Impossible d'enregistrer le commentaire." };

  await admin.supabase
    .from("feedback")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", parsed.data.feedbackId);

  notifyDev(
    admin.email,
    `[Infamous] Commentaire sur le ticket #${ticket.number}`,
    `${admin.name} a commenté le ticket #${ticket.number} :\n\n${parsed.data.message}`,
    parsed.data.feedbackId
  );

  revalidatePath("/admin/feedback");
  revalidatePath(`/admin/feedback/${parsed.data.feedbackId}`);
  return {};
}

const statusSchema = z
  .object({
    feedbackId: z.string().uuid(),
    status: z.enum(FEEDBACK_STATUSES),
    comment: z.string().trim().max(5000).optional(),
  })
  .refine((d) => d.status !== "a_revoir" || (d.comment && d.comment.length > 0), {
    message: "Explique ce qui doit être revu (commentaire obligatoire).",
  });

export async function setFeedbackStatus(input: z.input<typeof statusSchema>): Promise<ActionResult> {
  const parsed = statusSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Données invalides" };

  const admin = await getAdmin();
  if (!admin) return { error: "Accès réservé aux administrateurs." };

  const { data: ticket } = await admin.supabase
    .from("feedback")
    .select("number")
    .eq("id", parsed.data.feedbackId)
    .single();
  if (!ticket) return { error: "Ticket introuvable." };

  const { error } = await admin.supabase.rpc("set_feedback_status", {
    p_feedback_id: parsed.data.feedbackId,
    p_status: parsed.data.status,
    p_comment: parsed.data.comment || null,
  });
  if (error) return { error: error.message || "Impossible de changer le statut." };

  const label = FEEDBACK_STATUS_LABELS[parsed.data.status as FeedbackStatus];
  notifyDev(
    admin.email,
    `[Infamous] Ticket #${ticket.number} → ${label}`,
    `${admin.name} a passé le ticket #${ticket.number} en « ${label} ».` +
      (parsed.data.comment ? `\n\n${parsed.data.comment}` : ""),
    parsed.data.feedbackId
  );

  revalidatePath("/admin/feedback");
  revalidatePath(`/admin/feedback/${parsed.data.feedbackId}`);
  return {};
}
