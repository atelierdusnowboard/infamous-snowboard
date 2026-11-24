import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { Invoice } from "./model";

const date = (value: string) => new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris" }).format(new Date(value));
const amount = (value: number, digits = 2) => (value / 100).toFixed(digits).replace(".", ",") + " EUR";

// Le PDF final est archivé en base. Ne jamais recalculer une facture archivée.
export async function renderInvoicePdf(invoice: Invoice): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const s = invoice.snapshot;
  doc.setTitle(`Facture ${invoice.number} - Infamous`);
  doc.setAuthor(s.seller.name);
  doc.setCreationDate(new Date(invoice.issued_at));
  doc.setModificationDate(new Date(invoice.issued_at));
  let page = doc.addPage([595.28, 841.89]);
  let y = 795;
  const clean = (text: string) => text.replace(/[\r\n\t]+/g, " ").trim();
  function text(value: string, x: number, top: number, size = 10, heavy = false) {
    page.drawText(clean(value), { x, y: top, size, font: heavy ? bold : regular, color: rgb(0.08, 0.08, 0.08) });
  }
  function right(value: string, edge: number, top: number, size = 10, heavy = false) {
    text(value, edge - (heavy ? bold : regular).widthOfTextAtSize(clean(value), size), top, size, heavy);
  }
  function wrap(value: string, width: number, size = 10) {
    const rows: string[] = [];
    let row = "";
    for (const word of clean(value).split(/\s+/)) {
      if (row && regular.widthOfTextAtSize(`${row} ${word}`, size) > width) {
        rows.push(row);
        row = "";
      }
      if (regular.widthOfTextAtSize(word, size) <= width) {
        row = row ? `${row} ${word}` : word;
      } else {
        // Une référence longue sans espaces doit également pouvoir être coupée.
        for (const char of word) {
          if (regular.widthOfTextAtSize(row + char, size) > width) { rows.push(row); row = ""; }
          row += char;
        }
      }
    }
    if (row.trim()) rows.push(row.trim());
    return rows;
  }
  function paragraph(value: string, x: number, top: number, width: number, size = 10) {
    const rows = wrap(value, width, size);
    for (const row of rows) { text(row, x, top, size); top -= 14; }
    return top;
  }
  function tableHeader() {
    page.drawRectangle({ x: 40, y: y - 9, width: 515, height: 27, color: rgb(0.94, 0.94, 0.94) });
    text("Désignation", 48, y, 9, true);
    right("Qté", 349, y, 9, true);
    right("Prix unitaire HT", 451, y, 9, true);
    right("Total TTC", 547, y, 9, true);
    y -= 32;
  }
  function newPage(table = false) {
    page = doc.addPage([595.28, 841.89]);
    y = 790;
    text("INFAMOUS", 40, y, 19, true);
    right(`Facture ${invoice.number}`, 555, y, 11, true);
    y -= 40;
    if (table) tableHeader();
  }

  text("INFAMOUS", 40, y, 27, true);
  right("FACTURE", 555, y, 24, true);
  y -= 28;
  text(s.seller.name, 40, y, 11, true);
  right(invoice.number, 555, y, 12, true);
  y -= 18;
  text(s.seller.address, 40, y);
  right(`Émise le ${date(invoice.issued_at)}`, 555, y);
  y -= 15;
  text(s.seller.city, 40, y);
  y -= 28;
  text(`Commande ${s.orderId.slice(0, 8).toUpperCase()} du ${date(s.orderedAt)}`, 40, y);
  y -= 16;
  text(`Date de vente / paiement : ${date(s.paidAt)} - Nature : livraison de biens`, 40, y, 9);
  y -= 30;
  text("FACTURÉ À", 40, y, 9, true);
  text("ADRESSE DE LIVRAISON", 310, y, 9, true);
  y -= 18;
  let billingY = y;
  let shippingY = y;
  for (const line of [s.customer.name, ...s.customer.lines, "France", s.customer.email]) {
    billingY = paragraph(line, 40, billingY, 235);
  }
  for (const line of [s.shipping.name, ...s.shipping.lines, "France"]) {
    shippingY = paragraph(line, 310, shippingY, 245);
  }
  y = Math.min(billingY, shippingY) - 30;
  if (y < 150) newPage();
  tableHeader();

  for (const line of s.lines) {
    const rows = wrap(line.description, 265);
    let offset = 0;
    while (offset < rows.length) {
      if (y < 130) newPage(true);
      const count = Math.max(1, Math.min(rows.length - offset, Math.floor((y - 110) / 14)));
      rows.slice(offset, offset + count).forEach((row, index) => text(row, 48, y - index * 14));
      if (offset === 0) {
        right(String(line.quantity), 349, y);
        right(amount(line.gross < 0 ? line.gross * 100 / 120 : line.unitGross * 100 / 120, 4), 451, y, 9);
        right(amount(line.gross), 547, y);
      }
      y -= count * 14 + 14;
      offset += count;
    }
    page.drawLine({ start: { x: 40, y: y + 14 }, end: { x: 555, y: y + 14 }, thickness: 0.4, color: rgb(0.8, 0.8, 0.8) });
  }
  if (y < 255) newPage();
  y -= 16;
  for (const [label, value] of [["Total HT", s.totalNet], ["TVA 20 %", s.totalVat], ["Total TTC", s.totalGross]] as const) {
    text(label, 335, y, 11, label === "Total TTC");
    right(amount(value), 547, y, 11, label === "Total TTC");
    y -= 23;
  }
  y -= 10;
  text(`ACQUITTÉE - ${amount(s.totalGross)} réglés le ${date(s.paidAt)}`, 40, y, 10, true);
  y -= 18;
  text("Paiement en ligne par Stripe. Net à payer : 0,00 EUR.", 40, y, 9);
  y -= 16;
  text("Escompte pour paiement anticipé : néant.", 40, y, 9);
  y -= 16;
  paragraph("Garantie légale de conformité : 2 ans pour les biens concernés.", 40, y, 510, 9);

  const pages = doc.getPages();
  pages.forEach((p, index) => {
    page = p;
    text(`${s.seller.name} - ${s.seller.legalForm}`, 40, 66, 8);
    text(`${s.seller.registration} - SIRET ${s.seller.siret}`, 40, 53, 8);
    text(`TVA intracommunautaire : ${s.seller.vatNumber}`, 40, 40, 8);
    right(`${invoice.number} | ${index + 1} / ${pages.length}`, 555, 40, 8);
  });
  return doc.save();
}
