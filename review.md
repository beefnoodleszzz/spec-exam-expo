# spec-exam-expo 第四轮代码审查与 Foundation 收尾任务

## 1. 审查范围

仓库：

```text
beefnoodleszzz/spec-exam-expo
```

上一轮基线：

```text
5b6382a6e3ec38a4580a82063ef387919adcd82f
```

本次提交：

```text
ac4be2057ca86b87506b712d505d483ff3bd6b4b
```

提交说明：

```text
fix: complete third round hardening fixes (P0, P1, P2) per review.md
```

本轮重点检查：

* ESLint 规则恢复
* 统一质量门禁
* GitHub Actions
* Bootstrap 首次启动和重试
* HTTP Transport 行为测试
* Header 和 Query 参数安全
* 路由保护 ADR
* Development UI 生产隔离
* Foundation Hardening 是否可以正式关闭

---

# 2. 总体结论

本次提交质量明显提升，上一轮大多数问题已经得到正确处理。

已经确认完成或基本完成：

1. 恢复全局 `no-explicit-any` 规则。
2. Legacy 签名实现改为精确 ESLint Override，而不是全局忽略。
3. `validate` 已加入 `expo-doctor`。
4. 新增 GitHub Actions Quality Gate。
5. Bootstrap 已拆分为独立 Feature。
6. Bootstrap 重试阶段增加 React Loading Screen。
7. Bootstrap 错误页开始使用语义背景 Token。
8. 增加 HTTP timeout、cancelled、401、response 和 header 测试文件。
9. Development UI 增加生产环境阻断。
10. 路由保护实现写入 ADR。
11. Logger 基础设施已经建立。
12. Query 参数和 Header 处理继续收紧。

当前 Foundation Hardening 已接近完成，可评估为：

```text
约 94%
```

但暂时仍不建议立即进入 Swagger Pipeline。当前还有几个需要闭环的基础问题，其中有些属于真实运行风险，而不是代码风格问题。

本轮发现：

```text
P0：3 项
P1：5 项
P2：4 项
```

完成本轮后，可以正式关闭 Foundation Hardening，并进入 Phase 1。

---

# 3. P0：必须在进入下一阶段前修复

## P0-1：GitHub Actions 已创建，但尚未证明实际运行成功

### 当前情况

仓库已经新增：

```text
.github/workflows/quality.yml
```

工作流执行：

```text
pnpm install --frozen-lockfile
pnpm validate
```

这是正确方向。

但当前提交没有可见的 Commit Status 或 Workflow Run 结果，无法确认：

* Workflow 是否被 GitHub 识别；
* pnpm 版本是否有效；
* 锁文件是否匹配；
* `pnpm doctor` 是否在 CI 环境通过；
* 测试是否存在环境依赖；
* workflow YAML 是否真实运行。

当前不能仅凭文件存在，就将 CI 标记为完成。

### 修改目标

AI Agent 必须确认 GitHub Actions 已实际触发并通过。

若没有触发，检查：

1. Workflow 是否位于正确路径；
2. 默认分支是否为 `master`；
3. GitHub Actions 是否在仓库设置中启用；
4. `on.push.branches` 是否匹配；
5. Workflow 文件是否在提交时已经进入默认分支；
6. pnpm 版本是否可被 `pnpm/action-setup` 安装；
7. 是否存在 `pnpm-lock.yaml`。

推荐在 `package.json` 增加：

```json
{
  "packageManager": "pnpm@11.15.0"
}
```

然后 CI 不再单独维护另一个可能漂移的 pnpm 版本，或者使用 Corepack：

```yaml
- name: Enable Corepack
  run: corepack enable
```

### 验收

必须提供真实结果：

```text
GitHub Actions / Quality Gate CI / validate: PASS
```

不能仅回复：

```text
Workflow file 已创建
```

如果失败，必须提供：

* 失败步骤；
* 错误日志摘要；
* 修复内容；
* 新的成功 Run。

---

## P0-2：Bootstrap 仍然没有测试，关键状态机不可验证

### 当前问题

本次新增了：

```text
src/features/app-bootstrap/
├── components/
├── hooks/
└── index.ts
```

但提交文件中没有对应的 Bootstrap 测试。

当前 `useAppBootstrap()` 包含以下关键行为：

```text
首次运行
→ restoreSession + restoreExamProfile
→ ready / error
→ hide Splash

错误后重试
→ running
→ React Loading Screen
→ ready / error
```

这些行为目前完全依赖代码阅读，没有自动化证明。

尤其以下场景尚未验证：

* 首次成功；
* 首次失败；
* Splash 隐藏一次；
* 点击重试；
* 重试期间 Loading；
* 重复点击重试；
* 组件卸载时异步任务返回；
* restore 操作一个成功、一个失败；
* Splash API 抛错。

### 修改目标

新增：

```text
src/features/app-bootstrap/__tests__/
├── useAppBootstrap.test.tsx
├── BootstrapErrorScreen.test.tsx
└── AppBootstrap.test.tsx
```

至少覆盖：

#### 首次成功

```text
status = running
→ restore 完成
→ status = ready
→ SplashScreen.hideAsync 调用一次
```

#### 首次失败

```text
restoreExamProfile reject
→ status = error
→ Error Screen 可见
→ Native Splash 被隐藏
```

#### 重试

```text
error
→ 点击 retry
→ React Loading Screen 可见
→ 第二次 restore 成功
→ 显示 children
```

#### 单飞

连续快速触发 retry 时：

```text
只运行一个 Bootstrap Promise
```

#### 卸载安全

Hook 卸载后异步任务结束，不应继续执行状态更新。

### 推荐实现

增加 Bootstrap 单飞锁：

```ts
const bootstrapPromiseRef = useRef<Promise<void> | null>(null)

const runBootstrap = useCallback(() => {
  if (bootstrapPromiseRef.current) {
    return bootstrapPromiseRef.current
  }

  bootstrapPromiseRef.current = performBootstrap().finally(() => {
    bootstrapPromiseRef.current = null
  })

  return bootstrapPromiseRef.current
}, [])
```

### 禁止

* 不得只测试组件静态渲染；
* 不得只测试 `BootstrapStatus` 类型；
* 必须实际验证 Hook 的异步状态变化；
* 不得通过延长 arbitrary timeout 让测试偶然通过。

---

## P0-3：Splash 隐藏失败被静默吞掉，并提前标记为已隐藏

### 当前问题

当前实现：

```ts
if (!hasHiddenSplashRef.current) {
  hasHiddenSplashRef.current = true
  await SplashScreen.hideAsync().catch(() => {})
}
```

存在两个问题：

### 问题一：先标记，后执行

在 `hideAsync()` 真正成功前，已经设置：

```ts
hasHiddenSplashRef.current = true
```

如果 `hideAsync()` 失败：

```text
代码认为 Splash 已隐藏
实际 Native Splash 仍可能存在
后续不再尝试隐藏
应用可能永久卡在启动屏
```

### 问题二：错误完全吞掉

```ts
.catch(() => {})
```

没有 Logger、没有监控，也没有 fallback。

当前实现位于 Bootstrap Hook。

### 修改目标

改为：

```ts
const hideSplashOnce = useCallback(async () => {
  if (hasHiddenSplashRef.current) return

  try {
    await SplashScreen.hideAsync()
    hasHiddenSplashRef.current = true
  } catch (error) {
    logger.warn('splash_hide_failed', {
      error: sanitizeError(error),
    })
    throw error
  }
}, [])
```

或者：

```text
hide 失败
→ 记录错误
→ React UI 已经 ready 时允许显示错误状态
→ 提供一次有限重试
```

注意：

* 不需要无限重试；
* 不得把 Splash 错误完全静默；
* 不得在未成功时标记已隐藏。

### 验收

测试：

1. 第一次 `hideAsync()` 成功，只调用一次；
2. 第一次失败，不设置 `hasHiddenSplash = true`；
3. 后续可重试；
4. 失败被 Logger 捕获；
5. 不产生未处理 Promise rejection。

---

# 4. P1：当前阶段应完成

## P1-1：Bootstrap 对用户展示了原始异常消息

### 当前问题

当前代码：

```ts
const msg =
  err instanceof Error
    ? err.message
    : '初始化失败，请稍后重试'
```

随后直接展示：

```tsx
<BootstrapErrorScreen message={errorMessage} />
```

这可能向用户暴露：

* SecureStore 原生错误；
* AsyncStorage 内部路径；
* 模块名；
* 调试错误；
* 系统英文异常；
* 第三方 SDK 细节。

### 修改目标

区分：

```text
用户消息
诊断错误
```

推荐：

```ts
logger.error('app_bootstrap_failed', {
  error: sanitizeError(err),
})

setErrorMessage('本地配置加载失败，请重新尝试')
```

如果需要错误分类：

```ts
type BootstrapErrorCode =
  | 'session_restore_failed'
  | 'exam_profile_restore_failed'
  | 'splash_hide_failed'
  | 'unknown'
```

UI 只展示稳定产品文案。

### 禁止

* 不得直接展示 `Error.message`；
* 不得展示堆栈；
* 不得展示存储 Key；
* 不得展示 Token 或用户数据。

---

## P1-2：Bootstrap Error Screen 直接依赖 Light Theme

### 当前问题

当前：

```ts
import { lightSemanticColors } from '@/shared/theme/semantic/colors'
```

并将：

```ts
lightSemanticColors.danger
```

传给 Icon。

虽然不再使用 Hex，但仍然将组件绑定到浅色主题。

这会影响：

* 深色模式；
* 多品牌 Theme；
* 动态主题切换；
* 测试中的 Theme Provider。

### 修改目标

推荐为 `AppIcon` 增加语义 API：

```ts
type AppIconProps = {
  tone?:
    | 'default'
    | 'muted'
    | 'primary'
    | 'success'
    | 'warning'
    | 'danger'
    | 'inverse'
}
```

使用：

```tsx
<AppIcon
  name="alert-circle-outline"
  size={36}
  tone="danger"
/>
```

如果 `AppIcon` 暂时不能支持 Tone，则通过 Theme Hook 获取当前主题，而不是 import Light Theme 常量。

### 验收

* Bootstrap 组件不直接 import `lightSemanticColors`；
* 多品牌可覆盖 danger；
* 深色 Theme 下颜色来源正确；
* UI 代码无 Hex。

---

## P1-3：HTTP 测试数量增加，但仍需要确认完整行为覆盖

### 当前进展

已新增：

```text
request-cancellation.test.ts
request-header.test.ts
request-response.test.ts
request-timeout.test.ts
request-unauthorized.test.ts
```

这比上一轮显著完善。

但从提交内容看，尚不能确认以下行为都已测试：

* AbortSignal listener 被移除；
* FormData 不设置 Content-Type；
* JSON POST 正确 stringify；
* GET 无 Content-Type；
* Header 名大小写覆盖；
* Query 数组中出现 object；
* HTTP 401 Handler 只触发一次；
* Envelope 401 Handler 只触发一次；
* `arraybuffer` 不调用 JSON Parser；
* Network Error 与 Timeout 明确区分；
* 外部 Signal 在发请求前已 aborted；
* Query String 已存在时追加参数。

### 修改目标

AI Agent 必须输出 HTTP 测试覆盖矩阵：

| 行为                  | 测试文件                 | 测试名称 | 状态   |
| ------------------- | -------------------- | ---- | ---- |
| Timeout             | request-timeout      | ...  | PASS |
| External Abort      | request-cancellation | ...  | PASS |
| Listener Cleanup    | request-cancellation | ...  | PASS |
| HTTP 401            | request-unauthorized | ...  | PASS |
| Envelope 401        | request-unauthorized | ...  | PASS |
| JSON Body           | request-body         | ...  | PASS |
| FormData            | request-body         | ...  | PASS |
| ArrayBuffer         | request-response     | ...  | PASS |
| Header Case         | request-header       | ...  | PASS |
| Query Invalid Array | request-url          | ...  | PASS |

缺失的必须补齐。

### 特别要求

不得使用：

```text
文件存在
```

作为“测试已完成”的证明。

必须报告：

```text
测试名称 + 断言行为 + PASS
```

---

## P1-4：路由 ADR 中存在尚未证明的结论

### 当前问题

ADR 写道：

```text
Back navigation after logout is prevented because layout unmounts the protected stack.
```

这是一项行为性结论，但目前没有：

* Maestro 测试；
* 路由集成测试；
* Android Back 真机验证；
* iOS 手势返回验证；
* Deep Link 恢复验证。

ADR 可以记录设计决策，但不能把未测试行为直接写成确定事实。

### 修改目标

ADR 改为：

```text
Expected consequence:
The protected layout should unmount after logout, which is intended to prevent returning to protected routes. This behavior must be verified through route integration tests and device E2E tests.
```

并增加：

```text
Validation status: Pending
```

后续测试完成再改为：

```text
Validated
```

### 验收

至少增加一项自动化或真机验证记录：

```text
authenticated
→ open protected detail
→ logout
→ system back
→ protected page not accessible
```

---

## P1-5：Development UI 的生产 Redirect 目标需要验证

### 当前实现

```tsx
if (!__DEV__) {
  return <Redirect href="/+not-found" />
}
```

这是在尝试跳转到特殊的 `+not-found` 文件。

但 `+not-found.tsx` 属于 Expo Router 特殊路由文件，不能默认假设 `/+not-found` 是稳定、可直接导航的公开地址。

### 修改目标

优先选择稳定行为：

```tsx
if (!__DEV__) {
  return <Redirect href="/" />
}
```

或者根据 Session 状态跳到正常入口：

```text
authenticated → /(protected)/(tabs)
anonymous → /(public)/sign-in
```

另一种方案是生产环境直接返回：

```tsx
<NotFoundScreen />
```

不要依赖未验证的特殊路径。

### 验收

生产模式测试：

```text
打开 /dev/ui
→ 不显示 UI Showcase
→ 不进入重定向循环
→ 跳到有效页面
```

---

# 5. P2：建议优化

## P2-1：SessionProvider 可以删除

当前 `SessionProvider` 只做：

```ts
if (status === 'booting') return null
return children
```

而：

* Bootstrap 已由 `AppBootstrap` 负责；
* 路由保护由 Layout 负责；
* Session 状态由 Zustand 提供。

该 Provider 已没有明确价值。

建议：

```text
删除 SessionProvider
```

根布局改为：

```tsx
<AppProviders>
  <AppBootstrap>
    <Stack />
  </AppBootstrap>
</AppProviders>
```

如果决定保留，必须明确其未来职责，不能只作为空壳。

---

## P2-2：Bootstrap Hook 应处理组件卸载

当前异步 Bootstrap 结束后会执行：

```ts
setStatus(...)
setErrorMessage(...)
```

在开发 Fast Refresh、测试卸载或未来 Root 重建时，可能发生组件已卸载后更新状态。

建议：

```ts
const mountedRef = useRef(true)

useEffect(() => {
  return () => {
    mountedRef.current = false
  }
}, [])
```

状态更新前检查。

更理想的是允许 Bootstrap Promise 接收 AbortSignal。

---

## P2-3：CI 建议增加并发取消

连续 Push 时，旧的 CI Run 没必要继续运行。

建议：

```yaml
concurrency:
  group: quality-${{ github.ref }}
  cancel-in-progress: true
```

减少无效资源消耗。

---

## P2-4：CI 建议分步执行质量命令

当前只有：

```yaml
run: pnpm validate
```

如果失败，GitHub UI 只显示一个步骤失败。

建议拆分：

```yaml
- run: pnpm typecheck
- run: pnpm lint
- run: pnpm test
- run: pnpm doctor
```

本地仍保留：

```text
pnpm validate
```

CI 分步便于快速定位。

---

# 6. 本轮允许修改范围

```text
.github/workflows/quality.yml
package.json

src/features/app-bootstrap/**
src/providers/SessionProvider.tsx
src/app/_layout.tsx
src/app/dev/ui.tsx

src/shared/components/primitives/AppIcon.tsx
src/shared/theme/**
src/shared/logging/**
src/shared/api/client/**
src/shared/api/client/__tests__/**
src/shared/auth/**

docs/decisions/ADR-0002-router-auth-guard.md
相关测试文件
```

---

# 7. 本轮禁止事项

AI Agent 不得：

1. 开始 Swagger Pipeline 实现前跳过本轮 P0。
2. 开始短信登录或首页业务。
3. 把 Workflow 文件存在当成 CI 已通过。
4. 继续完全吞掉 Splash API 错误。
5. 把原始 `Error.message` 展示给用户。
6. 在业务组件直接依赖 Light Theme。
7. 用文件数量代替测试覆盖证明。
8. 在 ADR 中把未验证行为写成既定事实。
9. 用未验证的特殊 Router 路径作为生产 Redirect。
10. 修改 Legacy 签名算法输出。
11. 修改后端协议。
12. 引入新 UI 框架或本地数据库。

---

# 8. 完成后必须运行

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
GitHub Actions Quality Gate: PASS
```

如果 GitHub Actions 未运行，任务不算完成。

---

# 9. AI 完成后回报格式

```text
## 第四轮整改摘要

### P0
- CI 实际运行：
- Bootstrap 测试：
- Splash 隐藏失败处理：

### P1
- 用户错误信息：
- Theme 依赖：
- HTTP 测试矩阵：
- Router ADR：
- Dev UI 生产处理：

### P2
- SessionProvider：
- 卸载安全：
- CI concurrency：
- CI 分步：

## 新增测试

- Bootstrap：
- HTTP：
- Route：
- 其他：

## HTTP 测试覆盖矩阵

| 行为 | 测试文件 | 测试名称 | PASS/FAIL |
|---|---|---|---|

## 验证结果

pnpm typecheck: PASS/FAIL
pnpm lint: PASS/FAIL
pnpm test: PASS/FAIL
pnpm doctor: PASS/FAIL
pnpm validate: PASS/FAIL
GitHub Actions: PASS/FAIL
pnpm api:check: NOT READY

## 尚未完成

- 真机验证：
- Route E2E：
- Swagger：
- 正式 App 配置：
```

---

# 10. Foundation 关闭门禁

满足以下条件后，可以正式关闭 Foundation Hardening：

* [ ] GitHub Actions 实际通过
* [ ] Bootstrap Hook 有完整测试
* [ ] Bootstrap retry 单飞
* [ ] Splash hide 失败不再静默
* [ ] 用户不再看到原始异常
* [ ] Bootstrap UI 不依赖 Light Theme
* [ ] HTTP 测试覆盖矩阵完整
* [ ] Route ADR 区分设计预期和已验证事实
* [ ] Dev UI 生产入口验证通过
* [ ] `pnpm validate` 全部通过

完成后阶段状态可更新为：

```text
Phase 3：Project Scaffold — Done
UI Foundation — Done
Foundation Hardening — Done
```

然后正式进入：

```text
Phase 1：Swagger / OpenAPI Pipeline
```

下一阶段不应继续扩张基础抽象层，重点转为：

```text
Swagger 下载
→ 转 OpenAPI
→ Patch
→ Validate
→ Orval Generate
→ API Contract Tests
```
