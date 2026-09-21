# KOMOLA Rewardor

Dedicated Rewardor web experience for creating campaigns, monitoring buyer claims, and reviewing redemptions.

## Current implementation

The UI is a functional frontend slice using demo data while the Rewardor API endpoints are being implemented in the Go backend. The API boundary is defined in `shared/lib/api.ts`; no database access or second authentication system belongs in this app.

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

Set `NEXT_PUBLIC_GO_API_URL` to the Go API origin when the Rewardor endpoints are available.
