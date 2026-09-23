# KOMOLA Rewardor

Dedicated Rewardor web experience for creating campaigns, monitoring buyer claims, and reviewing redemptions.

## Current implementation

The API-backed Rewardor workspace uses the shared Supabase Auth identity and the
Go API. It does not create a second user/profile table or connect directly to
PostgreSQL. The API boundary is defined in `shared/lib/api.ts`.

Rewardor registration is self-contained. It creates the Supabase account,
Rewardor organization, owner membership, first Visakhapatnam location, and
POS register through `POST /api/v1/seller-organizations`; users do not need to
open the POS web app.

The implemented campaign API contract is documented in
[`../cross-platform-assets/rewardor/REWARDOR-API.md`](../cross-platform-assets/rewardor/REWARDOR-API.md).
The current authoring endpoints are campaign listing, overview metrics, draft
creation, detail, draft/paused editing, image URL updates, and publish/pause/
archive transitions. The shared Go API also provides buyer location-filtered
campaign discovery and claim creation. Campaign responses include readable
public slugs and the provider organization name. Rewardor claim listing and
summary metrics and initial analytics are now API-backed. POS redemption and
moderation remain future API work.

Routes:

- `/` — overview dashboard
- `/campaigns` — campaign list
- `/campaigns/new` — campaign creation form
- `/campaigns/[id]` — campaign detail and readiness
- `/claims` — claims and redemptions
- `/analytics` — campaign performance
- `/settings` — Rewardor workspace settings

## Run locally

```bash
npm install
npm run dev
```

Set `NEXT_PUBLIC_GO_API_URL` to the Go API origin and provide the same Supabase URL and publishable key used by the other KOMOLA apps. Campaign reads and writes go through the authenticated Go API; the Go API owns the Supabase PostgreSQL connection.

Campaign images upload from the authenticated browser session to the existing
Supabase Storage bucket `product-images` under `rewardor/campaigns/`, then the
resulting public URL is saved in `loyalty.reward_campaigns.image_url`. The
bucket must be public-read with authenticated-user upload access, as documented
for POS product images in `../komola-pos/docs/PRODUCT-IMAGES.md`. Never expose a
Supabase service-role key in this app.

The Go backend must have migrations `000023_reward_campaigns` through
`000029_reward_campaign_slugs` applied before using the complete campaign and
buyer-claim flow. The API migration runner is the source of truth; do not create
application tables from the Rewardor browser.
