# Feature Inventory — Phase 0

Source: `spec-exam-pure` (RN 0.66 legacy app)

## Decision Legend

- ✅ Keep — Migrate as-is with behavior preserved
- 🔧 Optimize — Keep but improve UX/implementation  
- 🔀 Merge — Consolidate with another feature
- 🗑️ Remove — Drop entirely
- ❓ Confirm — Needs product decision

---

## Auth & Onboarding

| Feature | Old Route/Component | Decision | Notes |
|---------|---------------------|----------|-------|
| 隐私协议 | UserAgreementComponent | ✅ Keep | Show on first launch |
| 首次配置 | Splash → ChooseCity/SubjectChoose | ✅ Keep | Onboarding flow |
| 考试项目选择 | RegisterForExamination | ✅ Keep | |
| 地区选择 | CityComponent | ✅ Keep | Uses vehicleComponent API |
| 科目选择 | SubjectChoose, ChooseTheSubjectComponent | 🔀 Merge | Two routes doing similar things |
| 短信登录 | LoginComponent | ✅ Keep | PRIMARY |
| 微信登录 | LoginComponent | ✅ Keep | Native SDK required |
| 一键登录 | LoginComponent | ✅ Keep | Aliyun native SDK |
| 邀请码 | InputInviteCodeComponent | ✅ Keep | Post-login step |

## Study — Practice

| Feature | Old Route/Component | Decision | Notes |
|---------|---------------------|----------|-------|
| 顺序练习 | DoExamMain (examType: sequential) | ✅ Keep | |
| 快速练习 | QuickStartComponent | ✅ Keep | Random questions |
| 套题练习 | OrderToPracticeComponent | ✅ Keep | Paper-based |
| 模拟考试 | SimulationTestComponent | ✅ Keep | Timed, absolute countdown |
| 答题进度 | DoExamMain | 🔧 Optimize | Better snapshot recovery |
| 收藏 | DoExamMain (inline) | ✅ Keep | Optimistic update |
| 错题集 | WrongTopicSetComponent, WrongTopicCollectionComponent | 🔀 Merge | Same data, different views |
| 题目笔记 | DoExamMain + note API | ✅ Keep | |
| 成绩单 | TheTranscriptComponent | ✅ Keep | |
| 历史成绩 | ExamScoreComponent | ✅ Keep | |
| 学习数据 | MineComponent (stats section) | ✅ Keep | |

## Search

| Feature | Old Route/Component | Decision | Notes |
|---------|---------------------|----------|-------|
| 搜题 | SearchComponent | ✅ Keep | ES search API |
| 搜索历史 | SearchComponent (local) | ✅ Keep | AsyncStorage |

## Membership & Payment

| Feature | Old Route/Component | Decision | Notes |
|---------|---------------------|----------|-------|
| 会员开通 | MyVipComponent | ✅ Keep | WeChat Pay |
| 微信支付 | MyVipComponent | ✅ Keep | Must verify via order query |
| 购买记录 | BuyHistoryComponent | ✅ Keep | |
| 邀请用户 | InviteUserComponent | ✅ Keep | |

## Wallet

| Feature | Old Route/Component | Decision | Notes |
|---------|---------------------|----------|-------|
| 钱包 | MyWalletComponent | ✅ Keep | |
| 收入记录 | MyWalletComponent | ✅ Keep | |
| 提现 | WithdrawalComponent | ✅ Keep | High-risk mutation |

## Profile & Settings

| Feature | Old Route/Component | Decision | Notes |
|---------|---------------------|----------|-------|
| 用户资料 | UserInfoComponent | ✅ Keep | |
| 修改昵称 | ChangeNicknameComponent | ✅ Keep | |
| 修改手机号 | ChangePhoneComponent | ✅ Keep | |
| 修改性别 | ChangeSexComponent | ✅ Keep | |
| 设置 | SettingComponent | ✅ Keep | |
| 关于 | AboutComponent | ✅ Keep | |
| 退出登录 | SettingComponent | ✅ Keep | |

## Content / WebView

| Feature | Old Route/Component | Decision | Notes |
|---------|---------------------|----------|-------|
| WebView | SimpleWebview | ✅ Keep | Domain whitelist required |
| 用户协议 | SimpleWebview | ✅ Keep | |
| 隐私政策 | SimpleWebview | ✅ Keep | |
| 考试须知 | MoreComponent | ✅ Keep | |
| 资讯 | MoreComponent | ✅ Keep | |

## Dead / Removed Features

| Feature | Old Route/Component | Decision | Notes |
|---------|---------------------|----------|-------|
| MyIdeaComponent | MyIdeaComponent | 🗑️ Remove | Already hidden in old app |
| SetTimeComponent | SetTimeComponent | ❓ Confirm | Unclear business purpose |
| Home1/Home2 duplicates | app.routes.tsx | 🗑️ Remove | Route duplication artifact |
| CodePush | — | 🗑️ Remove | Replace with EAS Update |
| AppCenter | — | 🗑️ Remove | Replace with Sentry |
| Exit App | BackHandler exit | 🗑️ Remove | Not needed |
