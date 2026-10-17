# Snip — tailoring, reimagined

Marketplace + studio CRM for tailors, boutiques and emerging designers in India (launching in Delhi).

**Customers** discover verified professionals on a map ("Near me"), compare services and prices, and book a home visit or a studio appointment.
**Professionals** get a verified public profile plus a free CRM: clients, measurements, an order pipeline (received → cutting → stitching → trial → ready → delivered), dues, CSV export, and one-click WhatsApp and Gmail messages.
**Admins** verify studios before they go live, and manage plans and roles.
**Revenue:** Premium (₹499/mo) and Priority (₹999/mo) visibility plans, billed through Dodo Payments.

## Stack
Next.js 15 (App Router, server actions) · Supabase (Postgres + Auth + Storage, row-level security) · Tailwind CSS · Leaflet + OpenStreetMap · Dodo Payments · deploys on Vercel.

## Run locally
```bash
npm install
cp .env.example .env.local   # fill in Supabase keys, or leave blank for demo mode
npm run dev                  # http://localhost:3000
```
With no env vars set, the site runs in **demo mode** with 8 sample Delhi studios. Login, bookings and the CRM need Supabase.

## Deploy
See **[DEPLOY.md](./DEPLOY.md)**: GitHub, then Supabase, then Vercel, then Dodo, step by step.

## Routes
| Path | What |
|---|---|
| `/` | Landing page |
| `/discover` | Search, filters, map, near-me |
| `/designers/[slug]` | Studio profile, services, reviews, booking |
| `/account` | Customer's bookings |
| `/for-designers` | Pitch and pricing for professionals |
| `/dashboard` | Studio overview: stats, upcoming visits, dues |
| `/dashboard/bookings` | Confirm, decline or complete; WhatsApp or Gmail the customer; open in CRM |
| `/dashboard/clients`, `/[id]` | Client book, measurements, quick-message templates, CSV export |
| `/dashboard/orders` | Kanban order pipeline with fabric photos and payments |
| `/dashboard/profile` | Listing editor, map pin, photo uploads, services |
| `/dashboard/billing` | Upgrade via Dodo checkout, manage subscription |
| `/admin` | Verify or reject studios, set plans, change roles |
| `/api/webhooks/dodo` | Payment webhook (Standard Webhooks signature) |

## Database
`supabase/schema.sql` creates the tables, row-level security, triggers and the storage bucket. `supabase/seed.sql` adds demo listings; regenerate it with `node scripts/gen-seed.mjs` after editing `lib/demo-data.json`.

Security rules that are enforced in the database (not only in the UI):
- Sign-ups can only become `customer` or `designer`, never `admin`, and users can't change their own role.
- Studios start `pending`. Only admins can verify them, change plans, or touch ratings.
- CRM clients and orders are visible only to the studio that owns them.
- Reviews require a completed booking with that studio, and ratings recalculate automatically.
