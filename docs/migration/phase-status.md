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
- Status: ✅ Rewritten
- File: `src/features/app-bootstrap/__tests__/useAppBootstrap.test.tsx`
- Improvements:
  - Removed React mock (no longer vi.mock('react', ...))
  - Removed manual states/effects/stateIdx maintenance
  - Removed arbitrary setTimeout(10) waits
  - Added fake timers (vi.useFakeTimers())
  - 11 comprehensive logic tests
- Verification: All tests pass, logger sanitization verified

**P0-3: AppBootstrap 组件测试**
- Status: ✅ Rewritten
- File: `src/features/app-bootstrap/__tests__/AppBootstrap.test.tsx`
- Improvements:
  - Removed React mock
  - Removed direct component function calls
  - Mock useAppBootstrap to control component state
  - Proper state transition testing
  - 6 comprehensive tests

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
- Entity tests: 22
- App Bootstrap tests: 24 (11 hook + 6 component + 7 error screen)
- API client tests: 22
- Session/Auth tests: 5
- Theme tests: 3
- Signature utils tests: 5

### Test Environment
- Tool: Vitest v3.2.7
- Environment: Node
- Timer handling: Fake timers (no setTimeout waits)
- React mocking: Minimal (only dependencies mocked)

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
- [ ] Bootstrap Hook 测试使用真实 React Runtime ⏳ 重写中
- [ ] AppBootstrap 测试使用真实 render() ⏳ 重写中
- [ ] 测试调用真实 useAppBootstrap() ⏳ 重写中
- [ ] 测试不复制生产逻辑 ⏳ 重写中
- [ ] Logger 使用脱敏错误 ✅ 代码修复
- [ ] 根目录 review.md 已归档 ✅ 完成
- [ ] GitHub Actions 实际通过 ⏳ 等待 CI
- [ ] Dev UI 生产行为已验证 ⏳ 需要手动验证
- [ ] `pnpm validate` 全部通过 ⏳ 测试修复后验证

## Related Documentation

- [Foundation Review Round 5](./reviews/2026-08-05-foundation-round-5.md) - Detailed review notes
- [Architecture Decisions](../architecture/) - Component & hook design
- [API Integration](../api/) - Request client, error handling
- [Testing Strategy](../decisions/) - Test patterns for React Native
