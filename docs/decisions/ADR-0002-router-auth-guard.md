# ADR-0002: Declarative Layout Guard Architecture for Route Protection

## Context
Expo Router provides file-based routing with group layouts (`(public)` and `(protected)`). In Expo SDK 57 / Expo Router 5.x, declarative layout guards (`<Redirect href="..." />` placed inside group `_layout.tsx` files) offer a stable, reactive, and declarative authorization pattern.

## Decision
1. **(public)/_layout.tsx**: Subscribes to `sessionStore.status`. If `status === 'authenticated'`, renders `<Redirect href="/(protected)/(tabs)" />`.
2. **(protected)/_layout.tsx**: Subscribes to `sessionStore.status`. If `status === 'anonymous'`, renders `<Redirect href="/(public)/sign-in" />`.
3. **SessionProvider**: Manages startup initialization via `AppBootstrap` and acts as the reactive status context. Manual imperative `useSegments()` string parsing has been removed.

## Consequences
- Routing decisions are entirely declarative and driven by React state rendering.
- Deep links to protected screens automatically trigger redirect to sign-in when anonymous.
- Expected consequence:
The protected layout should unmount after logout, which is intended to prevent returning to protected routes. This behavior must be verified through route integration tests and device E2E tests.

Validation status: Pending
