# Jest Integration for React Native Testing

**Status**: In Progress  
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

### Known Issues
- Jest configuration needs Babel plugin resolution:
  - Missing react-native-worklets/plugin (installed react-native-worklets-core)
  - jest-runtime clearMocksOnScope compatibility
  - @testing-library/react-native version (currently deprecated 12.0.0)

### Next Steps
1. Upgrade @testing-library/react-native to v12.4.0+
2. Debug remaining Babel/jest-expo configuration issues
3. Verify Jest tests run and pass
4. Update GitHub Actions to run both test suites
5. Update phase-status.md when both runners functional

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
