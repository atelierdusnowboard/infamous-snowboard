-- Seules les commandes créées par le nouveau checkout activent l'automatisme.
-- Les commandes et factures antérieures restent inchangées.
ALTER TABLE public.orders
  ADD COLUMN auto_invoice boolean NOT NULL DEFAULT false,
  ADD COLUMN invoice_error text;
