# Project Phase Status

## Current Status

| Phase | Name | Status | Evidence |
|---|---|---|---|
| 0 | Project Scaffold | Done | Scaffold and provider structure implemented |
| 1 | UI Foundation | Done | Semantic tokens and shared UI primitives implemented |
| 2 | Foundation Hardening | Final Verification | Commit `716cf607`; all local quality gates pass |
| 3 | Swagger / OpenAPI Pipeline | Not Started | Waiting for Foundation verification |
| 4 | Auth & Session Management | Not Started | Depends on OpenAPI Pipeline |
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
* [ ] GitHub Actions run completed successfully
* [ ] Development UI production behavior verified
* [ ] Anonymous protected-route behavior verified on device
* [ ] Authenticated public-route behavior verified on device
* [ ] Logout back-navigation behavior verified on device
* [ ] Unauthorized-session navigation behavior verified on device

Manual test procedure:

```text
docs/testing/foundation-device-checklist.md
```

## Foundation Completion Rule

Foundation Hardening may be marked `Done` only after:

1. GitHub Actions passes on the current commit.
2. The Foundation device checklist passes.
3. Evidence is recorded in this document.

Until then:

```text
Foundation Hardening — Final Verification
Swagger / OpenAPI Pipeline — Not Started
```
