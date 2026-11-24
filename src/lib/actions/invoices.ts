"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getIsAdmin } from "@/lib/queries/auth";
import { archivedInvoicePdf, issueOrderInvoice } from "@/lib/invoices/server";
import { InvoiceError } from "@/lib/invoices/model";
import { createServiceClient } from "@/lib/supabase/server";

export async function issueInvoiceAction(form: FormData): Promise<void> {
  if (!(await getIsAdmin())) throw new Error("Accès réservé aux administrateurs.");
  const id = z.uuid().parse(form.get("orderId"));
  if (form.get("noPreviousInvoice") !== "on") throw new Error("Veuillez vérifier l’absence de facture existante.");
  const path = `/admin/orders/${id}`;
  let errorMessage: string | null = null;
  try {
    const invoice = await issueOrderInvoice(id);
    await archivedInvoicePdf(invoice);
    const { error } = await createServiceClient().from("orders").update({ invoice_error: null }).eq("id", id);
    if (error) throw error;
  } catch (error) {
    console.error("[invoices] Émission impossible", error);
    errorMessage = error instanceof InvoiceError ? error.message : "La facture n’a pas pu être préparée. Réessayez ou contactez l’administrateur.";
  }
  revalidatePath(path);
  revalidatePath("/admin/invoices");
  redirect(errorMessage ? `${path}?invoiceError=${encodeURIComponent(errorMessage)}` : path);
}
