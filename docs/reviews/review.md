# spec-exam-expo Jest 运行链路修复工单

## 1. 本次任务目标

当前提交：

```text
d080a143abb8a97d37b37eb9bc2da8f4cbc64b61
```

已经完成：

* Jest 测试文件真实使用 `renderHook`
* AppBootstrap 测试真实使用 `render`
* 旧伪测试已删除
* Vitest 与 Jest 脚本已经拆分

但 `pnpm test:react` 尚未通过。

本次只解决：

```text
1. 清理错误或不必要的测试依赖
2. 修正 pnpm workspace 配置
3. 按 Expo SDK 57 官方方式重新安装 Jest 依赖
4. 简化 Jest Setup
5. 增加 pnpm 专用 transformIgnorePatterns
6. 跑通全部 React 测试
7. 将 React 测试加入 CI 的独立步骤
```

不得再新增 Bootstrap 测试场景，不得修改 Bootstrap 生产代码。

---

# 2. 当前确定存在的问题

## 2.1 不应安装 `react-test-renderer`

当前 `package.json` 包含：

```json
"react-test-renderer": "^19.2.8"
```

项目 React 是：

```json
"react": "19.2.3"
```

不仅版本不一致，而且 Expo 对 React 19 的当前测试说明明确要求移除 `react-test-renderer`，直接使用 `@testing-library/react-native`。

必须删除。

---

## 2.2 不应为了 Jest 安装 `react-native-worklets-core`

当前新增：

```json
"react-native-worklets-core": "^1.6.3"
```

该库不是 Jest Expo 基础设施依赖，也不是当前 Bootstrap 测试所需依赖。

它会扩大：

* Babel 插件解析范围
* 原生模块依赖
* Expo Doctor 检查范围
* pnpm Build Script 管理范围

必须删除，除非生产代码真实使用该库。

当前任务中直接删除。

---

## 2.3 `babel-jest` 不应手工固定为 Jest 30 版本

当前新增：

```json
"babel-jest": "^30.4.1",
"jest": "^30.4.2"
```

但 `jest-expo` 应负责提供与 Expo SDK 对应的 Jest/Babel 配置。

不得自行组合：

```text
jest 30
babel-jest 30
jest-expo 57
```

让 `expo install` 决定兼容版本。

---

## 2.4 `pnpm-workspace.yaml` 含非法占位值

当前文件：

```yaml
allowBuilds:
  '@scarf/scarf': true
  esbuild: true
  unrs-resolver: set this to true or false
```

其中：

```yaml
unrs-resolver: set this to true or false
```

是未处理的占位文本，不是合法布尔配置。

必须删除该行。

---

## 2.5 CI 没有独立展示 React 测试

当前 CI 仍然只有：

```yaml
- name: Test
  run: pnpm test
```

虽然脚本理论上会运行两个测试器，但失败时无法快速判断是 Vitest 还是 Jest。

必须拆分。

---

# 3. 第一步：清理依赖

执行：

```bash
pnpm remove \
  react-test-renderer \
  react-native-worklets-core \
  babel-jest \
  jest \
  jest-expo \
  @types/jest \
  @testing-library/react-native
```

然后严格使用 Expo 安装兼容版本：

```bash
pnpm exec expo install \
  jest-expo \
  jest \
  @types/jest \
  @testing-library/react-native \
  -- --dev
```

不要重新安装：

```text
react-test-renderer
babel-jest
react-native-worklets-core
jsdom
happy-dom
```

安装后，`package.json` 中以下包必须位于 `devDependencies`：

```text
jest
jest-expo
@types/jest
@testing-library/react-native
```

`jest-expo` 不应放在 `dependencies`。

---

# 4. package.json 目标状态

不要覆盖其他业务依赖。

测试相关部分应整理成：

```json
{
  "scripts": {
    "test:unit": "vitest run",
    "test:react": "jest --config jest.config.cjs --runInBand",
    "test": "pnpm test:unit && pnpm test:react",
    "test:unit:watch": "vitest",
    "test:react:watch": "jest --config jest.config.cjs --watch",
    "validate:base": "pnpm typecheck && pnpm lint && pnpm test && pnpm doctor",
    "validate": "pnpm validate:base"
  },
  "devDependencies": {
    "@testing-library/react-native": "<expo install 产生的版本>",
    "@types/jest": "<expo install 产生的版本>",
    "jest": "<expo install 产生的版本>",
    "jest-expo": "<expo install 产生的版本>"
  }
}
```

确认以下依赖不存在：

```text
react-test-renderer
react-native-worklets-core
babel-jest
```

---

# 5. 修复 pnpm-workspace.yaml

将文件完整替换为：

```yaml
allowBuilds:
  '@scarf/scarf': true
  esbuild: true
```

不要保留：

```yaml
unrs-resolver: set this to true or false
```

如果重新安装后 pnpm 明确提示某个包需要批准 Build Script，先确认该包确实需要原生构建，再加入布尔值。

不得复制 pnpm 自动提示中的占位文本。

---

# 6. 替换 jest.config.cjs

将 `jest.config.cjs` 完整替换为：

```js
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

  transformIgnorePatterns: [
    'node_modules/(?!(.pnpm|(jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|expo-router|@react-navigation/.*|react-native-svg|nativewind))',
  ],

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

这里必须保留 pnpm 的：

```text
.pnpm
```

兼容规则。

不要添加：

```js
testEnvironment: 'jsdom'
```

不要手工声明 Babel Transform，先使用 `jest-expo` preset。

---

# 7. 简化 jest.setup.ts

当前 Setup 中包含：

```ts
jest.mock('react-native-reanimated', ...)
jest.mock(
  'react-native/Libraries/Animated/NativeAnimatedHelper'
)
```

这些不是当前 Bootstrap 测试必须依赖的 Mock，而且 `NativeAnimatedHelper` 在不同 React Native 版本中路径会变化。

将 `jest.setup.ts` 完整替换为：

```ts
jest.mock('expo-splash-screen', () => ({
  hideAsync: jest.fn(),
  preventAutoHideAsync: jest.fn(),
}))
```

先让 `jest-expo` 负责 Expo 和 React Native 的基础 Mock。

只有在真实测试日志明确指出某个原生模块无法加载时，才添加该模块的最小 Mock。

禁止预防性 Mock 大量模块。

---

# 8. 保留现有真实测试，不要重写

以下文件已经采用了正确测试方式，应保留：

```text
src/features/app-bootstrap/__tests__/
├── useAppBootstrap.react.test.tsx
├── AppBootstrap.react.test.tsx
└── BootstrapErrorScreen.react.test.tsx
```

`useAppBootstrap.react.test.tsx` 已经真实调用：

```ts
renderHook(() => useAppBootstrap())
```

并覆盖成功、Restore 失败、Splash 失败、Retry、Single Flight 和 Unmount。

`AppBootstrap.react.test.tsx` 已经真实调用 Testing Library `render()` 并断言用户界面。

本轮不得为了修复 Jest 配置，将它们降级为：

```text
直接调用组件函数
Mock React
手工模拟 Hook
依赖调用测试
```

---

# 9. 修正 CI

将 `.github/workflows/quality.yml` 的测试部分替换为：

```yaml
      - name: Typecheck
        run: pnpm typecheck

      - name: Lint
        run: pnpm lint

      - name: Vitest Unit Tests
        run: pnpm test:unit

      - name: Jest React Native Tests
        run: pnpm test:react

      - name: Expo Doctor
        run: pnpm doctor
```

删除旧的：

```yaml
      - name: Test
        run: pnpm test
```

本地 `pnpm test` 仍然保留，用于一次运行两套测试。

---

# 10. 修正 Vitest 扫描范围

确认 `vitest.config.ts` 明确排除：

```ts
exclude: [
  'src/**/*.react.test.ts',
  'src/**/*.react.test.tsx',
  'node_modules/**',
  'dist/**',
  '.expo/**',
]
```

同时不要把 React 测试文件改回普通 `.test.tsx`。

规则必须保持：

```text
*.test.ts / *.test.tsx
→ Vitest

*.react.test.ts / *.react.test.tsx
→ Jest
```

---

# 11. 重新生成锁文件

依赖清理后执行：

```bash
rm -rf node_modules
pnpm install
```

不要手工修改 `pnpm-lock.yaml`。

安装完成后执行：

```bash
pnpm exec expo install --check
```

如果输出依赖版本不匹配，执行：

```bash
pnpm exec expo install --fix
```

然后再次：

```bash
pnpm install
```

---

# 12. Jest 失败时的处理顺序

执行：

```bash
pnpm test:react
```

如果失败，不得立即安装新包。

按以下顺序处理。

## 12.1 如果提示找不到 Babel Preset

先执行：

```bash
pnpm why babel-preset-expo
pnpm why jest-expo
pnpm why jest
```

确认 `babel-preset-expo` 已由 Expo/Jest Expo 依赖提供。

如果没有：

```bash
pnpm exec expo install babel-preset-expo -- --dev
```

只有实际缺失时才安装。

## 12.2 如果提示无法解析 ESM node_modules

不要安装 Babel 插件。

将报错包名加入 `transformIgnorePatterns` 白名单。

例如报错包为：

```text
react-native-foo
```

则增加：

```text
|react-native-foo
```

## 12.3 如果提示某个原生模块不存在

在 `jest.setup.ts` 对该具体模块做最小 Mock。

禁止重新引入：

```text
react-test-renderer
react-native-worklets-core
jsdom
```

## 12.4 如果 Testing Library 报 React 19 Renderer 问题

先确认：

```bash
pnpm why react-test-renderer
```

结果应为：

```text
没有直接安装
```

如果第三方测试包间接依赖旧 Renderer，升级 Testing Library 到 Expo 推荐版本，不要手工安装 Renderer。

---

# 13. 修正文档

## 13.1 docs/decisions/jest-integration.md

必须记录最终事实：

```md
# Jest Integration Decision

## Decision

- Vitest runs pure TypeScript tests.
- Jest with jest-expo runs React Native hooks and components.
- React Native Testing Library is used without react-test-renderer.
- Jest dependencies are installed through `expo install`.
- React tests use `*.react.test.tsx`.
- Both runners are mandatory in CI.

## Rejected

- Mocking React
- Calling components directly
- jsdom for React Native tests
- react-test-renderer on React 19
- Installing Babel plugins without a concrete error
```

## 13.2 阶段状态

本次提交完成但 Jest 未通过前：

```text
Foundation Hardening — Blocked
```

只有以下全部通过后才能改为：

```text
Foundation Hardening — In Review
```

条件：

```text
pnpm test:unit PASS
pnpm test:react PASS
pnpm test PASS
pnpm validate PASS
GitHub Actions PASS
```

Dev UI 和 Route Guard 真机验证完成后才能改为：

```text
Foundation Hardening — Done
```

---

# 14. 必须执行的命令

严格按顺序执行：

```bash
pnpm remove \
  react-test-renderer \
  react-native-worklets-core \
  babel-jest \
  jest \
  jest-expo \
  @types/jest \
  @testing-library/react-native

pnpm exec expo install \
  jest-expo \
  jest \
  @types/jest \
  @testing-library/react-native \
  -- --dev

rm -rf node_modules
pnpm install

pnpm exec expo install --check

pnpm typecheck
pnpm lint
pnpm test:unit
pnpm test:react
pnpm test
pnpm doctor
pnpm validate
```

---

# 15. 提交前搜索检查

执行：

```bash
rg "react-test-renderer" package.json pnpm-lock.yaml
rg "react-native-worklets-core" package.json pnpm-lock.yaml
rg "\"babel-jest\"" package.json
rg "unrs-resolver: set this" .
rg "AppBootstrap\\(\\{" src/features/app-bootstrap/__tests__
rg "mock\\('react'" src/features/app-bootstrap/__tests__
```

预期：

```text
react-test-renderer 直接依赖：0
react-native-worklets-core 直接依赖：0
babel-jest 直接依赖：0
pnpm 占位配置：0
直接调用 AppBootstrap：0
Mock React：0
```

锁文件可能包含某些包的间接依赖名称，最终以：

```bash
pnpm why <package>
```

判断是否为项目直接依赖。

---

# 16. 编码 AI 完成后必须回报

```text
## 依赖清理

react-test-renderer: REMOVED
react-native-worklets-core: REMOVED
babel-jest direct dependency: REMOVED
jest-expo location: devDependencies
Testing Library installed by Expo: YES

## pnpm 配置

非法 allowBuilds 占位项: REMOVED

## Jest

pnpm test:react: PASS/FAIL
测试套件数量:
测试数量:
实际失败日志:

## Vitest

pnpm test:unit: PASS/FAIL

## 完整门禁

pnpm typecheck:
pnpm lint:
pnpm test:
pnpm doctor:
pnpm validate:
GitHub Actions:

## 搜索检查

Mock React:
直接调用组件:
旧伪测试:
react-test-renderer:
react-native-worklets-core:
babel-jest direct dependency:

## 阶段状态

Project Scaffold:
UI Foundation:
Foundation Hardening:
Swagger/OpenAPI:
```

如果 `pnpm test:react` 仍然失败，必须附上**完整首个错误堆栈和对应包名**，不得再提交“配置进行中”状态。
