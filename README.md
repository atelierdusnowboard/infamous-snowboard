This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Factures des ventes Infamous

Pour les nouvelles commandes, une facture acquittée est automatiquement émise et archivée après confirmation effective du paiement par un webhook Stripe signé. Les administrateurs peuvent aussi émettre une facture depuis le détail d’une commande payée, puis télécharger le PDF. `/admin/invoices` rassemble les factures et propose un export CSV annuel (année d’émission, fuseau Europe/Paris).

Installation : appliquer `supabase/migrations/0011_invoices.sql` puis `0012_automatic_invoices.sql` sur la base Supabase avant de déployer cette version. Les migrations n’émettent aucune facture. Les commandes antérieures gardent `auto_invoice = false` ; le nouveau checkout active ce champ à la création. Le webhook doit recevoir `checkout.session.completed` et, si des paiements différés sont activés, `checkout.session.async_payment_succeeded`. Aucun abonnement Stripe Invoicing n’est utilisé ; seule l’API de paiement existante sert à contrôler les encaissements.

Configuration validée : ATELIER DU SNOWBOARD, SARL au capital de 1 000 EUR, 11 rue des Sagnes, 38860 Les Deux Alpes, SIRET 52856609400017, RCS Grenoble 528566094, TVA FR09528566094. Les prix sont TTC et le taux utilisé est 20 %.

L’émission est réservée aux ventes facturées et livrées en France. Le paiement doit être encaissé en EUR, sans remboursement ni contestation ; le total, les articles et la remise doivent correspondre à Stripe. Les coordonnées de facturation sont celles du paiement. Les ventes internationales, les paiements sans référence exploitable et les corrections par avoir demandent un traitement comptable distinct. Ce module PDF ne réalise pas l’e-reporting ni la transmission B2B par une plateforme agréée.

La série `INF-000001`, `INF-000002`, etc. est distincte pour les ventes du site et ne redémarre pas chaque année. L’attribution est transactionnelle et protégée contre les doubles clics concurrents. Une ancienne vente reçoit la date réelle d’émission et conserve sa date de paiement. L’admin doit vérifier qu’elle n’a pas déjà été facturée ailleurs.

Les coordonnées, articles, montants et mentions du vendeur sont figés dans `invoices.snapshot`. Le PDF final est conservé dans `invoices.pdf_base64` : les téléchargements suivants rendent les mêmes octets. Une facture émise ne peut être modifiée ni supprimée via l’application ou les opérations SQL ordinaires. Inclure ces tables dans les sauvegardes durables de la base ; ne pas modifier ou réinitialiser le compteur en production.

Validation : `npm run test:invoices` vérifie les saisies avec virgule, les totaux du panier, les arrondis, les paiements refusés, l’export CSV et le rendu PDF simple/multipage. Les exemples fictifs sont créés dans `/tmp/infamous-invoice-preview`. La migration a aussi été testée sur un PostgreSQL local isolé : numérotation concurrente, idempotence, rollback, archivage immuable et droits d’accès.

Les pannes techniques d’émission ou d’archivage renvoient un échec au webhook pour déclencher les nouvelles tentatives Stripe. Les refus métier (TVA internationale, remboursement, coordonnées incomplètes, etc.) sont signalés dans `orders.invoice_error`, visible dans le détail admin de la commande, sans boucle de retries. Une émission manuelle réussie efface cette erreur. Les doublons réutilisent la facture déjà attribuée et son PDF archivé.
