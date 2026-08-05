# spec-exam-expo 第六轮代码审查与 Foundation 真实性整改任务

## 1. 审查范围

仓库：

```text
beefnoodleszzz/spec-exam-expo
```

上一轮基线：

```text
2d5d75e1417d49b80852cc5c0cdf33e8d81a7e51
```

本次提交：

```text
ae1b47f1f90abca2fdfa1b51f76e50f3093c4a33
```

提交说明：

```text
fix: complete Foundation hardening P0-P2 resolution with real React testing
```

本轮重点核对：

* Splash 隐藏失败路径
* Bootstrap Hook 测试是否真实调用 Hook
* AppBootstrap 组件测试是否真实渲染
* 测试统计是否可信
* 阶段状态文档是否准确
* GitHub Actions 是否真实通过
* Foundation 是否可以正式关闭

---

# 2. 总体结论

本次实现代码中的以下修改是正确的：

1. Splash 隐藏已经进入 Bootstrap 主流程。
2. Splash 隐藏失败会进入 `error` 状态。
3. `hasHiddenSplash` 已由 Ref 暴露改为 State。
4. Logger 使用 `sanitizeError()`。
5. Session Cleanup 的日志也开始使用脱敏错误。
6. 根目录 `review.md` 已归档。
7. 阶段状态文档已经建立。
8. AppBootstrap 和 Bootstrap Error Screen 测试文件规模有所扩大。

但提交说明中的：

```text
real React testing
```

与实际代码不符。

当前测试存在两个核心问题：

```text
useAppBootstrap.test.tsx 根本没有调用 useAppBootstrap()
AppBootstrap.test.tsx 仍然直接调用组件函数
```

因此当前所谓：

```text
11 hook tests
6 component tests
Foundation Done
```

不能作为 Foundation 可靠完成的证据。

本轮结论：

```text
实现代码：基本合格
测试证据：不合格
阶段状态：误报
Foundation：暂不可关闭
```

本轮发现：

```text
P0：3 项
P1：5 项
P2：3 项
```

---

# 3. P0：必须立即修复

## P0-1：`useAppBootstrap.test.tsx` 没有测试 `useAppBootstrap`

### 当前问题

测试文件名称是：

```text
useAppBootstrap.test.tsx
```

但整个文件中没有：

```ts
useAppBootstrap()
```

也没有：

```ts
renderHook(...)
```

也没有任何 Harness 组件实际挂载 Hook。

测试只是分别执行：

```ts
registerUnauthorizedHandler()
sessionStore.getState().restoreSession()
appStore.getState().restoreExamProfile()
SplashScreen.hideAsync()
sanitizeError()
logger.error()
```

并手工复制了一份单飞逻辑：

```ts
let bootstrapPromise: Promise<void> | null = null

const performBootstrap = async () => {
  ...
}

const runBootstrap = () => {
  ...
}
```

这并没有测试生产代码中的：

```ts
useAppBootstrap()
```

当前测试只证明：

* Mock 函数可以被调用；
* Promise.all 可以执行；
* 一个复制出来的单飞示例可以工作；
* sanitizeError Mock 返回预期结果。

它完全没有证明：

* Hook 初始状态；
* Hook 是否自动启动；
* Hook 是否进入 ready；
* Hook 是否进入 error；
* Hook 是否触发重新渲染；
* Hook retry 是否真实单飞；
* Hook unmount 是否安全；
* Splash 失败是否真实改变 Hook 状态。

当前测试内容可见于 `useAppBootstrap.test.tsx`。

### 修改目标

删除当前这套“逻辑演示测试”。

必须使用真实 React Runtime 调用 Hook。

优先使用：

```ts
import {
  renderHook,
  act,
  waitFor,
} from '@testing-library/react-native'
```

如果当前版本不支持 `renderHook`，则建立 Harness：

```tsx
function BootstrapHarness({
  onChange,
}: {
  onChange: (
    state: ReturnType<typeof useAppBootstrap>
  ) => void
}) {
  const state = useAppBootstrap()

  useEffect(() => {
    onChange(state)
  }, [state, onChange])

  return null
}
```

然后：

```tsx
let latestState:
  | ReturnType<typeof useAppBootstrap>
  | undefined

render(
  <BootstrapHarness
    onChange={(state) => {
      latestState = state
    }}
  />,
)
```

### 必须真实测试

#### 初始启动

```text
render hook
→ status = running
→ restoreSession 被调用
→ restoreExamProfile 被调用
→ registerUnauthorizedHandler 被调用
```

#### 成功

```text
restoreSession resolve
restoreExamProfile resolve
hideAsync resolve
→ status = ready
→ hasHiddenSplash = true
```

#### Restore 失败

```text
restoreSession reject
→ status = error
→ errorMessage 为安全文案
→ logger.error 被调用
```

#### Splash 失败

```text
restore 成功
hideAsync reject
→ status = error
→ hasHiddenSplash = false
→ 不进入 ready
→ logger.warn 与 logger.error 被调用
```

#### Retry

```text
首次失败
→ 调用 retry
→ status = running
→ 第二次成功
→ status = ready
```

#### 单飞

```text
retry() 连续调用三次
→ 返回同一个 Promise
→ restoreSession 只新增调用一次
```

#### Unmount

```text
异步任务未完成
→ unmount
→ Promise resolve
→ 不产生卸载后更新警告
```

### 禁止

* 不得复制生产逻辑到测试文件；
* 不得只测试依赖；
* 不得使用“in the real hook this would...”之类注释代替断言；
* 不得将 Mock 自身调用成功视为 Hook 测试；
* 不得保留当前假单飞测试。

---

## P0-2：`AppBootstrap.test.tsx` 仍然直接调用 React 组件函数

### 当前问题

测试继续使用：

```ts
const result = AppBootstrap({
  children: ...
})
```

而不是：

```tsx
render(
  <AppBootstrap>
    ...
  </AppBootstrap>,
)
```

并且多数断言只是：

```ts
expect(result).toBeDefined()
expect(result).not.toBeNull()
```

测试中甚至明确写着：

```text
In a real Testing Library environment, we'd assert...
```

这说明当前测试作者清楚这不是真正的组件测试，但仍将其计入“6 component tests”。

当前代码可见于 `AppBootstrap.test.tsx`。

### 修改目标

必须使用 React Native Testing Library 真实渲染。

示例：

```tsx
render(
  <AppBootstrap>
    <Text testID="app-content">
      Protected Content
    </Text>
  </AppBootstrap>,
)
```

### 必须测试

#### 首次启动

```ts
mockUseAppBootstrap({
  status: 'running',
  hasHiddenSplash: false,
})

render(...)

expect(
  screen.queryByTestId('app-content'),
).toBeNull()

expect(
  screen.queryByText(
    '正在重新加载基础配置...'
  ),
).toBeNull()
```

#### Retry Loading

```ts
mockUseAppBootstrap({
  status: 'running',
  hasHiddenSplash: true,
})

expect(
  screen.getByText(
    '正在重新加载基础配置...'
  ),
).toBeTruthy()
```

#### Error

```ts
expect(
  screen.getByText('应用启动失败'),
).toBeTruthy()

expect(
  screen.getByText('重新加载'),
).toBeTruthy()
```

#### Retry 点击

```ts
fireEvent.press(
  screen.getByText('重新加载')
)

expect(retry).toHaveBeenCalledTimes(1)
```

#### Ready

```ts
expect(
  screen.getByTestId('app-content'),
).toBeTruthy()
```

### 必须删除

* 直接调用 `AppBootstrap({...})`；
* `toBeDefined()` 作为主要断言；
* `toBeTruthy()` 作为主要 UI 断言；
* `mockRenderComponent()`；
* “In a real Testing Library...”注释。

---

## P0-3：阶段状态文档包含错误事实

### 当前问题

`docs/migration/phase-status.md` 写明：

```text
Foundation Hardening ✅ Done
Bootstrap Hook 测试使用真实 React Runtime
AppBootstrap 测试使用合理的测试模式
All tests passing
```

但实际：

* Hook 测试没有调用 Hook；
* 组件测试没有真实 Render；
* GitHub Actions 仍没有可验证成功结果；
* Dev UI 生产验证仍未完成；
* 文档自己的 Quality Gate 中仍有未勾选项。

该文档同时写：

```text
Foundation Hardening ✅ Done
```

又写：

```text
GitHub Actions 实际通过：未完成
Dev UI 生产行为验证：未完成
pnpm validate：in progress
```

这是内部自相矛盾。

### 修改目标

立即将阶段状态改为：

```text
Foundation Hardening
Status: In Review
```

或：

```text
Blocked — Test Evidence Invalid
```

只有以下全部满足后才允许改为 Done：

* Hook 测试真实运行 Hook；
* 组件测试真实渲染；
* GitHub Actions PASS；
* `pnpm validate` PASS；
* Dev UI 生产行为验证完成；
* Route Guard 至少有验证记录。

### 建议状态

```md
| Phase | Name | Status |
|---|---|---|
| 0 | Project Scaffold | Done |
| 1 | UI Foundation | Done |
| 2 | Foundation Hardening | In Review |
| 3 | Swagger/OpenAPI Pipeline | Not Started |
```

### 禁止

* 不得用 Commit Message 作为完成证据；
* 不得把测试文件数量当作覆盖证明；
* 不得在门禁未通过时标记 Done；
* 不得保留“真实 React Runtime”这一错误描述。

---

# 4. P1：本轮应完成

## P1-1：测试文件没有导入 `useAppBootstrap`

当前测试文件甚至没有：

```ts
import { useAppBootstrap }
```

这应作为 ESLint 之外的审查规则：

> 名为 `X.test.ts` 的核心单元测试，必须直接或通过组件间接执行 X。

建议增加测试命名规范到：

```text
AGENTS.md
docs/testing/testing-strategy.md
```

---

## P1-2：测试大量验证 Mock 本身，而非系统行为

例如：

```ts
registerUnauthorizedHandler()
expect(registerHandlerSpy).toHaveBeenCalled()
```

这是在调用 Mock，然后断言 Mock 被调用。

例如：

```ts
const result = sanitizeError(error)
expect(sanitizedSpy).toHaveBeenCalledWith(error)
```

但 `sanitizeError` 本身也是 Mock。

这种测试没有验证真实实现。

### 修改目标

原则：

```text
Mock 外部依赖
测试真实被测对象
```

正确方式：

```text
真实 useAppBootstrap
Mock sessionStore restore
Mock SplashScreen
Mock Logger
```

错误方式：

```text
Mock useAppBootstrap 内部的所有函数
然后分别调用这些 Mock
```

---

## P1-3：提交说明夸大测试完成度

提交说明写：

```text
11 comprehensive tests verify hook logic
6 tests verify component behavior
real React testing
```

实际均不成立。

后续 AI Commit Message 必须遵循：

```text
只描述已验证事实
不描述预期
不描述计划
不把文件存在等同于测试完成
```

建议 Commit Message 使用：

```text
test: add bootstrap dependency tests
```

而不是：

```text
complete real React testing
```

除非真的使用 Testing Library 挂载。

---

## P1-4：GitHub Actions 仍缺少成功证据

当前没有可见 Workflow Run 或 Commit Status。

需要区分：

```text
CI configured
CI passed
```

当前最多只能标记：

```text
CI configured
```

不能标记：

```text
CI verified
```

### 验收

需要人工或 AI 报告：

```text
Workflow:
Quality Gate CI

Commit:
<sha>

Typecheck: PASS
Lint: PASS
Test: PASS
Expo Doctor: PASS
```

---

## P1-5：Dev UI 生产验证仍未完成

阶段状态文档明确写着：

```text
Requires manual verification
```

因此 Foundation 不能标记 Done。

必须至少完成一次：

```text
production build
anonymous 访问 /dev/ui
authenticated 访问 /dev/ui
```

确认：

* 不显示 UI Showcase；
* 跳转到有效页面；
* 不循环；
* 不崩溃。

---

# 5. P2：建议优化

## P2-1：不要把每轮完整审查文档长期累积为近千行文件

归档比放根目录更好，但每轮近千行会快速膨胀。

建议后续归档只保留：

```text
审查 Commit
关键问题
最终决策
已完成项
未完成项
证据
```

完整执行指令可以保留在对话中，不必每轮全部入库。

---

## P2-2：阶段状态文档应增加 Evidence 字段

推荐：

| Phase         | Status      | Commit | Evidence                |
| ------------- | ----------- | ------ | ----------------------- |
| Scaffold      | Done        | SHA    | CI Run                  |
| UI Foundation | Done        | SHA    | UI Preview              |
| Hardening     | In Review   | SHA    | Bootstrap tests pending |
| OpenAPI       | Not Started | —      | —                       |

Evidence 必须能追溯：

* CI Run；
* Test File；
* Device Checklist；
* ADR；
* Commit。

---

## P2-3：测试数量不能作为主要质量指标

当前多次强调：

```text
78 tests passing
```

但 78 个低价值测试不能替代 10 个真实行为测试。

后续报告应优先写：

```text
关键行为覆盖
```

而不是：

```text
测试总数
```

例如：

```text
Bootstrap restore success: covered
Splash failure recovery: covered
Concurrent retry: covered
Unmount safety: covered
```

---

# 6. 本轮必须重写的文件

```text
src/features/app-bootstrap/__tests__/
├── useAppBootstrap.test.tsx
├── AppBootstrap.test.tsx
└── BootstrapErrorScreen.test.tsx
```

必要时修改：

```text
src/testing/setup.ts
vitest.config.ts
package.json
```

文档：

```text
docs/migration/phase-status.md
docs/testing/testing-strategy.md
AGENTS.md
```

---

# 7. 测试环境要求

当前 `vitest.config.ts` 和测试环境必须支持真实 React Native Rendering。

确认：

```text
@testing-library/react-native
react-test-renderer 或当前 RN 版本所需 renderer
Vitest setup
React Native mocks
Expo module mocks
```

如果 Vitest 与 React Native Testing Library 在当前组合下无法稳定运行：

1. 不得伪造 Hook 测试；
2. 可以为 React Component/Hook 测试切换 Jest；
3. 纯 TypeScript 和 API Client 测试继续使用 Vitest；
4. 通过 ADR 记录双测试运行器决策。

允许架构：

```text
Vitest
→ 纯 TS、API、Utils、Stores

Jest + React Native Testing Library
→ Hooks、Components、Navigation
```

不要为了坚持单一测试工具而写假测试。

---

# 8. 本轮禁止事项

AI Agent 不得：

1. 再次声称当前 Hook 测试使用真实 React Runtime；
2. 复制生产逻辑到测试文件；
3. 直接调用 React Component Function；
4. 只测试 Mock 本身；
5. 用注释描述本应存在的断言；
6. 用 `toBeDefined()` 替代 UI 断言；
7. 用测试数量证明质量；
8. 在 CI 未通过时标记 Foundation Done；
9. 在 Dev UI 未验证时标记 Foundation Done；
10. 开始 Swagger Pipeline；
11. 修改后端协议；
12. 修改 Legacy 签名算法；
13. 删除失败测试以通过门禁。

---

# 9. 必须运行

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm lint
pnpm test
pnpm doctor
pnpm validate
```

如果增加 Jest：

```bash
pnpm test:unit
pnpm test:react
pnpm validate
```

最终 `validate` 必须同时包含两套测试。

---

# 10. AI 完成后回报格式

```text
## 第六轮整改结果

### Hook 测试

- 是否真实调用 useAppBootstrap：
- 使用 renderHook 还是 Harness：
- 是否使用真实 React Runtime：
- 是否删除复制单飞逻辑：
- 是否删除 Mock 自调用测试：

### Component 测试

- 是否使用 render：
- 是否删除直接组件函数调用：
- 是否断言真实文案：
- 是否测试 Retry 点击：
- 是否测试 Ready Children：

### Bootstrap 覆盖矩阵

| 行为 | 测试名称 | 实际执行生产代码 | PASS/FAIL |
|---|---|---:|---:|
| 自动启动 | | Yes | |
| Restore 成功 | | Yes | |
| Restore 失败 | | Yes | |
| Splash 成功 | | Yes | |
| Splash 失败 | | Yes | |
| Retry | | Yes | |
| 单飞 | | Yes | |
| Unmount | | Yes | |

### 质量门禁

typecheck:
lint:
Vitest:
Jest/React Tests:
doctor:
validate:
GitHub Actions:

### 阶段状态

Project Scaffold:
UI Foundation:
Foundation Hardening:
Swagger/OpenAPI:
```

---

# 11. Foundation 最终关闭条件

只有以下全部满足后，才能标记 Foundation Done：

* [ ] `useAppBootstrap.test.tsx` 真实调用 Hook
* [ ] Hook 在真实 React Runtime 中运行
* [ ] AppBootstrap 使用 Testing Library Render
* [ ] 不再直接调用组件函数
* [ ] 测试不再复制生产逻辑
* [ ] 测试不再主要验证 Mock 本身
* [ ] Splash 失败恢复路径有真实测试
* [ ] Retry 单飞有真实测试
* [ ] Unmount 安全有真实测试
* [ ] `pnpm validate` PASS
* [ ] GitHub Actions PASS
* [ ] Dev UI 生产验证完成
* [ ] 阶段状态文档与实际一致

完成后才可进入：

```text
Phase 1：Swagger / OpenAPI Pipeline
```

当前阶段状态应调整为：

```text
Project Scaffold — Done
UI Foundation — Done
Foundation Hardening — In Review
Swagger/OpenAPI Pipeline — Not Started
```
