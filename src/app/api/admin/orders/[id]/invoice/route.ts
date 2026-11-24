import { z } from "zod";
import { getIsAdmin } from "@/lib/queries/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { archivedInvoicePdf } from "@/lib/invoices/server";
import type { Invoice } from "@/lib/invoices/model";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getIsAdmin())) return Response.json({ error: "Accès interdit" }, { status: 403 });
  const parsed = z.uuid().safeParse((await params).id);
  if (!parsed.success) return Response.json({ error: "Commande invalide" }, { status: 400 });
  try {
    const { data, error } = await createServiceClient().from("invoices").select("*").eq("order_id", parsed.data).maybeSingle();
    if (error) throw error;
    if (!data) return Response.json({ error: "Aucune facture émise pour cette commande" }, { status: 404 });
    const pdf = await archivedInvoicePdf(data as Invoice);
    return new Response(Buffer.from(pdf), { headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="facture-${data.number}.pdf"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    } });
  } catch (error) {
    console.error("[invoices] Téléchargement impossible", error);
    return Response.json({ error: "Téléchargement indisponible. Réessayez." }, { status: 500 });
  }
}
