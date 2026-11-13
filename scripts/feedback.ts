/**
 * Traitement des tickets de retours admin en ligne de commande (usage dev / Claude).
 *
 *   npx tsx scripts/feedback.ts list [statut|all]     # défaut : a_traiter + a_revoir
 *   npx tsx scripts/feedback.ts show <n°>
 *   npx tsx scripts/feedback.ts comment <n°> "message"
 *   npx tsx scripts/feedback.ts done <n°> "ce qui a été fait"   # → a_valider
 *   npx tsx scripts/feedback.ts status <n°> <statut> ["message"]
 *
 * Les actions sont signées au nom de DEV_EMAIL (pas d'e-mail de notification envoyé).
 */
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const envPath = path.join(process.cwd(), ".env.local");
fs.readFileSync(envPath, "utf8").split("\n").forEach((line) => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match && !process.env[match[1].trim()]) process.env[match[1].trim()] = match[2].trim();
});

const DEV_EMAIL = process.env.FEEDBACK_NOTIFY_EMAIL || "expertnocode@gmail.com";
const STATUSES = ["a_traiter", "a_valider", "a_revoir", "valide"];

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SELECT = `id, number, type, message, page_url, status, created_at,
  author:profiles!feedback_user_id_fkey(email, full_name),
  comments:feedback_comments(message, status_from, status_to, created_at,
    author:profiles!feedback_comments_user_id_fkey(email, full_name))`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;

function who(a: Row) {
  return a?.full_name || a?.email || "?";
}

async function getTicket(n: string): Promise<Row> {
  const { data, error } = await supabase.from("feedback").select(SELECT).eq("number", Number(n)).single();
  if (error || !data) throw new Error(`Ticket #${n} introuvable`);
  return data;
}

async function devId(): Promise<string> {
  const { data } = await supabase.from("profiles").select("id").eq("email", DEV_EMAIL).single();
  if (!data) throw new Error(`Profil ${DEV_EMAIL} introuvable`);
  return data.id;
}

function print(t: Row) {
  console.log(`\n#${t.number} [${t.status}] ${t.type} — ${who(t.author)} — ${t.created_at}`);
  if (t.page_url) console.log(`Page : ${t.page_url}`);
  console.log(`\n${t.message}\n`);
  const comments = [...(t.comments ?? [])].sort((a: Row, b: Row) => a.created_at.localeCompare(b.created_at));
  for (const c of comments) {
    const move = c.status_to ? ` (${c.status_from} → ${c.status_to})` : "";
    console.log(`  · ${who(c.author)} ${c.created_at}${move}${c.message ? `\n    ${c.message.replace(/\n/g, "\n    ")}` : ""}`);
  }
}

async function setStatus(n: string, status: string, message?: string) {
  if (!STATUSES.includes(status)) throw new Error(`Statut invalide : ${status}`);
  if (status === "a_revoir" && !message?.trim()) throw new Error("Commentaire obligatoire pour a_revoir");
  const t = await getTicket(n);
  if (t.status === status) throw new Error(`#${n} est déjà en ${status}`);
  const uid = await devId();
  const { error: e1 } = await supabase
    .from("feedback")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", t.id);
  if (e1) throw e1;
  const { error: e2 } = await supabase.from("feedback_comments").insert({
    feedback_id: t.id,
    user_id: uid,
    message: message?.trim() || null,
    status_from: t.status,
    status_to: status,
  });
  if (e2) throw e2;
  console.log(`#${n} : ${t.status} → ${status}`);
}

async function main() {
  const [cmd, a, b, c] = process.argv.slice(2);
  switch (cmd) {
    case "list":
    case undefined: {
      let q = supabase.from("feedback").select(SELECT).order("created_at");
      if (a !== "all") q = q.in("status", a ? [a] : ["a_traiter", "a_revoir"]);
      const { data, error } = await q;
      if (error) throw error;
      if (!data?.length) console.log("Aucun ticket.");
      data?.forEach(print);
      break;
    }
    case "show":
      print(await getTicket(a));
      break;
    case "comment": {
      if (!b?.trim()) throw new Error("Message vide");
      const t = await getTicket(a);
      const { error } = await supabase
        .from("feedback_comments")
        .insert({ feedback_id: t.id, user_id: await devId(), message: b.trim() });
      if (error) throw error;
      await supabase.from("feedback").update({ updated_at: new Date().toISOString() }).eq("id", t.id);
      console.log(`Commentaire ajouté sur #${a}`);
      break;
    }
    case "done":
      await setStatus(a, "a_valider", b);
      break;
    case "status":
      await setStatus(a, b, c);
      break;
    default:
      console.log("Commandes : list [statut|all] | show <n> | comment <n> <msg> | done <n> [msg] | status <n> <statut> [msg]");
  }
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});
