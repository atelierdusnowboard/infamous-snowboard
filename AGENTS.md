<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Retours admin (tickets)

Les admins (Julien = atelierdusnow@yahoo.fr) remontent problèmes / demandes d'amélioration via le bouton flottant « Retour » (`src/components/feedback/FeedbackWidget.tsx`, visible uniquement pour un admin connecté). Consultation : `/admin/feedback`. Tables `feedback` + `feedback_comments` (`supabase/migrations/0010_feedback.sql`).

Statuts : `a_traiter` → (dev) `a_valider` → (Julien) `valide` ou `a_revoir` (commentaire obligatoire) → (dev) `a_valider`…

Quand on me demande de « traiter les tickets » :
1. `npx tsx scripts/feedback.ts list` (tickets `a_traiter` + `a_revoir`, avec tout l'historique) ; `show <n°>` pour un seul.
2. Faire la correction, la committer.
3. `npx tsx scripts/feedback.ts done <n°> "explication courte de ce qui a été fait, en français, pour Julien"` → passe en `a_valider` (« Traité · à valider »). Ne jamais passer moi-même un ticket en `valide` : c'est à Julien.
4. Question à poser plutôt que de deviner : `comment <n°> "question"` sans changer le statut.

E-mail à expertnocode@gmail.com (Resend, `RESEND_API_KEY`) à chaque création / commentaire / changement de statut fait par quelqu'un d'autre que lui.
