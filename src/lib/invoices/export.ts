import type { Invoice } from "./model";

export function invoiceCsv(invoices: Pick<Invoice, "number" | "issued_at" | "order_id" | "snapshot">[]): string {
  function cell(value: string | number): string {
    let text = String(value);
    if (/^[\s]*[=+@-]/.test(text) && typeof value === "string") text = "'" + text;
    return `"${text.replace(/"/g, '""')}"`;
  }
  const money = (cents: number) => (cents / 100).toFixed(2).replace(".", ",");
  const date = (value: string) => new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris" }).format(new Date(value));
  const rows: (string | number)[][] = [["Numéro", "Date émission", "Date paiement", "Commande", "Client", "Email", "Total HT EUR", "TVA 20 % EUR", "Total TTC EUR", "Paiement"]];
  for (const invoice of invoices) {
    const s = invoice.snapshot;
    rows.push([invoice.number, date(invoice.issued_at), date(s.paidAt), invoice.order_id, s.customer.name,
      s.customer.email, money(s.totalNet), money(s.totalVat), money(s.totalGross), s.paymentIntentId]);
  }
  return "\uFEFF" + rows.map(row => row.map(cell).join(";")).join("\r\n") + "\r\n";
}
