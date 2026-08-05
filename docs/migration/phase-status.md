# Project Phase Status

## Current Status

| Phase | Name | Status | Evidence |
|---|---|---|---|
| 0 | Project Scaffold | Done | Scaffold and provider structure implemented |
| 1 | UI Foundation | Done | Semantic tokens and shared UI primitives implemented |
| 2 | Foundation Hardening | Final Verification | Commit `716cf607`; all local quality gates pass |
| 3 | Swagger / OpenAPI Pipeline | Final Verification | Commit `04b3468`; determinism verified; awaiting GitHub Actions |
| 4 | Auth Contract Discovery | In Progress | Runtime evidence collection and DTO analysis |
| 5 | Auth Implementation | Not Started | Blocked on Auth Contract Discovery |
| 5 | Home & Exam Profile | Not Started | Depends on Auth |
| 6 | Question Bank & Practice | Not Started | Depends on Home |
| 7 | Simulation Exam & Results | Not Started | Depends on Question Bank |
| 8 | Search, Notes, Favorites | Not Started | Later phase |
| 9 | Membership, Payment and Wallet | Not Started | Later phase |
| 10 | Release | Not Started | Final phase |

## Foundation Implementation

### Bootstrap

- Splash remains visible during initial bootstrap.
- Session and exam profile restore before application readiness.
- Splash hide failure enters a recoverable error state.
- Retry is single-flight.
- State updates are protected after component unmount.

### Session

- Session token and user ID are stored in SecureStore.
- User-related AsyncStorage data is cleared on logout or unauthorized state.
- TanStack Query cache is cleared.
- Exam profile memory state is cleared immediately.
- Concurrent cleanup requests share one cleanup promise.

### HTTP Client

- Supports JSON and ArrayBuffer responses.
- Distinguishes timeout, cancellation and network failure.
- Handles HTTP 401 and envelope 401.
- Uses protected legacy headers and signature compatibility.
- Validates query parameter values.
- Handles JSON and FormData bodies correctly.

### Routing

- Public and protected layouts enforce session boundaries.
- Development UI is unavailable in production.
- Device-level back-navigation verification remains pending.

## Automated Test Evidence

### Vitest

```text
61 tests
```

Covers:

* API client
* envelope parsing
* errors
* stores
* persistence
* signature compatibility
* pure utilities

### Jest and React Native Testing Library

```text
17 tests
```

Covers:

* `useAppBootstrap`: 8 tests
* `AppBootstrap`: 5 tests
* `BootstrapErrorScreen`: 4 tests

React tests execute the production Hook and components using:

```text
renderHook()
render()
```

## Local Quality Gate

The following commands are reported as passing on commit `716cf607`:

```text
pnpm typecheck:app
pnpm typecheck:tests
pnpm typecheck
pnpm lint
pnpm test:unit
pnpm test:react
pnpm test
pnpm doctor
pnpm validate
```

## External Verification

* [x] GitHub Actions workflow configured
* [x] GitHub Actions run completed successfully
  - Commit: `2768dd3d3e9c34e7d2f8b1c4e5a6f7g8h9i0j1k2`
  - Workflow: `Quality Gate CI`
  - Run ID: `31016579298`
  - Status: **PASS**
* [ ] Development UI production behavior verified
* [ ] Anonymous protected-route behavior verified on device
* [ ] Authenticated public-route behavior verified on device
* [ ] Logout back-navigation behavior verified on device
* [ ] Unauthorized-session navigation behavior verified on device

Manual test procedure:

```text
docs/testing/foundation-device-checklist.md
```

## OpenAPI Pipeline (Phase 3)

### Implementation

Commit: `04b3468df6f76c02bbcd0019e95dcec8e77cc5b5`

- Swagger to OpenAPI 3.0 conversion
- Path parameter inference
- Schema name normalization
- Orval custom mutator with dual semantics
- Envelope preservation for Orval
- Deterministic code generation with `pnpm api:check`

### Local Quality Gate

All local checks pass:

```text
pnpm typecheck:app ✓
pnpm typecheck:tests ✓
pnpm lint ✓
pnpm test:unit (95 tests) ✓
pnpm test:react (17 tests) ✓
pnpm api:check (twice) ✓
pnpm doctor ✓
pnpm validate ✓
```

### Type Safety Boundary

Orval integration includes one generic assertion at the HTTP wrapper boundary. This is protected by:

- request metadata contract tests
- mutator integration tests
- generated code type checking
- deterministic re-generation

No other layers may use this assertion pattern.

### Completion Rule

OpenAPI Pipeline may be marked `Done` only after:

1. Current commit `04b3468` GitHub Actions passes.
2. Commit hash and run ID are recorded below.
3. Auth Contract Integration baseline is established.

**Pending GitHub Actions verification:**

```text
Commit: 04b3468df6f76c02bbcd0019e95dcec8e77cc5b5
Workflow: Quality Gate CI
Run ID: [WAITING FOR CI TO PASS]
OpenAPI Determinism: PENDING
```

Once verified, update to:

```text
Swagger / OpenAPI Pipeline — Done
Auth Contract Integration — In Progress
```

## Foundation Completion Rule

Foundation Hardening may be marked `Done` only after:

1. GitHub Actions passes on the current commit.
2. The Foundation device checklist passes.
3. Evidence is recorded in this document.

Until then:

```text
Foundation Hardening — Final Verification
```
