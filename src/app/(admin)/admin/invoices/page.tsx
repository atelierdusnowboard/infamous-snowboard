import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils/format";
import type { Invoice } from "@/lib/invoices/model";

export const metadata = { title: "Admin — Factures", robots: { index: false, follow: false } };

export default async function InvoicesPage({ searchParams }: { searchParams: Promise<{ year?: string; page?: string }> }) {
  const params = await searchParams;
  const year = /^20\d{2}$/.test(params.year ?? "") ? params.year! : new Intl.DateTimeFormat("fr", { year: "numeric", timeZone: "Europe/Paris" }).format(new Date());
  const page = Math.max(0, Math.min(100000, Number.parseInt(params.page ?? "0", 10) || 0));
  const db = await createClient();
  const { data, error, count } = await db.from("invoices").select("number, issued_at, order_id, snapshot", { count: "exact" })
    .gte("issued_at", `${year}-01-01T00:00:00+01:00`).lt("issued_at", `${Number(year) + 1}-01-01T00:00:00+01:00`)
    .order("issued_at", { ascending: false }).order("number", { ascending: false }).range(page * 50, page * 50 + 49);
  const invoices = (data ?? []) as Invoice[];
  return <div className="space-y-6">
    <Link href="/admin/orders" className="text-xs underline">Retour aux commandes</Link>
    <h1 className="text-2xl font-black uppercase tracking-widest">Factures</h1>
    <div className="flex flex-wrap items-end justify-between gap-4">
      <form className="flex items-end gap-3">
        <label className="text-sm">Année d’émission<input type="number" name="year" min="2000" max="2099" defaultValue={year} className="block border border-black p-2 mt-1 w-28" /></label>
        <button className="border border-black px-4 py-2 text-sm">Afficher</button>
      </form>
      {!error && <a className="bg-black text-white px-4 py-3 text-xs uppercase font-bold tracking-widest" href={`/api/admin/invoices/export?year=${year}`}>Exporter pour le comptable (CSV)</a>}
    </div>
    <p className="text-sm text-black/60">Les factures sont émises depuis le détail d’une commande payée. Cet export contient uniquement les factures déjà émises.</p>
    {error ? <p role="alert">La facturation sera disponible après l’installation de la mise à jour de la base de données.</p> : <>
      <div className="overflow-x-auto border border-black">
        <table className="w-full text-sm text-left">
          <thead className="bg-black text-white"><tr>{["Facture", "Émise le", "Client", "TTC", "Document"].map(label => <th key={label} className="p-3">{label}</th>)}</tr></thead>
          <tbody>{invoices.map(invoice => <tr key={invoice.number} className="border-t border-black/20">
            <td className="p-3"><Link className="underline" href={`/admin/orders/${invoice.order_id}`}>{invoice.number}</Link></td>
            <td className="p-3">{new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris" }).format(new Date(invoice.issued_at))}</td>
            <td className="p-3">{invoice.snapshot.customer.name}</td><td className="p-3">{formatPrice(invoice.snapshot.totalGross / 100)}</td>
            <td className="p-3"><a className="underline" href={`/api/admin/orders/${invoice.order_id}/invoice`} aria-label={`Télécharger la facture ${invoice.number}`}>PDF</a></td>
          </tr>)}</tbody>
        </table>
        {!invoices.length && <p className="p-8 text-center">Aucune facture émise pour cette année.</p>}
      </div>
      <nav aria-label="Pagination des factures" className="flex justify-between text-sm underline">
        {page > 0 ? <Link href={`/admin/invoices?year=${year}&page=${page - 1}`}>Précédent</Link> : <span />}
        {(count ?? 0) > (page + 1) * 50 && <Link href={`/admin/invoices?year=${year}&page=${page + 1}`}>Suivant</Link>}
      </nav>
    </>}
  </div>;
}
