// Serveur uniquement. Envoi d'e-mails via l'API HTTP de Resend (pas de dépendance npm).
// Sans RESEND_API_KEY, l'envoi est ignoré silencieusement (dev local).

const DEV_EMAIL = "expertnocode@gmail.com";

export function feedbackNotifyEmail(): string {
  return process.env.FEEDBACK_NOTIFY_EMAIL || DEV_EMAIL;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendEmail({
  to,
  subject,
  text,
  link,
}: {
  to: string;
  subject: string;
  text: string;
  link?: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY absente — e-mail non envoyé :", subject);
    return;
  }

  const html = `<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.5;color:#000">
${escapeHtml(text).replace(/\n/g, "<br>")}
${link ? `<p style="margin-top:24px"><a href="${escapeHtml(link)}" style="background:#000;color:#fff;padding:10px 16px;text-decoration:none;font-weight:bold;text-transform:uppercase;font-size:12px;letter-spacing:2px">Ouvrir le ticket</a></p>` : ""}
</div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.FEEDBACK_EMAIL_FROM || "Infamous Retours <onboarding@resend.dev>",
        to: [to],
        subject,
        text: link ? `${text}\n\n${link}` : text,
        html,
      }),
    });
    if (!res.ok) {
      console.error("[email] Échec Resend", res.status, await res.text());
    }
  } catch (err) {
    console.error("[email] Erreur d'envoi", err);
  }
}
