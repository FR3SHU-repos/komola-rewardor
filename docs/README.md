# Rewardor documentation

This directory documents the implemented `komola-rewardor` web application.
It is written as an implementation reference for people and AI agents working
on the repository.

## Start here

- [`system-reference.md`](system-reference.md) — architecture, routes,
  authentication, API boundary, campaign and claim workflows, data handling,
  deployment, testing, and known limits.
- [`../../cross-platform-assets/rewardor/REWARDOR-API.md`](../../cross-platform-assets/rewardor/REWARDOR-API.md) — shared
  Rewardor API contract and database/migration references.
- [`../../go-api-backend/docs/api-current.md`](../../go-api-backend/docs/api-current.md) — backend route index.
- [`../../go-api-backend/openapi/openapi.yaml`](../../go-api-backend/openapi/openapi.yaml) — executable API contract.
- [`../AGENTS.md`](../AGENTS.md) — repository rules for implementation work.
- [`../GIT_RULES.md`](../GIT_RULES.md) — branch, review, verification, and release rules.

## Documentation ownership

Keep implementation details beside the code that owns them:

- Rewardor page behavior, browser auth, typed API usage, and deployment notes:
  this directory.
- Shared campaign API semantics and database migration references:
  `cross-platform-assets/rewardor/REWARDOR-API.md` and the Go API docs.
- Cross-application architecture and data ownership:
  `cross-platform-assets/project/`.

When a campaign, claim, privacy, authentication, or deployment behavior
changes, update the relevant document and the authoritative code/API contract
in the same change.
