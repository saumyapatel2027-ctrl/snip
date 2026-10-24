# Learnings
- Fonts load via a Google Fonts <link> in app/layout.tsx (not next/font) so builds don't need network access to Google.
- Leaflet must be loaded with next/dynamic + ssr:false (components/StudioMap.tsx, LocationPicker.tsx); markers use L.divIcon to avoid broken default icon paths.
- Seeded demo studios have no owner; seed.sql re-applies their headline rating after inserting reviews, because the reviews trigger recalculates ratings.
- Dashboard pages render as static redirects in demo mode; once Supabase env vars are set they become dynamic on the next build — always Redeploy after changing env vars.
