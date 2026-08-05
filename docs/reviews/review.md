# spec-exam-expo React 测试基础设施与 Bootstrap 测试整改工单

## 1. 任务目标

当前仓库已经完成 Bootstrap 生产逻辑整改，但 React Hook 和 React Native Component 仍未在真实 React Runtime 中测试。

本次任务只做以下工作：

```text id="k0q4or"
1. 建立 Jest + jest-expo React Native 测试环境
2. 保留 Vitest 负责纯 TypeScript 测试
3. 使用真实 renderHook 测试 useAppBootstrap
4. 使用真实 render 测试 AppBootstrap
5. 将两类测试同时纳入 validate 和 GitHub Actions
6. 修正阶段状态文档
```

本次禁止开始 Swagger、登录、首页或其他业务开发。

---

# 2. 必须修改的文件

```text id="o9201k"
package.json
jest.config.cjs
jest.setup.ts
vitest.config.ts
.github/workflows/quality.yml

src/features/app-bootstrap/__tests__/useAppBootstrap.react.test.tsx
src/features/app-bootstrap/__tests__/AppBootstrap.react.test.tsx
src/features/app-bootstrap/__tests__/BootstrapErrorScreen.react.test.tsx

docs/migration/phase-status.md
docs/testing/testing-strategy.md
docs/reviews/2026-08-05-foundation-round-6.md
```

删除以下失真的测试文件，或将其中有效的非 React 测试迁移后删除：

```text id="4sx40q"
src/features/app-bootstrap/__tests__/useAppBootstrap.test.tsx
src/features/app-bootstrap/__tests__/AppBootstrap.test.tsx
```

---

# 3. 安装 React Native 测试依赖

先使用 Expo 推荐方式安装与当前 SDK 兼容的依赖。

执行：

```bash id="a9o3vi"
pnpm exec expo install jest-expo react-test-renderer
pnpm add -D jest @types/jest
```

如果 `@testing-library/react-native` 已存在，不重复安装。

安装后确认：

```text id="49x6vv"
react-test-renderer 与当前 React 版本兼容
jest-expo 与 Expo SDK 57 兼容
```

不得手动指定 React 18 的 `react-test-renderer`。

---

# 4. 修改 package.json

将测试脚本修改为以下结构。

保留现有 OpenAPI 脚本和其他脚本，不要覆盖无关内容。

```json id="dq6vtz"
{
  "scripts": {
    "test:unit": "vitest run",
    "test:react": "jest --runInBand",
    "test": "pnpm test:unit && pnpm test:react",
    "test:unit:watch": "vitest",
    "test:react:watch": "jest --watch",
    "validate:base": "pnpm typecheck && pnpm lint && pnpm test && pnpm doctor",
    "validate": "pnpm validate:base"
  }
}
```

确保不再存在以下旧脚本：

```json id="k8jsqv"
"test": "vitest run"
```

因为该脚本会跳过 React 测试。

---

# 5. 新增 jest.config.cjs

创建：

```text id="gk044j"
jest.config.cjs
```

内容：

```js id="7vt7rt"
module.exports = {
  preset: 'jest-expo',

  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.ts',
  ],

  testMatch: [
    '<rootDir>/src/**/*.react.test.ts',
    '<rootDir>/src/**/*.react.test.tsx',
  ],

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.react.test.{ts,tsx}',
    '!src/shared/api/generated/**',
    '!src/shared/utils/magic-sign.ts',
  ],

  clearMocks: true,
  restoreMocks: true,
  resetMocks: false,
}
```

不要使用：

```text id="m0fi4c"
testEnvironment: jsdom
```

这是 React Native 测试，不是 Web DOM 测试。

---

# 6. 新增 jest.setup.ts

创建：

```text id="u4hm0x"
jest.setup.ts
```

内容：

```ts id="pnapkv"
import '@testing-library/react-native/extend-expect'

jest.mock('expo-splash-screen', () => ({
  hideAsync: jest.fn(),
  preventAutoHideAsync: jest.fn(),
}))

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock')

  Reanimated.default.call = () => undefined

  return Reanimated
})

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')
```

如果当前版本不存在：

```text id="g30099"
@testing-library/react-native/extend-expect
```

则删除该 import，不得为了它降级 Testing Library。

如果 `NativeAnimatedHelper` 路径在 RN 0.86 中不存在，删除对应 Mock，并根据实际错误使用当前版本有效路径。

不得加入大范围的 React Mock。

禁止：

```ts id="3e3ycb"
jest.mock('react')
```

---

# 7. 调整 Vitest 扫描范围

修改：

```text id="f3wz0j"
vitest.config.ts
```

确保 Vitest 不扫描 React 测试。

在现有配置中增加或调整：

```ts id="1uuh5s"
export default defineConfig({
  test: {
    include: [
      'src/**/*.test.ts',
      'src/**/*.test.tsx',
    ],

    exclude: [
      'src/**/*.react.test.ts',
      'src/**/*.react.test.tsx',
      'node_modules/**',
      'dist/**',
      '.expo/**',
    ],
  },
})
```

如果现有 `include` 已经更精确，只需要增加两个 React 测试排除项。

最终规则：

```text id="adtxci"
*.test.ts / *.test.tsx
→ Vitest

*.react.test.ts / *.react.test.tsx
→ Jest
```

两个运行器不得重复扫描同一测试。

---

# 8. 重写 useAppBootstrap Hook 测试

创建：

```text id="198nu0"
src/features/app-bootstrap/__tests__/useAppBootstrap.react.test.tsx
```

完整代码如下。

```tsx id="tv05di"
import { act, renderHook, waitFor } from '@testing-library/react-native'
import * as SplashScreen from 'expo-splash-screen'

import { useAppBootstrap } from '../hooks/useAppBootstrap'
import { sessionStore } from '@/shared/auth/session-store'
import { appStore } from '@/shared/auth/app-store'
import { logger } from '@/shared/logging/logger'
import { registerUnauthorizedHandler } from '@/shared/auth/session-service'

jest.mock('@/shared/auth/session-service', () => ({
  registerUnauthorizedHandler: jest.fn(),
}))

jest.mock('@/shared/logging/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },

  sanitizeError: jest.fn((error: unknown) => {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
      }
    }

    return {
      message: 'Unknown error',
    }
  }),
}))

describe('useAppBootstrap', () => {
  const hideAsyncMock =
    SplashScreen.hideAsync as jest.MockedFunction<
      typeof SplashScreen.hideAsync
    >

  beforeEach(() => {
    jest.clearAllMocks()

    sessionStore.setState({
      status: 'booting',
      accessToken: null,
      userId: null,
    })

    appStore.setState({
      currentExamProfile: null,
    })
  })

  it('starts automatically and restores session and exam profile', async () => {
    const restoreSession = jest
      .spyOn(sessionStore.getState(), 'restoreSession')
      .mockResolvedValue(undefined)

    const restoreExamProfile = jest
      .spyOn(appStore.getState(), 'restoreExamProfile')
      .mockResolvedValue(undefined)

    hideAsyncMock.mockResolvedValue(undefined)

    const { result } = renderHook(() =>
      useAppBootstrap(),
    )

    expect(result.current.status).toBe('running')

    await waitFor(() => {
      expect(registerUnauthorizedHandler)
        .toHaveBeenCalledTimes(1)

      expect(restoreSession)
        .toHaveBeenCalledTimes(1)

      expect(restoreExamProfile)
        .toHaveBeenCalledTimes(1)
    })
  })

  it('enters ready only after restore and splash hide succeed', async () => {
    jest
      .spyOn(sessionStore.getState(), 'restoreSession')
      .mockResolvedValue(undefined)

    jest
      .spyOn(appStore.getState(), 'restoreExamProfile')
      .mockResolvedValue(undefined)

    hideAsyncMock.mockResolvedValue(undefined)

    const { result } = renderHook(() =>
      useAppBootstrap(),
    )

    await waitFor(() => {
      expect(result.current.status)
        .toBe('ready')
    })

    expect(result.current.hasHiddenSplash)
      .toBe(true)

    expect(result.current.errorMessage)
      .toBeNull()

    expect(hideAsyncMock)
      .toHaveBeenCalledTimes(1)
  })

  it('enters error when session restore fails', async () => {
    const error = new Error(
      'secure storage internal failure',
    )

    jest
      .spyOn(sessionStore.getState(), 'restoreSession')
      .mockRejectedValue(error)

    jest
      .spyOn(appStore.getState(), 'restoreExamProfile')
      .mockResolvedValue(undefined)

    const { result } = renderHook(() =>
      useAppBootstrap(),
    )

    await waitFor(() => {
      expect(result.current.status)
        .toBe('error')
    })

    expect(result.current.errorMessage)
      .toBe('应用初始化失败，请重新尝试')

    expect(result.current.errorMessage)
      .not.toContain('secure storage')

    expect(logger.error)
      .toHaveBeenCalled()
  })

  it('enters error when exam profile restore fails', async () => {
    jest
      .spyOn(sessionStore.getState(), 'restoreSession')
      .mockResolvedValue(undefined)

    jest
      .spyOn(appStore.getState(), 'restoreExamProfile')
      .mockRejectedValue(
        new Error('profile storage failure'),
      )

    const { result } = renderHook(() =>
      useAppBootstrap(),
    )

    await waitFor(() => {
      expect(result.current.status)
        .toBe('error')
    })

    expect(result.current.hasHiddenSplash)
      .toBe(false)

    expect(logger.error)
      .toHaveBeenCalled()
  })

  it('does not enter ready when splash hide fails', async () => {
    jest
      .spyOn(sessionStore.getState(), 'restoreSession')
      .mockResolvedValue(undefined)

    jest
      .spyOn(appStore.getState(), 'restoreExamProfile')
      .mockResolvedValue(undefined)

    hideAsyncMock.mockRejectedValue(
      new Error('native splash failure'),
    )

    const { result } = renderHook(() =>
      useAppBootstrap(),
    )

    await waitFor(() => {
      expect(result.current.status)
        .toBe('error')
    })

    expect(result.current.hasHiddenSplash)
      .toBe(false)

    expect(result.current.status)
      .not.toBe('ready')

    expect(logger.warn)
      .toHaveBeenCalledWith(
        'splash_hide_failed',
        expect.any(Object),
      )

    expect(logger.error)
      .toHaveBeenCalledWith(
        'app_bootstrap_failed',
        expect.any(Object),
      )
  })

  it('retries after failure and enters ready', async () => {
    const restoreSession = jest
      .spyOn(sessionStore.getState(), 'restoreSession')

    restoreSession
      .mockRejectedValueOnce(
        new Error('first attempt failed'),
      )
      .mockResolvedValueOnce(undefined)

    jest
      .spyOn(appStore.getState(), 'restoreExamProfile')
      .mockResolvedValue(undefined)

    hideAsyncMock.mockResolvedValue(undefined)

    const { result } = renderHook(() =>
      useAppBootstrap(),
    )

    await waitFor(() => {
      expect(result.current.status)
        .toBe('error')
    })

    await act(async () => {
      await result.current.retry()
    })

    await waitFor(() => {
      expect(result.current.status)
        .toBe('ready')
    })

    expect(restoreSession)
      .toHaveBeenCalledTimes(2)

    expect(result.current.hasHiddenSplash)
      .toBe(true)
  })

  it('returns the same promise for concurrent retry calls', async () => {
    let resolveRestore:
      | (() => void)
      | undefined

    const pendingRestore = new Promise<void>(
      (resolve) => {
        resolveRestore = resolve
      },
    )

    const restoreSession = jest
      .spyOn(sessionStore.getState(), 'restoreSession')
      .mockReturnValue(pendingRestore)

    jest
      .spyOn(appStore.getState(), 'restoreExamProfile')
      .mockResolvedValue(undefined)

    hideAsyncMock.mockResolvedValue(undefined)

    const { result } = renderHook(() =>
      useAppBootstrap(),
    )

    await waitFor(() => {
      expect(restoreSession)
        .toHaveBeenCalledTimes(1)
    })

    let promise1: Promise<void>
    let promise2: Promise<void>
    let promise3: Promise<void>

    act(() => {
      promise1 = result.current.retry()
      promise2 = result.current.retry()
      promise3 = result.current.retry()
    })

    expect(promise1!).toBe(promise2!)
    expect(promise2!).toBe(promise3!)

    await act(async () => {
      resolveRestore?.()
      await promise1!
    })

    expect(restoreSession)
      .toHaveBeenCalledTimes(1)
  })

  it('does not update React state after unmount', async () => {
    let resolveRestore:
      | (() => void)
      | undefined

    const pendingRestore = new Promise<void>(
      (resolve) => {
        resolveRestore = resolve
      },
    )

    jest
      .spyOn(sessionStore.getState(), 'restoreSession')
      .mockReturnValue(pendingRestore)

    jest
      .spyOn(appStore.getState(), 'restoreExamProfile')
      .mockResolvedValue(undefined)

    hideAsyncMock.mockResolvedValue(undefined)

    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)

    const { unmount } = renderHook(() =>
      useAppBootstrap(),
    )

    unmount()

    await act(async () => {
      resolveRestore?.()
      await pendingRestore
    })

    expect(consoleError)
      .not.toHaveBeenCalledWith(
        expect.stringContaining(
          'state update on an unmounted component',
        ),
      )

    consoleError.mockRestore()
  })
})
```

## 关于 Single Flight 测试

当前 Hook 在挂载时已经自动运行一次 Bootstrap。

因此在第一次 Bootstrap Promise 尚未完成时调用 `retry()`，应返回同一个正在执行的 Promise，并且不能再次调用 `restoreSession`。

不要复制单飞实现到测试。

---

# 9. 重写 AppBootstrap 组件测试

创建：

```text id="d67qpr"
src/features/app-bootstrap/__tests__/AppBootstrap.react.test.tsx
```

完整代码：

```tsx id="0b0b46"
import React from 'react'
import {
  fireEvent,
  render,
  screen,
} from '@testing-library/react-native'
import { Text } from 'react-native'

import { AppBootstrap } from '@/providers/AppBootstrap'
import { useAppBootstrap } from '../hooks/useAppBootstrap'

jest.mock('../hooks/useAppBootstrap', () => ({
  useAppBootstrap: jest.fn(),
}))

const useAppBootstrapMock =
  useAppBootstrap as jest.MockedFunction<
    typeof useAppBootstrap
  >

describe('AppBootstrap', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders nothing while native splash is visible', () => {
    useAppBootstrapMock.mockReturnValue({
      status: 'running',
      errorMessage: null,
      hasHiddenSplash: false,
      retry: jest.fn(),
    })

    render(
      <AppBootstrap>
        <Text testID="app-content">
          Protected Content
        </Text>
      </AppBootstrap>,
    )

    expect(
      screen.queryByTestId('app-content'),
    ).toBeNull()

    expect(
      screen.queryByText(
        '正在重新加载基础配置...',
      ),
    ).toBeNull()
  })

  it('renders React loading screen during retry', () => {
    useAppBootstrapMock.mockReturnValue({
      status: 'running',
      errorMessage: null,
      hasHiddenSplash: true,
      retry: jest.fn(),
    })

    render(
      <AppBootstrap>
        <Text testID="app-content">
          Protected Content
        </Text>
      </AppBootstrap>,
    )

    expect(
      screen.getByText(
        '正在重新加载基础配置...',
      ),
    ).toBeTruthy()

    expect(
      screen.queryByTestId('app-content'),
    ).toBeNull()
  })

  it('renders bootstrap error screen', () => {
    useAppBootstrapMock.mockReturnValue({
      status: 'error',
      errorMessage:
        '应用初始化失败，请重新尝试',
      hasHiddenSplash: false,
      retry: jest.fn(),
    })

    render(
      <AppBootstrap>
        <Text testID="app-content">
          Protected Content
        </Text>
      </AppBootstrap>,
    )

    expect(
      screen.getByText('应用启动失败'),
    ).toBeTruthy()

    expect(
      screen.getByText(
        '应用初始化失败，请重新尝试',
      ),
    ).toBeTruthy()

    expect(
      screen.getByText('重新加载'),
    ).toBeTruthy()
  })

  it('calls retry when retry button is pressed', () => {
    const retry = jest.fn()

    useAppBootstrapMock.mockReturnValue({
      status: 'error',
      errorMessage:
        '应用初始化失败，请重新尝试',
      hasHiddenSplash: false,
      retry,
    })

    render(
      <AppBootstrap>
        <Text testID="app-content">
          Protected Content
        </Text>
      </AppBootstrap>,
    )

    fireEvent.press(
      screen.getByText('重新加载'),
    )

    expect(retry)
      .toHaveBeenCalledTimes(1)
  })

  it('renders children only when ready', () => {
    useAppBootstrapMock.mockReturnValue({
      status: 'ready',
      errorMessage: null,
      hasHiddenSplash: true,
      retry: jest.fn(),
    })

    render(
      <AppBootstrap>
        <Text testID="app-content">
          Protected Content
        </Text>
      </AppBootstrap>,
    )

    expect(
      screen.getByTestId('app-content'),
    ).toBeTruthy()

    expect(
      screen.queryByText('应用启动失败'),
    ).toBeNull()

    expect(
      screen.queryByText(
        '正在重新加载基础配置...',
      ),
    ).toBeNull()
  })
})
```

---

# 10. 重写 BootstrapErrorScreen 测试

创建：

```text id="cpl02k"
src/features/app-bootstrap/__tests__/BootstrapErrorScreen.react.test.tsx
```

完整代码：

```tsx id="lw1vgp"
import React from 'react'
import {
  fireEvent,
  render,
  screen,
} from '@testing-library/react-native'

import { BootstrapErrorScreen } from '../components/BootstrapErrorScreen'

describe('BootstrapErrorScreen', () => {
  it('renders stable product copy', () => {
    render(
      <BootstrapErrorScreen
        message="应用初始化失败，请重新尝试"
        onRetry={jest.fn()}
      />,
    )

    expect(
      screen.getByText('应用启动失败'),
    ).toBeTruthy()

    expect(
      screen.getByText(
        '应用初始化失败，请重新尝试',
      ),
    ).toBeTruthy()

    expect(
      screen.getByText('重新加载'),
    ).toBeTruthy()
  })

  it('uses fallback copy when message is absent', () => {
    render(
      <BootstrapErrorScreen
        message={null}
        onRetry={jest.fn()}
      />,
    )

    expect(
      screen.getByText(
        '加载本地配置异常，请尝试重新打开应用',
      ),
    ).toBeTruthy()
  })

  it('calls retry callback once', () => {
    const onRetry = jest.fn()

    render(
      <BootstrapErrorScreen
        message="应用初始化失败，请重新尝试"
        onRetry={onRetry}
      />,
    )

    fireEvent.press(
      screen.getByText('重新加载'),
    )

    expect(onRetry)
      .toHaveBeenCalledTimes(1)
  })

  it('does not expose raw native errors', () => {
    render(
      <BootstrapErrorScreen
        message="应用初始化失败，请重新尝试"
        onRetry={jest.fn()}
      />,
    )

    expect(
      screen.queryByText(
        /SecureStore|AsyncStorage|native module/i,
      ),
    ).toBeNull()
  })
})
```

---

# 11. 删除旧伪测试

删除：

```text id="rks35u"
src/features/app-bootstrap/__tests__/useAppBootstrap.test.tsx
src/features/app-bootstrap/__tests__/AppBootstrap.test.tsx
```

如果 `BootstrapErrorScreen.test.tsx` 仍然直接调用组件或只断言对象存在，也删除并由新的 `.react.test.tsx` 替代。

执行搜索：

```bash id="imfd1a"
rg "AppBootstrap\\(" src/features/app-bootstrap/__tests__
rg "useAppBootstrap Hook Logic" src/features/app-bootstrap/__tests__
rg "In a real Testing Library" src/features/app-bootstrap/__tests__
rg "demonstrate single-flight" src/features/app-bootstrap/__tests__
```

期望结果：

```text id="yjhkxh"
0 matches
```

---

# 12. 修改 GitHub Actions

修改：

```text id="448b7w"
.github/workflows/quality.yml
```

将测试步骤拆成：

```yaml id="m6dcqy"
- name: Typecheck
  run: pnpm typecheck

- name: Lint
  run: pnpm lint

- name: Unit Tests
  run: pnpm test:unit

- name: React Native Tests
  run: pnpm test:react

- name: Expo Doctor
  run: pnpm doctor
```

CI 不要只运行：

```yaml id="54tn2v"
pnpm test:unit
```

也不要只运行旧的 `pnpm test`，除非已经确认该脚本包含两个测试运行器。

---

# 13. 修改阶段状态文档

修改：

```text id="b6oi3x"
docs/migration/phase-status.md
```

在本次代码提交和 CI 成功前，状态保持：

```md id="rks6vr"
| Phase | Name | Status | Evidence |
|---|---|---|---|
| 0 | Project Scaffold | Done | Scaffold commit |
| 1 | UI Foundation | Done | UI Foundation commit |
| 2 | Foundation Hardening | In Review | React tests pending |
| 3 | Swagger / OpenAPI Pipeline | Not Started | — |
```

完成真实 React 测试但 CI 尚未通过时：

```text id="lh6le8"
Foundation Hardening — In Review
```

只有以下全部通过后改为：

```text id="z7jr3c"
Foundation Hardening — Done
```

条件：

```text id="xvlqzu"
test:unit PASS
test:react PASS
validate PASS
GitHub Actions PASS
Dev UI production PASS
Route Guard device check PASS
```

---

# 14. 新增测试策略文档

创建：

```text id="nep299"
docs/testing/testing-strategy.md
```

内容：

````md id="c8mq70"
# Testing Strategy

## Vitest

Vitest is used for code that does not require a React renderer:

- API client
- Envelope parsing
- Error mapping
- Query serialization
- Zustand store logic
- Persistence wrappers
- Signature compatibility
- Pure utilities

Test files:

```text
*.test.ts
*.test.tsx
````

## Jest + jest-expo

Jest with jest-expo and React Native Testing Library is used for:

* React hooks
* React Native components
* Providers
* Route guards
* Navigation behavior
* UI interactions

Test files:

```text
*.react.test.ts
*.react.test.tsx
```

## Rules

* Never mock React.
* Never call a component function directly.
* Never copy production logic into a test.
* Mock external dependencies, not the system under test.
* Assert user-visible output and state transitions.
* Both test runners are required by `pnpm test` and `pnpm validate`.

````

---

# 15. 本次禁止修改

禁止修改：

```text id="zzf1uf"
后端协议
Legacy 签名算法
API Client 行为
Session Cleanup 业务
路由结构
登录业务
首页业务
OpenAPI Pipeline
UI 设计体系
````

本次只处理测试基础设施、Bootstrap 测试和阶段文档。

---

# 16. 必须执行的命令

```bash id="tgd98u"
pnpm install --frozen-lockfile

pnpm typecheck
pnpm lint

pnpm test:unit
pnpm test:react
pnpm test

pnpm doctor
pnpm validate
```

全部必须 PASS。

---

# 17. 提交前搜索检查

执行：

```bash id="rsg2uh"
rg "vi\\.mock\\('react'" src
rg "jest\\.mock\\('react'" src
rg "AppBootstrap\\(\\{" src/features/app-bootstrap/__tests__
rg "In a real Testing Library" src
rg "demonstrate single-flight" src
rg "Cannot execute useAppBootstrap" src docs/migration
```

期望：

```text id="acm4sn"
React 全量 Mock：0
直接调用 AppBootstrap：0
伪 Testing Library 注释：0
复制单飞逻辑：0
阶段文档中的旧限制描述：0
```

---

# 18. 编码 AI 完成后必须返回

```text id="sckgca"
## 安装依赖

- jest:
- jest-expo:
- react-test-renderer:
- @testing-library/react-native:

## 新增配置

- jest.config.cjs
- jest.setup.ts
- package.json scripts
- vitest exclude

## Hook 测试

- 自动启动：PASS
- Restore 成功：PASS
- Session 失败：PASS
- Profile 失败：PASS
- Splash 失败：PASS
- Retry：PASS
- Single-flight：PASS
- Unmount：PASS

## Component 测试

- Native Splash：PASS
- Retry Loading：PASS
- Error UI：PASS
- Retry Press：PASS
- Ready Children：PASS

## 删除旧测试

- useAppBootstrap.test.tsx：DELETED
- AppBootstrap.test.tsx：DELETED
- 伪单飞逻辑：0
- 直接组件函数调用：0

## 质量门禁

pnpm typecheck:
pnpm lint:
pnpm test:unit:
pnpm test:react:
pnpm test:
pnpm doctor:
pnpm validate:
GitHub Actions:

## 阶段状态

Project Scaffold:
UI Foundation:
Foundation Hardening:
Swagger/OpenAPI:
```

---

# 19. 本次验收标准

本次任务只有满足以下全部条件才算完成：

* [ ] Jest + jest-expo 配置完成
* [ ] React Native Testing Library 可真实 render
* [ ] `useAppBootstrap` 被 `renderHook` 真实执行
* [ ] AppBootstrap 被 Testing Library 真实渲染
* [ ] 旧伪测试已删除
* [ ] 测试没有复制生产逻辑
* [ ] Vitest 与 Jest 扫描范围互斥
* [ ] `pnpm test` 同时执行两类测试
* [ ] `pnpm validate` 同时执行两类测试
* [ ] GitHub Actions 同时执行两类测试
* [ ] 所有命令 PASS
* [ ] 阶段状态文档没有提前标记 Done

完成本任务后，Foundation 进入最终验证状态。

在 GitHub Actions、Dev UI production 和 Route Guard 真机检查通过后，才能正式标记：

```text id="hg0wh8"
Foundation Hardening — Done
```
