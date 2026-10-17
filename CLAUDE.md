# CLAUDE.md — project brief for AI assistants

Snip is a Next.js 15 + Supabase marketplace and CRM for Indian tailors and boutiques. Read README.md for features and routes, and DEPLOY.md for deployment.

## Map
- `app/(site)/…` public pages (header and footer layout). `app/dashboard/…` studio CRM. `app/admin/…` admin. Mutations live in `actions.ts` files next to their pages (server actions).
- `lib/supabase/{server,client,admin}.ts`: always use these clients. `admin.ts` (service role) is only for webhooks.
- `lib/data.ts`: public reads, with a demo-data fallback when Supabase env vars are missing.
- `lib/dashboard.ts`: `getStudio()` / `requireStudio()` for every dashboard page and action.
- `supabase/schema.sql`: the single source of truth for the DB. It is idempotent; to change the DB, edit it and re-run it in the SQL Editor.

## Conventions
- Design tokens are in `tailwind.config.ts` (ivory, ink, maroon, saffron, jade). Use the component classes in `app/globals.css` (`btn-primary`, `card`, `input`, `chip`, `label`, `eyebrow`) rather than one-off styles. Display font is Fraunces, body font is Plus Jakarta Sans.
- Security lives in Postgres RLS and triggers, not only in the UI. When you add a table, add RLS policies in `schema.sql`.
- Money is stored as whole rupees (integers). Format with `inr()`. Dates display in en-IN.
- WhatsApp and Gmail use deep links (`whatsappLink`, `gmailLink` in `lib/utils.ts`), so no API keys are needed.
- Before committing, run `npm run build`; it must pass.

## Compounding workflow
Plan, then build, then review, then record. After fixing a bug or learning something non-obvious, add one line to `docs/LEARNINGS.md` so the next session starts smarter. Read that file first.
