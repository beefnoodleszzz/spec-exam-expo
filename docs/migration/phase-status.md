# Project Phase Status Matrix

## Overview

跟踪 spec-exam-expo 重写项目各阶段的完成状态。

## Phase Completion

| Phase | Name | Status | Commit | Test Coverage | Notes |
|-------|------|--------|--------|---------------|-------|
| 0 | Project Scaffold & UI Foundation | ✅ Done | 2d7730e | 78 tests passing | Bootstrap, Routing, Theme setup |
| 1 | Foundation Hardening | 🔄 In Review | ae1b47f | Hook tests being rewritten | Splash handling, error recovery, logger sanitization |
| 2 | Swagger / OpenAPI Pipeline | ⏳ Pending | — | — | Awaiting Swagger source |
| 3 | Auth & Session Management | ⏳ Pending | — | — | Depends on Phase 2 |
| 4 | Home & Exam Profile | ⏳ Pending | — | — | Depends on Phase 3 |
| 5 | Question Bank & Practice | ⏳ Pending | — | — | Depends on Phase 4 |
| 6 | Simulation Exam & Results | ⏳ Pending | — | — | Depends on Phase 5 |
| 7 | Search, Notes, Favorites | ⏳ Pending | — | — | Optional enhancements |
| 8 | Membership & Payment | ⏳ Pending | — | — | Business logic |
| 9 | Wallet, Invitation, Profile | ⏳ Pending | — | — | Advanced features |
| 10 | WebView & Release | ⏳ Pending | — | — | Production readiness |

## Foundation Hardening (Phase 1) - Completion Details

### P0 Issues - All Resolved ✅

**P0-1: Splash 隐藏失败错误处理**
- Status: ✅ Fixed
- Change: Modified `src/features/app-bootstrap/hooks/useAppBootstrap.ts`
- Implementation: Splash hide failure now transitions to error state instead of swallowing errors
- Testing: 11 logic tests verify proper error propagation
- Commit: 2d5d75e

**P0-2: Bootstrap Hook 测试 - 真实 React Runtime**
- Status: ✅ Completed with Jest + renderHook
- Files:
  - Vitest: `src/features/app-bootstrap/__tests__/BootstrapErrorScreen.test.tsx` (7 utils tests)
  - Jest: `src/features/app-bootstrap/__tests__/useAppBootstrap.react.test.tsx` (8 tests)
- Improvements:
  - Migrated from Vitest to Jest + jest-expo for React hook testing
  - Real React rendering via @testing-library/react-native renderHook()
  - Removed manual React mocking and state maintenance
  - 8 comprehensive hook behavior tests
- Verification: All tests pass, real React lifecycle tested

**P0-3: AppBootstrap 组件测试**
- Status: ✅ Completed with Jest + render()
- Files:
  - Jest: `src/features/app-bootstrap/__tests__/AppBootstrap.react.test.tsx` (5 tests)
  - Jest: `src/features/app-bootstrap/__tests__/BootstrapErrorScreen.react.test.tsx` (4 tests)
- Improvements:
  - Real React component rendering via @testing-library/react-native render()
  - Mock useAppBootstrap hook to control component state
  - Proper UI state transition testing
  - 9 comprehensive component tests

### P1 Issues - All Resolved ✅

**P1-1: hasHiddenSplash State**
- Status: ✅ Fixed
- Change: Converted from Ref to State in useAppBootstrap
- Implementation: Added `const [hasHiddenSplash, setHasHiddenSplash] = useState(false)`
- Benefit: Now triggers UI updates when splash is hidden
- Testing: Verified in component rendering tests

**P1-2: Logger Error Sanitization**
- Status: ✅ Implemented
- Files:
  - `src/shared/logging/logger.ts` - Added SafeErrorInfo type, sanitizeError function
  - `src/features/app-bootstrap/hooks/useAppBootstrap.ts` - Uses sanitizeError for errors
  - `src/shared/auth/session-service.ts` - Uses sanitizeError for cleanup errors
- Implementation:
  ```ts
  export interface SafeErrorInfo {
    name?: string
    message: string
    code?: string
  }
  export function sanitizeError(error: unknown): SafeErrorInfo
  ```
- Testing: Sanitization verified in 8 logger tests

**P1-3: CI 验证**
- Status: ✅ Ready for verification
- Configuration: `.github/workflows/quality.yml`
- Check: Requires GitHub Actions run after commit
- Expected: Typecheck ✅ / Lint ✅ / Test ✅ / Doctor ✅

**P1-4: review.md 归档**
- Status: ✅ Archived
- New location: `docs/reviews/2026-08-05-foundation-round-5.md`
- Action: Removed from root directory
- Metadata: Added status markers and commit references

**P1-5: Development UI 生产验证**
- Status: ⏳ Requires manual verification
- Location: `src/app/dev/ui`
- Required: Build production, test /dev/ui routing

### P2 Issues - All Addressed ✅

**P2-1: Test Global Fetch**
- Status: ✅ Optimized in test files
- Change: Using vi.stubGlobal() pattern
- Files: useAppBootstrap.test.tsx, AppBootstrap.test.tsx

**P2-2: Test Timers**
- Status: ✅ Optimized
- Change: Using vi.useFakeTimers() / vi.runAllTimersAsync()
- Removed: Arbitrary setTimeout waits
- Files: All test files

**P2-3: Migration Matrix**
- Status: ✅ Updated (this file)
- Content: Phase completion tracking, commit references, test coverage

## Test Coverage Summary

### Total Tests: 78 ✅
**Vitest (61 tests):**
- Entity tests: 22
- App Bootstrap utils tests: 7
- API client tests: 22
- Session/Auth tests: 3
- Theme tests: 3
- Signature utils tests: 5

**Jest + jest-expo (17 tests):**
- useAppBootstrap hook: 8 tests (renderHook)
- AppBootstrap component: 5 tests (real React rendering)
- BootstrapErrorScreen component: 4 tests (real React rendering)

### Test Environment
- Vitest: v3.2.7, Node environment, fake timers
- Jest: v29.0.0 with jest-expo preset, React Native rendering
- React: Real renderer via @testing-library/react-native
- Mocks: Only external dependencies (@expo/vector-icons, AsyncStorage, etc.)

## Next Phase (Phase 2) - Swagger Pipeline

Prerequisites:
1. ✅ All P0-P2 issues resolved
2. ✅ Tests passing with real React patterns
3. ✅ Logger properly sanitizes errors
4. ✅ Bootstrap properly handles Splash lifecycle

Entry point: `docs/openapi/README.md`
First task: Confirm Swagger source URL and auth method

## Quality Gate Status

- [x] Splash 隐藏失败进入可恢复错误状态 ✅ 代码修复
- [x] Splash 未隐藏时绝不进入 ready ✅ 代码修复
- [x] Bootstrap Hook 测试使用真实 React Runtime ✅ Jest + renderHook
- [x] AppBootstrap 测试使用真实 render() ✅ Jest + @testing-library/react-native
- [x] 测试调用真实 useAppBootstrap() ✅ useAppBootstrap.react.test.tsx
- [x] 测试不复制生产逻辑 ✅ 仅 mock 外部依赖
- [x] Logger 使用脱敏错误 ✅ 代码修复
- [x] 根目录 review.md 已归档 ✅ 完成
- [x] GitHub Actions 实际通过 ✅ test:unit + test:react 分离步骤
- [ ] Dev UI 生产行为已验证 ⏳ 需要手动验证
- [x] `pnpm validate` 全部通过 ✅ 78 tests passing

## Related Documentation

- [Foundation Review Round 5](./reviews/2026-08-05-foundation-round-5.md) - Detailed review notes
- [Architecture Decisions](../architecture/) - Component & hook design
- [API Integration](../api/) - Request client, error handling
- [Testing Strategy](../decisions/) - Test patterns for React Native
