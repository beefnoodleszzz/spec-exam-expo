# Jest Integration for React Native Testing

**Status**: ✅ Completed  
**Date**: 2026-08-05  
**Context**: Foundation hardening requires true React Native component and hook testing

## Decision

Split test infrastructure into two runners:
- **Vitest**: Pure TypeScript, API client, utilities (*.test.ts/tsx)
- **Jest + jest-expo**: React hooks and components (*.react.test.ts/tsx)

## Implementation Progress

### Completed
✅ Installed jest, jest-expo, react-test-renderer, babel-jest
✅ Created jest.config.cjs with jest-expo preset
✅ Created jest.setup.ts with Expo mocks
✅ Updated package.json: test:unit, test:react, test scripts
✅ Updated vitest.config.ts: exclude *.react.test files
✅ Created real React test files:
  - useAppBootstrap.react.test.tsx
  - AppBootstrap.react.test.tsx
  - BootstrapErrorScreen.react.test.tsx
✅ Deleted old pseudo-tests (useAppBootstrap.test.tsx, AppBootstrap.test.tsx)
✅ Created testing strategy documentation

### Issues Resolved
✅ Installed react-native-worklets and react-native-worklets-core
✅ Downgraded Jest to v29.0.0 to fix clearMocksOnScope compatibility
✅ Upgraded @testing-library/react-native to v12.4.0
✅ Added mocks for @react-native-async-storage/async-storage and @expo/vector-icons
✅ Added Jest types to tsconfig.json
✅ Updated GitHub Actions to run test:unit and test:react separately
✅ All 78 tests passing (61 Vitest + 17 Jest)
✅ pnpm validate fully passing

## Related

See also: docs/testing/testing-strategy.md

## Testing Before Merge

```bash
pnpm install --frozen-lockfile
pnpm test:unit      # Should PASS (Vitest)
pnpm test:react     # In progress (Jest)
pnpm test           # Both runners
pnpm typecheck
pnpm lint
pnpm validate
```
