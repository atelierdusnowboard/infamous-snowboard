import { getIsAdmin } from "@/lib/queries/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { invoiceCsv } from "@/lib/invoices/export";
import { invoiceSnapshotSchema, type Invoice } from "@/lib/invoices/model";

export async function GET(request: Request) {
  if (!(await getIsAdmin())) return Response.json({ error: "Accès interdit" }, { status: 403 });
  const year = new URL(request.url).searchParams.get("year");
  if (!year || !/^20\d{2}$/.test(year)) return Response.json({ error: "Année invalide" }, { status: 400 });
  try {
    const db = createServiceClient();
    const invoices: Invoice[] = [];
    // Bornes UTC correspondant au 1er janvier à Paris, fuseau des dates affichées.
    for (let offset = 0; ; offset += 1000) {
      const { data, error } = await db.from("invoices").select("number, issued_at, order_id, snapshot")
        .gte("issued_at", `${year}-01-01T00:00:00+01:00`).lt("issued_at", `${Number(year) + 1}-01-01T00:00:00+01:00`)
        .order("number").range(offset, offset + 999);
      if (error) throw error;
      for (const row of data) invoices.push({ ...row, snapshot: invoiceSnapshotSchema.parse(row.snapshot) } as Invoice);
      if (data.length < 1000) break;
    }
    return new Response(invoiceCsv(invoices), { headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="factures-infamous-${year}.csv"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    } });
  } catch (error) {
    console.error("[invoices] Export impossible", error);
    return Response.json({ error: "Export indisponible" }, { status: 500 });
  }
}
