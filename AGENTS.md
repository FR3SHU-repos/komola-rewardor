# KOMOLA Rewardor agent rules

Before starting work, read:

1. [`../cross-platform-assets/AGENT_WORKFLOW.md`](../cross-platform-assets/AGENT_WORKFLOW.md).
2. [`README.md`](README.md), [`docs/README.md`](docs/README.md), and
   [`docs/system-reference.md`](docs/system-reference.md).
3. [`GIT_RULES.md`](GIT_RULES.md) before creating commits, tags, or pushes.
4. The shared API contract in
   [`../go-api-backend/docs/api-current.md`](../go-api-backend/docs/api-current.md),
   [`../go-api-backend/openapi/openapi.yaml`](../go-api-backend/openapi/openapi.yaml),
   and [`../cross-platform-assets/rewardor/REWARDOR-API.md`](../cross-platform-assets/rewardor/REWARDOR-API.md).
5. [`../cross-platform-assets/DPDP_DATA_GOVERNANCE.md`](../cross-platform-assets/DPDP_DATA_GOVERNANCE.md)
   before changing identity, authentication, campaigns, claims, rewards,
   analytics, retention, exports, integrations, or account deletion.

This app is a dedicated Rewardor experience sharing KOMOLA's existing Go API
and Supabase identity. Follow these rules for every change.

1. Keep reusable non-route code in `shared/`; do not put shared services in `app/`.
2. Use the domain boundary `shared/lib/api`, `shared/components`, and future `shared/features/rewards` for Rewardor behavior.
3. Never add MongoDB, Mongoose, a second database, or direct database access to this app.
4. Route all application data through the typed Go API contract under `/api/v1`.
5. The frontend must not calculate eligibility, quotas, reward values, or redemption authority. The backend is authoritative.
6. Use the existing Supabase Auth and organization/member authorization model.
7. Keep campaign authoring and analytics out of the cashier POS workflow.
8. Treat demo data as temporary UI scaffolding. Campaign and overview screens use the typed Go API clients; do not reintroduce demo fallback data for API failures.
9. Use semantic design tokens from `app/globals.css`; do not add raw palette colors in pages.
10. Run `npm run typecheck` and `npm run build` before handoff.
11. Reward values are Komola points only. Do not add cash, rupee, percentage-discount, cashback, or delivery-credit reward types.
12. Campaign type may be `product`, `offer`, or `online_cashback`; this describes the context of the campaign, not a different payout currency.

## Change and verification rules

- Inspect `git status` and existing diffs before editing; preserve unrelated
  work.
- Do not add direct database access, MongoDB, Mongoose, a second data store, or
  a second authentication system. Route application data through typed clients
  and keep the Go API authoritative.
- Do not change the database, run migrations, delete/anonymize records, or
  alter Supabase/production settings without explicit user confirmation.
- Do not expose secrets, auth tokens, raw buyer contact data, claim details, or
  production records in source, logs, tests, fixtures, screenshots, or commits.
- Update Rewardor system docs, the shared API contract, and OpenAPI whenever a
  campaign, claim, fulfilment, delivery confirmation, analytics, auth, or
  deployment behavior changes.
- Before handoff, run:

  ```bash
  npm run typecheck
  npm run lint
  npm run build
  git diff --check
  ```

Report any checks not run and any external-state operation separately.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
