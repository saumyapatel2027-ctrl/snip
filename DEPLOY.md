# DEPLOY.md — take Snip from this folder to a live URL

**Who this is for:** a Claude assistant (any plan) working in the owner's own Chrome via the Claude in Chrome extension, with the owner present. Follow the steps in order. Each step says what *you* (Claude) do and what *the owner* does.

**Ground rules for the assistant**
- The owner signs in or signs up on every website themselves. You never type passwords or create accounts. When a step needs that, stop and ask the owner to do it, then continue.
- Keys and secrets (Supabase keys, Dodo API key, webhook secret) are copied **from the provider's page straight into Vercel's environment-variable form**. Never paste them into chat, code, or GitHub.
- Ask the owner before any final "Create", "Deploy" or "Publish" click.
- Time needed: about 30 minutes. Payments (Step 6) are optional for the first launch.

The app runs in **demo mode** (sample Delhi listings, read-only) until Supabase keys are added. So you can deploy to Vercel first, then wire Supabase. Either order works.

---

## Step 1 — Put the code on GitHub

**Owner:** sign in at https://github.com.

**Assistant:**
1. Open https://github.com/new. Repository name: `snip`. Choose **Private**. Leave all "Initialize" options unticked. Ask the owner to confirm, then click **Create repository**.
2. Upload the code:
   - **Easiest:** on the new empty repo page, click **uploading an existing file**. Ask the owner to drag in the *contents* of the unzipped `snip` folder (not the folder itself, and not `node_modules`). Commit message: `Initial Snip build`. Click **Commit changes**.
   - **If a terminal is available:**
     ```bash
     cd snip
     git remote add origin https://github.com/<owner-username>/snip.git
     git push -u origin main
     ```
     The zip already contains a git repo with one commit.
3. Check that `package.json`, `app/`, `supabase/` and `DEPLOY.md` are at the **top level** of the repo.

## Step 2 — Create the Supabase project (database, login, photo storage)

**Owner:** sign in or sign up at https://supabase.com/dashboard (the free plan is fine).

**Assistant:**
1. Click **New project**. Settings:
   - Name: `snip`
   - Region: **South Asia (Mumbai)**, closest to Delhi users.
   - Database password: ask the **owner** to click **Generate a password** and save it in their password manager. You don't need it.
2. Ask before clicking **Create new project**, then wait about 2 minutes for it to finish setting up.
3. Go to **SQL Editor → New query**. Open `supabase/schema.sql` from the GitHub repo (click the file, then **Raw**). Select all, copy it into the editor, and click **Run**. You should see "Success. No rows returned".
4. Do the same with `supabase/seed.sql`: new query, paste, **Run**. This adds 8 sample Delhi studios. You can skip it for a clean launch.
5. Go to **Project Settings → API**. Keep this tab open. You'll copy three values in Step 3:
   - **Project URL**
   - **anon / public** key
   - **service_role** key. This one is secret: server-only, never shown publicly.

## Step 3 — Deploy on Vercel

**Owner:** sign in at https://vercel.com, ideally with **Continue with GitHub**.

**Assistant:**
1. Open https://vercel.com/new and **Import** the `snip` repo. If it isn't listed, click **Adjust GitHub App Permissions** and ask the owner to grant access to the repo.
2. Framework preset: **Next.js** (detected automatically). Leave build settings as they are.
3. Expand **Environment Variables** and add:

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase **Project URL** |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase **anon public** key |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase **service_role** key |
   | `NEXT_PUBLIC_SITE_URL` | leave empty for now (set in step 5) |
   | `DODO_PAYMENTS_ENVIRONMENT` | `test_mode` |

4. Ask the owner to confirm, then click **Deploy**. It takes about 2 minutes. Copy the production URL, e.g. `https://snip-xyz.vercel.app`.
5. **Settings → Environment Variables**: set `NEXT_PUBLIC_SITE_URL` to that URL with no trailing slash. Then go to **Deployments**, open the **⋯** menu on the latest deployment, and click **Redeploy**.

## Step 4 — Connect Supabase login to the live URL

**Assistant:** in Supabase, go to **Authentication → URL Configuration**:
- **Site URL:** `https://snip-xyz.vercel.app` (the Vercel URL)
- **Redirect URLs:** add `https://snip-xyz.vercel.app/**` and `http://localhost:3000/**`
- Save.

Optional, for faster testing: **Authentication → Sign In / Providers → Email**. Turn **off** "Confirm email" so new sign-ups can log in immediately. Turn it back **on** before a public launch.

## Step 5 — Make the owner an admin and test

1. On the live site, the **owner** signs up at `/signup` with their own email.
2. **Assistant:** in Supabase **SQL Editor**, run this, replacing the owner's email:
   ```sql
   update public.profiles set role = 'admin' where email = 'OWNER_EMAIL_HERE';
   ```
3. The owner logs out and back in. They now land on `/admin`.
4. Smoke test, with the owner creating any extra test accounts:
   - [ ] `/discover` shows studios and the map. **Near me** asks for location and sorts by distance.
   - [ ] Sign up as a **professional**: `/dashboard/profile`, fill in the studio, drop a map pin, upload photos, add services.
   - [ ] As admin, `/admin`: the new studio appears under **pending**. Click **Verify & publish**. It now appears on `/discover`.
   - [ ] As a **customer**: open the studio, book a slot. In the designer's **Bookings**, confirm it, then **Open in CRM**.
   - [ ] In the CRM: save measurements, add an order with a fabric photo, move it through the pipeline, and check that the WhatsApp and Gmail buttons open with pre-filled text.

## Step 6 — Payments with Dodo (designer Premium and Priority plans)

**Owner:** sign up or sign in at https://app.dodopayments.com. Stay in **Test mode** (toggle at the top) until going live.

**Assistant:**
1. **Products → Create product**, twice:
   - `Snip Premium`: **Subscription**, ₹499, monthly, currency INR.
   - `Snip Priority`: **Subscription**, ₹999, monthly, currency INR.
   - Copy each product's **ID**, which starts with `pdt_`.
2. **Developer → API Keys → Create API key**. Copy it straight into Vercel as `DODO_PAYMENTS_API_KEY`.
3. **Developer → Webhooks → Add endpoint**:
   - URL: `https://snip-xyz.vercel.app/api/webhooks/dodo`
   - Events: all `subscription.*` events and `payment.succeeded`.
   - Save, then copy the **Signing secret** (starts with `whsec_`) into Vercel as `DODO_PAYMENTS_WEBHOOK_SECRET`.
4. In Vercel, also add `DODO_PRODUCT_PREMIUM` = Premium product ID and `DODO_PRODUCT_PRIORITY` = Priority product ID. Then **Redeploy**.
5. Test as a designer: **Plan & billing → Upgrade to Premium**. Pay with a Dodo test card from https://docs.dodopayments.com, then return. Refresh: the plan shows Premium, and the studio gets a "Featured" badge and ranks higher on `/discover`.
6. Going live later: switch Dodo to Live mode, recreate the two products and the webhook there, update the four `DODO_*` variables, set `DODO_PAYMENTS_ENVIRONMENT=live_mode`, and redeploy.

> Dodo is used **only** for designer subscriptions. Customers pay studios directly at the visit. Collecting customer payments for services and paying them out to tailors is a different setup (a marketplace/split-payment gateway such as Razorpay Route) and is a v2 decision.

## Step 7 — Custom domain (optional)

In Vercel: **Settings → Domains → Add**, e.g. `snip.in`, and follow the DNS instructions. Then update `NEXT_PUBLIC_SITE_URL`, the Supabase **Site URL** and **Redirect URLs**, and the Dodo webhook URL to the new domain. Redeploy.

---

### Troubleshooting

| Symptom | Fix |
|---|---|
| Black "Demo mode" bar still showing | Supabase env vars are missing or misspelled in Vercel. Fix them, then **Redeploy**. Env changes only apply after a redeploy. |
| Signup says "check your inbox" but no email arrives | Check spam, or turn off "Confirm email" (Step 4). Supabase's built-in email has a low hourly limit; add custom SMTP (e.g. Resend) for launch. |
| Confirmation link goes to localhost | Supabase **Site URL** is still the default. Redo Step 4. |
| Photo upload fails | `schema.sql` wasn't fully run, so the storage bucket is missing. Re-run it; it's safe to run twice. |
| New studio not visible on Discover | Expected. Studios appear only after an admin verifies them in `/admin`. |
| Upgrade button says payments aren't set up | One of `DODO_PAYMENTS_API_KEY`, `DODO_PRODUCT_PREMIUM` or `DODO_PRODUCT_PRIORITY` is missing. Add it and redeploy. |
| Paid, but the plan didn't change | Check the webhook URL and secret in Dodo. Dodo's webhook log shows the HTTP response. A 401 means a wrong secret. |
| Map tiles don't load | Ad-blockers sometimes block OpenStreetMap. Try another browser. |
