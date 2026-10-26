# KOMOLA Rewardor system reference

**Repository:** `komola-rewardor`  
**Runtime:** Next.js App Router, React, TypeScript, Supabase Auth, Go API  
**Deployment target:** Netlify  
**Last reviewed:** 15 October 2026

This is the implementation-derived reference for the Rewardor web app. The
app is a browser client for Rewardor campaign operations. It is not a second
backend, database, identity provider, or POS application.

## 1. Product boundary

Rewardor is the organization-facing workspace for:

- creating and editing reward campaigns;
- publishing, pausing, and archiving campaigns;
- reviewing buyer claims and approving or rejecting manual claims;
- recording that an approved reward was delivered;
- viewing claim and point analytics;
- reading the privacy notice and managing privacy choices and requests.

The shared Go API is authoritative for authentication authorization, active
organization membership, location eligibility, campaign validation, claim
limits, point reservation/settlement, and claim state transitions. The browser
must not calculate eligibility, quotas, points, or redemption authority.

Buyer discovery, claiming, claim history, and buyer receipt confirmation are
implemented in the shared API and the buyer/POS experience. POS sale redemption
is a separate workflow and is not implemented by this Rewardor app.

## 2. Architecture and request path

```text
Browser
  │
  ├─ Supabase Auth: sign-in, Google OAuth, registration, recovery
  ├─ Supabase Storage: campaign artwork upload only
  │
  └─ shared/lib/api.ts
       │  Bearer access token + credentials: include
       │  X-Organization-ID when an organization is selected
       ▼
Next.js same-origin /api/v1 rewrite or configured Go API origin
       ▼
go-api-backend /api/v1
       ├─ JWT and organization/member authorization
       ├─ campaigns and reward claims module
       ├─ privacy and identity endpoints
       └─ PostgreSQL through the Go repository layer
```

The app does not import a database client and must not connect to PostgreSQL
directly. The only browser-side data clients are the typed Go API wrapper and
the Supabase Auth/Storage browser client.

### API origin resolution

`shared/lib/api.ts` and `next.config.ts` use `NEXT_PUBLIC_GO_API_URL` when it
is a valid HTTP(S) origin. In production, the fallback origin is:

```text
https://fr3shu-go-backend-api.onrender.com
```

When a valid origin is configured, Next rewrites `/api/v1/:path*` to the Go
API. The API client also supports calling the configured origin directly. Local
development normally uses `http://localhost:8080`.

Do not add secrets to `NEXT_PUBLIC_*` variables. The Supabase URL and
publishable key are intentionally public browser configuration; service-role
keys and database credentials belong only to the Go API/deployment runtime.

## 3. Source map

| Area | Source of truth |
|---|---|
| Route/page UI | `app/**/page.tsx` |
| Auth callback and password recovery | `app/auth/**`, `app/login/page.tsx`, `shared/lib/supabase/auth-client.ts` |
| Session protection | `middleware.ts`, `shared/lib/supabase/middleware.ts` |
| API types and calls | `shared/lib/api.ts` |
| Campaign form and input mapping | `shared/components/CampaignForm.tsx` |
| Workspace shell/navigation | `shared/components/RewardorShell.tsx` |
| Campaign artwork upload | `shared/lib/supabase/reward-campaign-images.ts` |
| Status presentation | `shared/components/StatusBadge.tsx` |
| Theme/design tokens | `app/globals.css` |
| Backend route and persistence contract | `go-api-backend/internal/modules/campaigns`, `go-api-backend/docs`, `go-api-backend/openapi` |

`shared/data/demo.ts` is legacy/demo scaffolding. API-backed pages must not
silently use it as a fallback when the Go API fails.

## 4. Route map

### Public/authentication routes

| Route | Behavior |
|---|---|
| `/login` | Supabase password sign-in by email or Indian mobile number, plus optional Google OAuth; preserves a safe `next` path. |
| `/register` | Creates a Supabase account, then reconciles identity and creates a Rewardor organization/location through the Go API. |
| `/auth/callback` | Exchanges the Supabase authorization code for a session and redirects to a safe local path. |
| `/auth/check-email` | Explains email verification and returns the user to sign-in/registration. |
| `/auth/forgot-password` | Sends a Supabase recovery email with a Rewardor-local reset URL. |
| `/auth/reset-password` | Validates the recovery session, updates the password, signs out, and returns to Rewardor sign-in. |
| `/privacy` | Public privacy notice. |

### Protected workspace routes

| Route | Behavior and data source |
|---|---|
| `/` | Overview counts from `GET /api/v1/reward-campaigns/overview` plus the campaign list. |
| `/campaigns` | Organization campaign list from `GET /api/v1/reward-campaigns`. |
| `/campaigns/new` | New campaign form; creates a draft through `POST /api/v1/reward-campaigns`. |
| `/campaigns/[id]` | Campaign detail, artwork, readiness, and lifecycle controls. |
| `/campaigns/[id]/edit` | Full replacement edit for draft/paused campaigns. |
| `/claims` | Paginated claim review, manual approval/rejection, delivery confirmation, and CSV export. |
| `/analytics` | Last-30-day organization analytics from `GET /api/v1/reward-campaigns/analytics?days=30`. |
| `/settings` | Read-only shared organization/user access view plus privacy links. |
| `/support` | Guided issue form that opens a prepared email to `varma.v.business@gmail.com`. |
| `/privacy/requests` | Optional consent controls, privacy export, and privacy request submission/status. |

The middleware protects workspace paths when Supabase is configured. It allows
`/login`, `/register`, `/auth/*`, and `/api/*` through without redirecting so
those flows can establish or use a session. Transient Supabase network errors
are not treated as a forced sign-out; the request continues and the API can
report the actionable error.

## 5. Authentication and organization context

### Sign-in/session

- Supabase Auth is the shared identity provider for POS, buyer, and Rewardor.
- Password sign-in accepts the shared account email or Indian mobile number; optional Google sign-in also creates a Supabase session.
- The browser obtains the current access token with `getSession()` and retries
  one `401` response after `refreshSession()`.
- Requests include `Authorization: Bearer <access-token>` and
  `credentials: include`.
- The client resolves the active organization through `GET /api/v1/pos/bootstrap`.
- The selected organization UUID is kept in browser local storage under
  `komola:rewardor-organization-id` and sent as `X-Organization-ID`.
- The API remains authoritative: a stale or unauthorized organization selection
  is cleared and membership/role checks happen server-side.

### Registration

Registration is intentionally self-contained in Rewardor:

1. Validate the account, organization, Indian phone, and address fields.
2. Store a session-storage draft without passwords while email verification is
   pending.
3. Call Supabase `signUp` with Rewardor account metadata.
4. After a session exists, call `POST /api/v1/auth/reconcile`.
5. Call `POST /api/v1/seller-organizations` with an idempotency key.
6. Create the Rewardor organization and its first fixed location:
   `visakhapatnam`, `Visakhapatnam`, `Asia/Kolkata`.
7. Store the returned organization ID and redirect to `/`.

Registration does not create application tables or a second user profile.
Organization changes after registration are read-only in this app and are
managed through the shared KOMOLA/POS organization records.

### Password recovery

The recovery redirect is generated from the current Rewardor origin:
`/auth/reset-password`. After the new password is accepted, the app signs out
the recovery session and redirects to `/login`. Recovery still uses email; a
phone-only account cannot use SMS recovery because phone OTP is not enabled.
Do not point Rewardor recovery to the POS app.

## 6. Campaign authoring

The form maps to the complete `RewardCampaignInput` object. `PATCH` is a full
replacement of editable fields, not a partial field patch.

### Fields

- title and description;
- campaign type: `product`, `offer`, or `online_cashback`;
- reward type: `fixed_points`, `bonus_points`, or `points_multiplier`;
- positive Komola point value;
- total claims allowed and per-buyer limit;
- Visakhapatnam location code (`visakhapatnam` in the current form);
- optional start/end dates and an optional buyer-facing timer;
- approval mode: `manual` or `automatic`;
- one fulfillment method: `home_delivery`, `store_pickup`, or
  `online_redemption`;
- pickup-store details when `store_pickup` is selected;
- optional JPG/PNG/WebP campaign artwork.

Reward values are Komola points only. Campaign type describes the context of
the offer; it is not a cash, rupee, ticket, or discount payout type.

### Campaign lifecycle

```text
draft ──publish──> published ──pause──> paused ──publish──> published
  │                    │                 │
  └────archive─────────┴─────────────────┴────archive──> archived

expired ──archive──> archived
```

The backend validates transitions. The UI enables editing only for `draft` and
`paused`, pausing only for `published`, and archiving for `draft`, `paused`, or
`expired`. Archived campaigns cannot be edited, republished, or have their
image changed. A campaign pause/archive does not erase existing buyer claims;
buyer history remains visible through the buyer claim endpoints.

### Artwork

`shared/lib/supabase/reward-campaign-images.ts` validates JPG, PNG, and WebP
files at a maximum of 5 MB, then uploads directly from the authenticated
browser to the public-read `product-images` bucket under:

```text
rewardor/campaigns/<random-uuid>.<jpg|png|webp>
```

The resulting public URL is saved through
`PATCH /api/v1/reward-campaigns/{id}/image`. This app must never contain a
Supabase service-role key.

## 7. Claims and fulfillment handoff

Rewardor reads organization-scoped claims from the Go API. The claims page
supports search, status filtering, pagination at ten records per page, and a
client-side CSV export of the currently loaded page.

### Claim states

```text
manual:    claimed → approved → delivered → confirmed
manual:    claimed → cancelled
automatic: claimed/approved settlement is completed by the claim transaction
```

- `claimed`: buyer claim is pending Rewardor approval; points remain locked.
- `approved`: points have been settled to the Rewardor account; the Rewardor
  may fulfill the selected delivery method.
- `delivered`: Rewardor recorded that the reward was delivered; the buyer must
  confirm receipt in the buyer experience.
- `confirmed`: buyer confirmed receipt.
- `cancelled`: Rewardor rejected a pending claim and the reservation was
  released.
- `redeemed`: reserved for the separate redemption flow; POS redemption is not
  implemented in this app.

Before processing a manual claim, the UI asks the Rewardor to match the claim
code with the buyer phone. The API returns fulfillment snapshots, so delivery
can use the buyer address or configured pickup details from the claim even if
the campaign later changes or is archived.

The Rewardor actions are:

| UI action | API call | Allowed state |
|---|---|---|
| Approve | `POST /reward-campaigns/claims/{id}/approve` | `claimed` |
| Reject | `POST /reward-campaigns/claims/{id}/reject` with an optional reason | `claimed` |
| Mark reward delivered | `POST /reward-campaigns/claims/{id}/deliver` | `approved` |

Buyer receipt confirmation is performed by
`POST /api/v1/buyer/reward-claims/{claimId}/confirm`, not by this dashboard.

## 8. Analytics and privacy

Analytics is API-backed, not demo data. The current screen requests the last
30 days and displays claims, redemptions, conversion rate, Komola points issued,
period-over-period deltas, and a daily claims bar chart.

Privacy controls use the shared API:

- `GET/POST /api/v1/me/privacy/consents` for optional market-intelligence and
  marketing choices;
- `GET/POST /api/v1/me/privacy/requests` for request history and submission;
- `GET /api/v1/me/privacy/export` for a downloadable JSON export.

The core account, organization, campaign, and claim processing consent is not
the same as optional market-intelligence or marketing choices. Keep buyer data
limited to the claim verification and fulfillment purpose described in the
privacy notice.

## 9. Environment and deployment

Required browser configuration is documented in `.env.example`:

```text
NEXT_PUBLIC_GO_API_URL
NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_KOMOLA_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_KOMOLA_SUPABASE_PUBLISHABLE_KEY
```

Optional feature flags:

```text
NEXT_PUBLIC_AUTH_GOOGLE_ENABLED=true
NEXT_PUBLIC_KOMOLA_AUTH_GOOGLE_ENABLED=true
```

Netlify configuration is intentionally minimal. `netlify.toml` only excludes
public browser configuration from the Netlify secrets scanner. Build/runtime
configuration is supplied by the Netlify site environment. Keep production
and staging API/Supabase project values separated.

Before a deployment, verify:

1. Supabase Auth redirect URLs include the deployed Rewardor origin and
   `/auth/callback`.
2. The recovery redirect is allowed for `/auth/reset-password`.
3. Google OAuth is disabled unless the provider and redirect configuration are
   ready.
4. `NEXT_PUBLIC_GO_API_URL` points to the intended Go API environment.
5. The API migrations required by the campaign/claim domain are applied,
   including delivery confirmation migration `000043`.
6. The `product-images` bucket and its authenticated upload/public-read
   policies exist.
7. The API health, Supabase session, registration, campaign authoring, claim
   delivery, and privacy request paths are smoke-tested.

## 10. Verification and maintenance

Run from `komola-rewardor`:

```bash
npm run typecheck
npm run build
git diff --check
```

Use `npm run lint` when the repository ESLint configuration and installed
plugins are compatible. If lint fails because of repository configuration (for
example a missing plugin rule), record that exact limitation rather than
silently treating lint as passed.

### 10.1 UI design alignment

Rewardor follows the Admin application's workspace principles:

- a neutral gray application canvas with white, rounded content surfaces;
- a compact orange brand accent and dark active navigation state;
- a persistent desktop workspace rail with a responsive mobile drawer;
- explicit loading, empty, and error states for data-driven screens; and
- keyboard-accessible navigation, including a skip link, Escape-to-close, focus
  trapping, and focus restoration for the mobile drawer.

The shared visual tokens and shell styles live in `app/globals.css` and
`shared/components/RewardorShell.tsx`. Reuse those primitives when adding new
workspace pages so the campaign, claims, analytics, and settings areas keep the
same hierarchy and interaction model.

For code changes, read `AGENTS.md` and `GIT_RULES.md` first. For API changes,
update the Go API handlers/repository/OpenAPI contract and the shared
Rewardor API document before updating UI call sites.

## 11. Current limits and deliberate non-goals

- No direct database access from Rewardor.
- No second organization or user table.
- No POS authoring or campaign analytics in the cashier workflow.
- No client-side eligibility or point calculation.
- No POS claim validation or atomic sale redemption yet.
- No external cash/ticket payout ledger; all current benefits are Komola points.
- No Rewardor moderation/submission workflow beyond backend organization/status
  authorization.
- Current registration provisions the fixed Visakhapatnam location; a broader
  locality-management UI requires a backend location catalog/selection
  contract first.
