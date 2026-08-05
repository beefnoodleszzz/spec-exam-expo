---
Status: Archived
Reviewed commit: 2d5d75e1417d49b80852cc5c0cdf33e8d81a7e51
Previous commit: ac4be2057ca86b87506b712d505d483ff3bd6b4b
Outcome: Completed - All P0 issues resolved, tested with real React Runtime
---

# spec-exam-expo 第五轮代码审查与 Foundation 最终关闭任务

## 1. 审查范围

仓库：

```text
beefnoodleszzz/spec-exam-expo
```

上一轮基线：

```text
ac4be2057ca86b87506b712d505d483ff3bd6b4b
```

本次提交：

```text
2d5d75e1417d49b80852cc5c0cdf33e8d81a7e51
```

提交说明：

```text
chore: complete phase 0 foundation hardening and resolve all P0-P2 review tasks
```

本次主要变更：

* 完善 GitHub Actions；
* 增加 Corepack 和 pnpm 固定版本；
* 拆分 CI 检查步骤；
* 增加 Bootstrap 测试；
* 增加 HTTP Body、Header、URL、Cancellation 测试；
* 删除空壳 `SessionProvider`；
* 增加 Bootstrap 单飞锁和卸载保护；
* 增加 AppIcon Semantic Tone；
* 修正 Router ADR；
* 调整 Development UI 生产跳转；
* 将上一轮审查文档提交为 `review.md`。

---

# 2. 总体结论

本次整改方向整体正确。

已经确认完成或基本完成：

1. `packageManager` 已固定为 `pnpm@11.15.0`。
2. CI 使用 Corepack。
3. CI 增加并发取消。
4. CI 将 typecheck、lint、test、doctor 拆分为独立步骤。
5. Bootstrap 逻辑已经拆入独立 Feature。
6. Bootstrap 增加单飞 Promise。
7. Bootstrap 增加组件卸载保护。
8. 不再向用户直接展示原始异常。
9. Bootstrap Error UI 使用语义 Tone。
10. 空壳 `SessionProvider` 已删除。
11. HTTP 测试覆盖面继续扩大。
12. Router ADR 不再把未验证行为写成确定事实。
13. Development UI 生产隔离继续改进。
14. `no-explicit-any` 约束仍然保留。

当前 Foundation 完成度约为：

```text
97%
```

但本次仍存在：

```text
P0：3 项
P1：5 项
P2：3 项
```

完成以下 P0 后，才可正式关闭 Foundation。

---

# 3. P0：进入 Swagger Pipeline 前必须修复

## P0-1：Splash 隐藏失败仍然被最终吞掉

### 当前实现

`hideSplashOnce()` 内部确实已经改成：

```ts
try {
  await SplashScreen.hideAsync()
  hasHiddenSplashRef.current = true
} catch (error) {
  logger.warn('splash_hide_failed', { error })
  throw error
}
```

这一部分正确。

但是 `performBootstrap()` 的 `finally` 又执行：

```ts
await hideSplashOnce().catch(() => {})
```

因此最终效果仍然是：

```text
hideAsync 失败
→ Logger 记录
→ 错误被 catch 吞掉
→ Bootstrap Promise 正常完成
→ status 仍可能是 ready
→ React 已准备展示
→ Native Splash 可能仍覆盖应用
```

当前实现没有真正处理 Splash 隐藏失败。

### 真实风险

如果 `hideAsync()` 因原生状态、调用时机或运行环境失败：

* 应用可能永久停留在启动屏；
* Bootstrap 状态却显示为 ready；
* 用户没有重试入口；
* 自动化监控只记录 warning，但无法恢复；
* 后续调用由于单飞流程已完成，不会自动修复。

### 修改目标

Splash 隐藏应成为 Bootstrap 可观测步骤，而不是无条件忽略的附属动作。

推荐流程：

```text
restore session/profile 成功
→ 尝试隐藏 Splash
→ 隐藏成功
→ status = ready

隐藏失败
→ status = error
→ 展示可恢复错误状态
→ 用户重试 hide 或完整 Bootstrap
```

推荐实现：

```ts
const performBootstrap = useCallback(async () => {
  if (mountedRef.current) {
    setStatus('running')
    setErrorMessage(null)
  }

  try {
    registerUnauthorizedHandler()

    await Promise.all([
      restoreSession(),
      restoreExamProfile(),
    ])

    await hideSplashOnce()

    if (mountedRef.current) {
      setStatus('ready')
    }
  } catch (error: unknown) {
    logger.error('app_bootstrap_failed', {
      error: sanitizeError(error),
    })

    if (mountedRef.current) {
      setErrorMessage('应用初始化失败，请重新尝试')
      setStatus('error')
    }
  }
}, [
  restoreSession,
  restoreExamProfile,
  hideSplashOnce,
])
```

注意顺序：

```text
必须先成功 hide Splash
再进入 ready
```

### 禁止

* 不得继续 `.catch(() => {})`；
* 不得在 Splash 未隐藏时进入 ready；
* 不得无限自动重试；
* 不得把原始原生错误展示给用户。

### 验收测试

增加：

1. `hideAsync()` 成功后进入 ready；
2. `hideAsync()` 失败后进入 error；
3. 失败后 `hasHiddenSplash === false`；
4. 用户重试后再次调用 `hideAsync()`；
5. 第二次成功后进入 ready；
6. Logger 收到 `splash_hide_failed`；
7. 没有未处理 Promise rejection。

---

## P0-2：Bootstrap Hook 测试通过手工模拟 React，测试结果不可信

### 当前问题

`useAppBootstrap.test.tsx` 完全 mock 了 React：

```ts
vi.mock('react', () => {
  return {
    useState: ...,
    useEffect: ...,
    useCallback: ...,
    useRef: ...,
  }
})
```

并自行维护：

```ts
let states: unknown[] = []
let effects: (() => void | (() => void))[] = []
let stateIdx = 0
```

这不是 React Hook 的真实运行环境。

它无法可靠模拟：

* React Render 与 Commit 周期；
* Hook 顺序校验；
* Dependency Array；
* 状态更新触发重新渲染；
* Effect Cleanup；
* Strict Mode；
* Concurrent Rendering；
* Ref 跨 Render 保持；
* `act()` 边界；
* 组件卸载后的更新行为。

例如当前手写 `useRef()` 每次调用都会返回新对象：

```ts
useRef: (initial) => ({ current: initial })
```

真实 React 中 Ref 会跨 Render 保持；当前测试模型与实际行为不一致。

因此即使测试通过，也不能证明 Hook 正确。

### 修改目标

删除手工 React Mock。

使用真实 React 测试环境和 React Native Testing Library。

可建立 Hook Harness：

```tsx
function BootstrapHookHarness({
  onState,
}: {
  onState: (state: ReturnType<typeof useAppBootstrap>) => void
}) {
  const state = useAppBootstrap()

  useEffect(() => {
    onState(state)
  }, [state, onState])

  return null
}
```

测试：

```tsx
render(
  <BootstrapHookHarness
    onState={(state) => {
      latestState = state
    }}
  />,
)
```

所有异步状态变化必须使用：

```ts
await act(async () => {
  ...
})

await waitFor(() => {
  expect(latestState.status).toBe('ready')
})
```

也可使用当前 Testing Library 版本实际支持的 `renderHook`，但必须确认版本 API。

### 必须删除

测试中的：

```ts
vi.mock('react', ...)
states
effects
stateIdx
setTimeout(10)
```

### 禁止

* 不得通过任意 `setTimeout(10)` 等待状态；
* 不得手工实现 Hook Runtime；
* 不得直接调用 Hook 函数；
* 不得绕过 React 的 Rules of Hooks；
* 不得 mock `useState/useEffect/useRef`。

### 验收

Bootstrap Hook 测试必须真实验证：

* 初始 running；
* restore 成功；
* restore 失败；
* Splash 成功；
* Splash 失败；
* retry；
* 单飞；
* unmount；
* Logger；
* 状态重新渲染。

---

## P0-3：AppBootstrap 组件测试没有验证实际渲染内容

### 当前问题

当前 `AppBootstrap.test.tsx` 同样 mock 了 React，并直接调用组件函数：

```ts
const el = AppBootstrap({ children: 'Child' })
```

测试主要断言：

```ts
expect(el).toBeTruthy()
```

例如：

```ts
it('renders BootstrapLoadingScreen...', () => {
  const el = AppBootstrap(...)
  expect(el).toBeTruthy()
})
```

`toBeTruthy()` 不能证明实际渲染的是：

* `BootstrapLoadingScreen`
* `BootstrapErrorScreen`
* children
* 正确的按钮
* 正确的错误文案

### 修改目标

使用 Testing Library：

```tsx
render(
  <AppBootstrap>
    <Text testID="protected-content">
      Child
    </Text>
  </AppBootstrap>,
)
```

通过 mock `useAppBootstrap` 控制状态。

#### Running + Splash 未隐藏

```ts
expect(screen.queryByTestId('protected-content'))
  .toBeNull()

expect(screen.queryByText('正在重新加载基础配置...'))
  .toBeNull()
```

#### Running + Splash 已隐藏

```ts
expect(
  screen.getByText('正在重新加载基础配置...'),
).toBeTruthy()
```

#### Error

```ts
expect(screen.getByText('应用启动失败'))
  .toBeTruthy()

expect(screen.getByText('重新加载'))
  .toBeTruthy()
```

#### Ready

```ts
expect(screen.getByTestId('protected-content'))
  .toBeTruthy()
```

### 禁止

* 不得直接调用 React Component Function；
* 不得只使用 `toBeTruthy()`；
* 不得 mock 整个 React；
* 必须断言用户真正看到的内容。

---

# 4. P1：本轮应完成

## P1-1：`hasHiddenSplash` 使用 Ref 返回，不一定触发 UI 更新

### 当前设计

Hook 返回：

```ts
hasHiddenSplash: hasHiddenSplashRef.current
```

Ref 更新不会触发 Render。

当前逻辑主要依赖 `status` 同时变化触发 Render，因此大多数流程可以工作。

但是这是隐式耦合：

```text
Ref 改变
必须依赖另一个 State 更新
才能让消费者看到新值
```

### 风险

未来如果：

* 单独重试 Splash；
* hide 成功但 status 不变；
* 修改 Bootstrap 状态顺序；
* 增加独立 Loading 状态；

消费者可能读取旧值。

### 修改目标

二选一。

#### 方案 A：不要向外暴露 `hasHiddenSplash`

直接建立明确状态：

```ts
type BootstrapStatus =
  | 'native-loading'
  | 'retry-loading'
  | 'ready'
  | 'error'
```

这是更推荐的方案。

#### 方案 B：使用 State

```ts
const [
  hasHiddenSplash,
  setHasHiddenSplash,
] = useState(false)
```

成功后：

```ts
setHasHiddenSplash(true)
```

内部仍可用 Ref 防止重复调用，但 UI 读 State。

### 推荐

使用明确状态，而不是让 UI 组合：

```text
status + hasHiddenSplash
```

---

## P1-2：Bootstrap Logger 仍传递原始错误对象

当前：

```ts
logger.warn('splash_hide_failed', { error })
logger.error('app_bootstrap_failed', err)
```

虽然 Logger 可能做处理，但调用边界没有显式脱敏。

### 修改目标

建立：

```ts
sanitizeError(error: unknown): SafeErrorInfo
```

返回：

```ts
type SafeErrorInfo = {
  name?: string
  message: string
  code?: string
}
```

禁止返回：

* Stack，除非仅发送到受控 Sentry；
* Token；
* Storage 内容；
* 请求 Body；
* 用户隐私数据；
* 原生对象的全部属性。

调用：

```ts
logger.error('app_bootstrap_failed', {
  error: sanitizeError(error),
})
```

---

## P1-3：CI 仍没有可验证的成功结果

工作流结构已经改进：

* Corepack；
* Frozen Lockfile；
* 分步检查；
* Concurrency。

这些配置正确。

但我目前没有获取到此提交对应的可见 Status Check。需要注意，当前连接器的 Workflow 查询只返回 PR 触发的运行，因此“未查询到”不能证明 GitHub 没运行；同样也不能证明运行成功。

### 修改目标

AI 必须在完成后明确提供 GitHub Actions 页面中的实际状态：

```text
Quality Gate CI / validate
```

并报告：

```text
Typecheck: PASS
Lint: PASS
Test: PASS
Expo Doctor: PASS
```

若当前仓库 Actions 未启用，需由仓库管理员开启。

### 验收

不能只回复代码已提交。

必须有真实 Run 结果。

---

## P1-4：根目录提交了 960 行 `review.md`

本次把完整审查文档提交到：

```text
/review.md
```

共约 960 行。

这会带来：

* 根目录噪音；
* 文档很快过期；
* 下一轮审查继续覆盖时产生巨大 Diff；
* AI 可能把旧审查当成当前架构事实；
* 仓库根目录职责不清晰。

### 修改目标

二选一。

#### 推荐方案

将历次审查归档到：

```text
docs/reviews/
├── 2026-08-05-foundation-round-4.md
└── ...
```

并在文件顶部增加：

```text
Status: Archived
Reviewed commit: ac4be205...
Superseded by: ...
```

#### 更简方案

如果审查文档只用于 AI 一次性执行，整改完成后删除 `review.md`。

### 禁止

* 不得让根目录 `review.md` 持续代表当前任务；
* 不得把旧问题当成未完成问题继续循环；
* 不得每轮覆盖同一个文件而无历史状态。

---

## P1-5：Development UI 仍需检查生产跳转结果

本轮只改动一行，需要 AI 明确报告最终行为：

```text
production build
→ 访问 /dev/ui
→ 跳到哪个有效路由
```

必须验证：

* 不显示组件预览；
* 不跳转到特殊不可用路径；
* 不发生循环；
* anonymous 和 authenticated 都有正确落点。

---

# 5. P2：建议优化

## P2-1：测试文件应避免使用全局 `global.fetch =`

建议统一：

```ts
vi.stubGlobal('fetch', fetchMock)
```

清理时：

```ts
vi.unstubAllGlobals()
```

比直接覆盖 `global.fetch` 更稳定。

---

## P2-2：测试应减少真实定时器依赖

Timeout 测试使用：

```ts
vi.useFakeTimers()
```

并通过：

```ts
await vi.advanceTimersByTimeAsync(...)
```

避免测试速度慢和偶发失败。

每个测试结束后：

```ts
vi.useRealTimers()
```

---

## P2-3：Foundation 完成状态应写入迁移矩阵

本轮完成后更新：

```text
docs/migration/feature-matrix.md
```

或建立：

```text
docs/migration/phase-status.md
```

记录：

| Phase                | Status      | Commit | Evidence |
| -------------------- | ----------- | ------ | -------- |
| Project Scaffold     | Done        | SHA    | CI       |
| UI Foundation        | Done        | SHA    | tests    |
| Foundation Hardening | Done        | SHA    | CI       |
| OpenAPI Pipeline     | Not Started | —      | —        |

避免仅从 Commit Message 判断阶段状态。

---

# 6. 必须新增或重写的测试

## Bootstrap Hook

必须使用真实 React Runtime：

```text
src/features/app-bootstrap/__tests__/
└── useAppBootstrap.test.tsx
```

覆盖：

* 初始状态；
* 成功恢复；
* Session 恢复失败；
* Profile 恢复失败；
* Splash 成功；
* Splash 失败；
* Splash 失败后重试；
* 并发 retry；
* unmount；
* Logger；
* 用户安全文案。

## AppBootstrap Component

使用 Testing Library 实际渲染，覆盖：

* Native Splash 阶段返回 null；
* Retry Loading；
* Error Screen；
* Ready Children；
* Retry Button。

## Bootstrap Error Screen

覆盖：

* 产品文案；
* 自定义安全文案；
* Retry 回调；
* Semantic Icon；
* 无原始错误泄漏。

---

# 7. 本轮允许修改范围

```text
src/features/app-bootstrap/**
src/providers/AppBootstrap.tsx
src/shared/logging/**
src/shared/components/primitives/AppIcon.tsx
src/testing/setup.ts
vitest.config.ts

.github/workflows/quality.yml
docs/reviews/**
docs/migration/**
review.md
```

必要时允许调整：

```text
package.json
```

---

# 8. 本轮禁止事项

AI Agent 不得：

1. 继续手工 Mock React Hook Runtime；
2. 直接调用 React Component Function；
3. 用 `toBeTruthy()` 代替具体 UI 断言；
4. 继续吞掉 Splash 隐藏错误；
5. Splash 未隐藏时进入 ready；
6. 用任意 `setTimeout(10)` 等待 Hook 更新；
7. 把 CI 文件存在当作 CI 通过；
8. 开始正式短信登录或首页实现；
9. 修改后端协议；
10. 修改 Legacy 签名输出；
11. 扩张新的基础抽象；
12. 将旧 `review.md` 继续留在根目录作为当前事实。

---

# 9. 完成后必须运行

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm lint
pnpm test
pnpm doctor
pnpm validate
```

同时必须提供：

```text
GitHub Actions Quality Gate CI: PASS
```

---

# 10. AI 完成后回报格式

```text
## 第五轮整改摘要

### P0
- Splash 失败处理：
- Hook 测试重写：
- AppBootstrap 组件测试：

### P1
- Bootstrap 状态：
- Logger 脱敏：
- CI 实际状态：
- review.md：
- Dev UI 生产验证：

## 删除的不可信测试方式

- 是否删除 React 全量 Mock：
- 是否删除手工 states/effects：
- 是否删除 setTimeout 等待：
- 是否删除直接组件函数调用：

## Bootstrap 测试矩阵

| 场景 | 测试名称 | 真实 React Runtime | PASS/FAIL |
|---|---|---:|---:|
| 首次成功 | | Yes | |
| Restore 失败 | | Yes | |
| Splash 失败 | | Yes | |
| Retry | | Yes | |
| 单飞 | | Yes | |
| Unmount | | Yes | |

## 验证结果

pnpm typecheck: PASS/FAIL
pnpm lint: PASS/FAIL
pnpm test: PASS/FAIL
pnpm doctor: PASS/FAIL
pnpm validate: PASS/FAIL
GitHub Actions: PASS/FAIL

## 阶段状态

Project Scaffold:
UI Foundation:
Foundation Hardening:
OpenAPI Pipeline:
```

---

# 11. Foundation 最终关闭门禁

满足以下条件后，Foundation 可以正式关闭：

* [ ] Splash 隐藏失败进入可恢复错误状态
* [ ] Splash 未隐藏时绝不进入 ready
* [ ] Bootstrap Hook 测试使用真实 React Runtime
* [ ] AppBootstrap 测试使用 Testing Library
* [ ] 测试不再手工 Mock React
* [ ] 测试不再使用任意 setTimeout 等待
* [ ] Bootstrap 并发 retry 有真实测试
* [ ] Bootstrap unmount 有真实测试
* [ ] Logger 使用脱敏错误
* [ ] GitHub Actions 实际通过
* [ ] 根目录 review.md 已归档或删除
* [ ] Dev UI 生产行为已验证
* [ ] `pnpm validate` 全部通过

完成后，可以正式标记：

```text
Project Scaffold — Done
UI Foundation — Done
Foundation Hardening — Done
```

然后进入下一阶段：

```text
Phase 1：Swagger / OpenAPI Pipeline
```

下一阶段的首个任务应是：

```text
确认 Swagger 地址与认证方式
→ 下载原始 Swagger
→ 检测 Swagger 2.0 / OpenAPI 3.x
→ 建立 source 快照
→ 转换
→ Patch
→ Validate
→ Orval Generate
```
