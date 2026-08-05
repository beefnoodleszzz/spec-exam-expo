---
status: archived
reviewed_commit: d080a143abb8a97d37b37eb9bc2da8f4cbc64b61
resolution_commits:
  - d19d301b723df36ebde6b04a8cc915014e010296
  - 3021d19d42b17e498c7a8b0794be7f56dd292771
outcome: jest-and-vitest-pass-locally
remaining:
  - github-actions-verification
  - dev-ui-production-verification
  - route-guard-device-verification
---

# spec-exam-expo Foundation 最终配置隔离与证据收尾工单

## 1. 审查范围

上一轮基线：

```text
d080a143abb8a97d37b37eb9bc2da8f4cbc64b61
```

本次包含两个提交：

```text
d19d301b723df36ebde6b04a8cc915014e010296
3021d19d42b17e498c7a8b0794be7f56dd292771
```

最终审查提交：

```text
3021d19d42b17e498c7a8b0794be7f56dd292771
```

---

# 2. 本次验收结论

以下内容已经正确完成，本轮禁止继续修改：

```text
useAppBootstrap 生产逻辑
AppBootstrap 生产逻辑
BootstrapErrorScreen 生产逻辑
useAppBootstrap.react.test.tsx
AppBootstrap.react.test.tsx
BootstrapErrorScreen.react.test.tsx
Vitest/Jest 双运行器结构
Jest transformIgnorePatterns
AsyncStorage 最小 Mock
SplashScreen 最小 Mock
pnpm-workspace.yaml 占位项清理
```

真实 React 测试已建立：

```text
pnpm test:unit
→ 61 tests

pnpm test:react
→ 17 tests

pnpm test
→ 78 tests
```

当前剩余任务只包括：

```text
1. 将 Jest 工具移出生产依赖
2. 隔离应用 TypeScript 类型与测试 TypeScript 类型
3. 修正文档中的 CI 虚假完成状态
4. 删除无意义 ids.md
5. 规范归档 review.md
6. 增加 Foundation 手工验证清单
```

不得再次调整 Jest 测试实现。

---

# 3. 修改 package.json：Jest 工具必须只存在于 devDependencies

## 当前错误

当前：

```json
"dependencies": {
  "jest-expo": "~57.0.3"
}
```

`jest-expo` 只用于测试，不应进入生产依赖集合。

## 直接执行

```bash
pnpm remove jest-expo
pnpm add -D jest-expo@~57.0.3
```

不要修改已经由 Expo 对齐的其他生产依赖。

## package.json 目标结构

测试依赖必须全部位于：

```json
{
  "devDependencies": {
    "@testing-library/react-native": "^12.4.0",
    "@types/jest": "^30.0.0",
    "@types/node": "^26.1.2",
    "jest": "^29.0.0",
    "jest-expo": "~57.0.3",
    "vitest": "^3.0.0"
  }
}
```

以下包不得出现在 `dependencies`：

```text
jest
jest-expo
@types/jest
@testing-library/react-native
vitest
```

---

# 4. 隔离 TypeScript 配置

## 当前错误

当前主应用 `tsconfig.json` 包含：

```json
"types": ["jest", "node"]
```

并且：

```json
"include": ["src/**/*.ts", "src/**/*.tsx", ...]
```

这会导致：

```text
Jest globals 注入所有生产代码
Node globals 注入 React Native 应用代码
process、Buffer、require 等 Node API 在业务代码中可能被错误接受
测试文件与生产代码共享同一类型环境
```

必须拆成：

```text
应用类型检查
测试类型检查
```

---

## 4.1 完整替换 tsconfig.json

将 `tsconfig.json` 替换为：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM"],
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitOverride": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.tsx",
    ".expo/types/**/*.d.ts",
    "expo-env.d.ts",
    "nativewind-env.d.ts",
    "app.config.ts"
  ],
  "exclude": [
    "node_modules",
    "scripts",
    "src/**/*.test.ts",
    "src/**/*.test.tsx",
    "src/**/*.react.test.ts",
    "src/**/*.react.test.tsx"
  ]
}
```

关键要求：

```text
删除 types: ["jest", "node"]
排除所有测试文件
```

---

## 4.2 新增 tsconfig.tests.json

创建：

```text
tsconfig.tests.json
```

完整内容：

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": true,
    "types": [
      "node",
      "jest",
      "vitest/globals"
    ]
  },
  "include": [
    "src/**/*.test.ts",
    "src/**/*.test.tsx",
    "src/**/*.react.test.ts",
    "src/**/*.react.test.tsx",
    "src/testing/**/*.ts",
    "jest.setup.ts",
    "vitest.config.ts"
  ],
  "exclude": [
    "node_modules",
    "dist",
    ".expo"
  ]
}
```

测试文件导入的生产模块会由 TypeScript 自动跟随解析，不需要将所有 `src` 重新加入 include。

---

## 4.3 修改 package.json scripts

将：

```json
"typecheck": "tsc --noEmit"
```

替换为：

```json
"typecheck:app": "tsc --noEmit -p tsconfig.json",
"typecheck:tests": "tsc --noEmit -p tsconfig.tests.json",
"typecheck": "pnpm typecheck:app && pnpm typecheck:tests"
```

最终相关脚本应为：

```json
{
  "scripts": {
    "typecheck:app": "tsc --noEmit -p tsconfig.json",
    "typecheck:tests": "tsc --noEmit -p tsconfig.tests.json",
    "typecheck": "pnpm typecheck:app && pnpm typecheck:tests",

    "test:unit": "vitest run",
    "test:react": "jest --runInBand",
    "test": "pnpm test:unit && pnpm test:react",

    "validate:base": "pnpm typecheck && pnpm lint && pnpm test && pnpm doctor",
    "validate": "pnpm validate:base"
  }
}
```

---

# 5. 更新 GitHub Actions：分别检查应用类型与测试类型

将 `.github/workflows/quality.yml` 中：

```yaml
- name: Typecheck
  run: pnpm typecheck
```

替换为：

```yaml
      - name: Typecheck App
        run: pnpm typecheck:app

      - name: Typecheck Tests
        run: pnpm typecheck:tests
```

测试步骤继续保留：

```yaml
      - name: Test (Vitest)
        run: pnpm test:unit

      - name: Test (Jest)
        run: pnpm test:react
```

最终完整 Workflow 内容必须为：

```yaml
name: Quality Gate CI

on:
  push:
    branches: [master, main]
  pull_request:
    branches: [master, main]

concurrency:
  group: quality-${{ github.ref }}
  cancel-in-progress: true

jobs:
  validate:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Enable Corepack
        run: corepack enable

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Typecheck App
        run: pnpm typecheck:app

      - name: Typecheck Tests
        run: pnpm typecheck:tests

      - name: Lint
        run: pnpm lint

      - name: Test (Vitest)
        run: pnpm test:unit

      - name: Test (Jest)
        run: pnpm test:react

      - name: Expo Doctor
        run: pnpm doctor
```

---

# 6. 修正文档中的 GitHub Actions 虚假状态

## 当前错误

`docs/migration/phase-status.md` 写着：

```text
GitHub Actions 实际通过 ✅
```

但当前 Commit 没有可查询到的 Workflow Run 或 Combined Status。

当前只能确认：

```text
GitHub Actions 已配置
```

不能确认：

```text
GitHub Actions 已通过
```

---

## 6.1 修改阶段总表

将当前：

```md
| 1 | Foundation Hardening | 🔄 In Review | ae1b47f | Hook tests being rewritten |
```

替换为：

```md
| 1 | Foundation Hardening | 🔄 Final Verification | 3021d19 | 61 Vitest + 17 Jest passing locally | CI and device verification pending |
```

不要继续引用：

```text
ae1b47f
Hook tests being rewritten
```

这些已经过期。

---

## 6.2 修改 CI 状态

将：

```md
**P1-3: CI 验证**
- Status: ✅ Ready for verification
```

改为：

```md
**P1-3: CI 验证**
- Status: ⏳ Configured, external run not yet verified
- Configuration: `.github/workflows/quality.yml`
- Local checks: PASS
- GitHub Actions run: Pending
```

---

## 6.3 修改 Quality Gate

将错误内容：

```md
- [x] GitHub Actions 实际通过
```

替换为：

```md
- [x] GitHub Actions 工作流已配置
- [ ] GitHub Actions 实际运行通过
```

保留：

```md
- [ ] Dev UI 生产行为已验证
```

新增：

```md
- [ ] Anonymous Route Guard 真机验证
- [ ] Authenticated Route Guard 真机验证
- [ ] Logout 后系统返回键验证
```

---

# 7. 删除无意义文件 docs/reviews/ids.md

## 当前问题

本次新增：

```text
docs/reviews/ids.md
```

内容只有 22 行随机哈希：

```text
073b108cc9e7a883d4223bd4
08bf7e47739bd9e530d8eb7f
...
```

它没有：

```text
标题
用途
字段说明
来源
对应关系
```

这属于误提交文件。

## 直接执行

```bash
rm docs/reviews/ids.md
```

不得保留或移动。

---

# 8. 规范 docs/reviews/review.md

## 当前问题

仓库再次存在：

```text
docs/reviews/review.md
```

通用文件名无法说明：

```text
审查日期
审查轮次
审查 Commit
整改 Commit
是否已失效
```

## 直接执行

将其重命名为：

```text
docs/reviews/2026-08-05-foundation-round-8.md
```

文件顶部必须增加：

```md
---
status: archived
reviewed_commit: d080a143abb8a97d37b37eb9bc2da8f4cbc64b61
resolution_commits:
  - d19d301b723df36ebde6b04a8cc915014e010296
  - 3021d19d42b17e498c7a8b0794be7f56dd292771
outcome: jest-and-vitest-pass-locally
remaining:
  - github-actions-verification
  - dev-ui-production-verification
  - route-guard-device-verification
---
```

完成后必须不存在：

```text
docs/reviews/review.md
```

---

# 9. 新增 Foundation 设备验证清单

创建：

```text
docs/testing/foundation-device-checklist.md
```

完整内容：

```md
# Foundation Device Verification

## Metadata

- Commit:
- Date:
- Tester:
- Platform:
- Device:
- Build profile:
- App variant:

## 1. Cold Start

### Anonymous

1. Clear application data.
2. Start the production build.
3. Confirm native Splash remains visible during bootstrap.
4. Confirm the sign-in screen appears.
5. Confirm there is no white screen.

Result: PASS / FAIL

### Authenticated

1. Prepare a valid persisted session.
2. Terminate the application.
3. Start the production build.
4. Confirm the protected application appears.
5. Confirm there is no sign-in screen flash.

Result: PASS / FAIL

## 2. Development UI Protection

### Anonymous

1. Open `/dev/ui` through a deep link.
2. Confirm the UI showcase is not displayed.
3. Confirm navigation reaches the public entry route.
4. Confirm no redirect loop occurs.

Result: PASS / FAIL

### Authenticated

1. Open `/dev/ui` through a deep link.
2. Confirm the UI showcase is not displayed.
3. Confirm navigation reaches the protected application.
4. Confirm no redirect loop occurs.

Result: PASS / FAIL

## 3. Route Guard

### Anonymous to Protected

1. Clear the session.
2. Open a protected deep link.
3. Confirm redirect to sign-in.
4. Confirm protected content never appears.

Result: PASS / FAIL

### Authenticated to Public

1. Restore a valid session.
2. Open the sign-in route.
3. Confirm redirect to the protected tabs.
4. Confirm sign-in content does not remain visible.

Result: PASS / FAIL

## 4. Logout Back Navigation

1. Sign in.
2. Open a protected detail screen.
3. Log out.
4. Confirm navigation reaches sign-in.
5. Press Android Back or perform iOS back gesture.
6. Confirm the protected screen cannot be restored.

Result: PASS / FAIL

## 5. Unauthorized Session

1. Sign in.
2. Trigger an HTTP 401 or envelope 401.
3. Confirm local session data is cleared.
4. Confirm navigation reaches sign-in.
5. Confirm system back does not restore protected content.

Result: PASS / FAIL

## Final Result

- Cold start:
- Dev UI:
- Route guard:
- Logout:
- Unauthorized:
- Overall: PASS / FAIL
```

本轮编码 AI 只创建清单，不得伪造 PASS。

真正运行后再填写。

---

# 10. 不得修改的内容

本轮禁止修改：

```text
useAppBootstrap.ts
AppBootstrap.tsx
BootstrapErrorScreen.tsx
所有 Bootstrap React 测试
HTTP Client
Session Cleanup
Route Guard 实现
UI 组件
OpenAPI 脚本
业务功能
```

本轮只是：

```text
依赖归类
TS 类型隔离
CI 类型步骤
文档真实性
误提交文件清理
设备验证清单
```

---

# 11. 必须执行的命令

```bash
pnpm install --frozen-lockfile

pnpm typecheck:app
pnpm typecheck:tests
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

# 12. 提交前搜索

```bash
rg '"jest-expo"' package.json
rg '"types": \["jest", "node"\]' tsconfig.json
rg "GitHub Actions 实际通过" docs
rg "Hook tests being rewritten" docs
find docs/reviews -maxdepth 1 -name "review.md"
test -f docs/reviews/ids.md && echo "ids.md still exists"
```

预期：

```text
jest-expo 只出现在 devDependencies
主 tsconfig 不包含 jest/node types
虚假 CI 通过描述：0
过期 Hook 描述：0
通用 review.md：0
ids.md：不存在
```

---

# 13. 编码 AI 完成后回报

```text
## 依赖分类

jest-expo:
jest:
@testing-library/react-native:
vitest:

## TypeScript 隔离

tsconfig.json:
tsconfig.tests.json:
typecheck:app:
typecheck:tests:

## 文档修复

phase-status latest commit:
GitHub Actions status wording:
ids.md:
review archive:
device checklist:

## 质量门禁

pnpm typecheck:app:
pnpm typecheck:tests:
pnpm typecheck:
pnpm lint:
pnpm test:unit:
pnpm test:react:
pnpm test:
pnpm doctor:
pnpm validate:

## 外部验证

GitHub Actions:
Dev UI production:
Route Guard device:
Logout back navigation:

## 阶段状态

Project Scaffold:
UI Foundation:
Foundation Hardening:
Swagger/OpenAPI:
```

---

# 14. 本轮完成后的阶段状态

完成本代码工单并且本地门禁全部通过后：

```text
Project Scaffold — Done
UI Foundation — Done
Foundation Hardening — Final Verification
Swagger/OpenAPI Pipeline — Not Started
```

只有收到以下真实证据后：

```text
GitHub Actions PASS
Dev UI production PASS
Route Guard device PASS
Logout back navigation PASS
```

才能标记：

```text
Foundation Hardening — Done
```

然后才能进入：

```text
Swagger / OpenAPI Pipeline
```
