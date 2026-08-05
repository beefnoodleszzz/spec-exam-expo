# Feature Migration Matrix

Tracks migration status of every feature from `spec-exam-pure` to `spec-exam-expo`.

## Status Legend

| Status | Meaning |
|--------|---------|
| Not Started | Not yet analyzed |
| Analyzed | Old code reviewed, new design decided |
| Contracted | Swagger endpoint identified, DTO adapter designed |
| Implementing | Active development |
| Testing | Code done, tests running |
| Validated | Tests pass, device verified |
| Released | In production |

---

## Auth

| Feature | Old Route | Swagger Endpoint | New Feature | Adapter | Tests | Android | iOS | Status |
|---------|-----------|-----------------|-------------|---------|-------|---------|-----|--------|
| 短信登录 | LoginComponent | `login/shortMessage` | auth | Pending | Pending | Todo | Todo | Analyzed |
| 微信登录 | LoginComponent | `login` | auth | Pending | Pending | Todo | Todo | Analyzed |
| 一键登录 | LoginComponent | `login/oneClickLogin` | auth | Pending | Pending | Todo | Todo | Analyzed |
| 邀请码 | InputInviteCodeComponent | `user/checkInviteCode` | auth | Pending | Pending | Todo | Todo | Analyzed |
| 退出登录 | SettingComponent | — (client only) | auth | N/A | Pending | Todo | Todo | Analyzed |

## Onboarding

| Feature | Old Route | Swagger Endpoint | New Feature | Adapter | Tests | Android | iOS | Status |
|---------|-----------|-----------------|-------------|---------|-------|---------|-----|--------|
| 隐私协议 | UserAgreementComponent | — | privacy-consent | N/A | Pending | Todo | Todo | Analyzed |
| 考试项目选择 | RegisterForExamination | `subject/getExamType` | exam-profile | Pending | Pending | Todo | Todo | Analyzed |
| 地区选择 | CityComponent | `vehicleComponent/queryAreaInfoList` | exam-profile | Pending | Pending | Todo | Todo | Analyzed |
| 科目选择 | SubjectChoose | `order/myCourse` | exam-profile | Pending | Pending | Todo | Todo | Analyzed |

## Home

| Feature | Old Route | Swagger Endpoint | New Feature | Adapter | Tests | Android | iOS | Status |
|---------|-----------|-----------------|-------------|---------|-------|---------|-----|--------|
| 首页 | HomeComponent | `app/home` | home | Pending | Pending | Todo | Todo | Analyzed |

## Practice

| Feature | Old Route | Swagger Endpoint | New Feature | Adapter | Tests | Android | iOS | Status |
|---------|-----------|-----------------|-------------|---------|-------|---------|-----|--------|
| 顺序练习 | DoExamMain | `subject/getSubjects` | practice-session | Pending | Pending | Todo | Todo | Analyzed |
| 快速练习 | QuickStartComponent | `subject/getSubjects` | practice-session | Pending | Pending | Todo | Todo | Analyzed |
| 套题练习 | OrderToPracticeComponent | `subject/getSubjectsByGroup` | practice-session | Pending | Pending | Todo | Todo | Analyzed |
| 答题提交 | DoExamMain | `subject/submitExerciseRecord` | practice-session | Pending | Pending | Todo | Todo | Analyzed |
| 收藏 | DoExamMain (inline) | TBD | question-bank | Pending | Pending | Todo | Todo | Analyzed |
| 错题集 | WrongTopicSet | `subject/getSubjectsTypeData` | wrong-questions | Pending | Pending | Todo | Todo | Analyzed |
| 题目笔记 | DoExamMain | `note/insertNote` | notes | Pending | Pending | Todo | Todo | Analyzed |

## Simulation Exam

| Feature | Old Route | Swagger Endpoint | New Feature | Adapter | Tests | Android | iOS | Status |
|---------|-----------|-----------------|-------------|---------|-------|---------|-----|--------|
| 模拟考试 | SimulationTestComponent | TBD (simulation API) | simulation-exam | Pending | Pending | Todo | Todo | Analyzed |
| 交卷 | SimulationTestComponent | TBD | simulation-exam | Pending | Pending | Todo | Todo | Analyzed |
| 成绩单 | TheTranscriptComponent | TBD | transcript | Pending | Pending | Todo | Todo | Analyzed |
| 历史成绩 | ExamScoreComponent | TBD | transcript | Pending | Pending | Todo | Todo | Analyzed |

## Search

| Feature | Old Route | Swagger Endpoint | New Feature | Adapter | Tests | Android | iOS | Status |
|---------|-----------|-----------------|-------------|---------|-------|---------|-----|--------|
| 搜题 | SearchComponent | `search/queryEsSubjectList` | question-search | Pending | Pending | Todo | Todo | Analyzed |

## Membership & Payment

| Feature | Old Route | Swagger Endpoint | New Feature | Adapter | Tests | Android | iOS | Status |
|---------|-----------|-----------------|-------------|---------|-------|---------|-----|--------|
| 会员开通 | MyVipComponent | TBD (pay API) | membership | Pending | Pending | Todo | Todo | Analyzed |
| 微信支付 | MyVipComponent | TBD (pay API) | payment | Pending | Pending | Todo | Todo | Analyzed |
| 购买记录 | BuyHistoryComponent | TBD | membership | Pending | Pending | Todo | Todo | Analyzed |
| 邀请用户 | InviteUserComponent | TBD | invitation | Pending | Pending | Todo | Todo | Analyzed |

## Wallet

| Feature | Old Route | Swagger Endpoint | New Feature | Adapter | Tests | Android | iOS | Status |
|---------|-----------|-----------------|-------------|---------|-------|---------|-----|--------|
| 钱包 | MyWalletComponent | TBD (wallet API) | wallet | Pending | Pending | Todo | Todo | Analyzed |
| 提现 | WithdrawalComponent | TBD | wallet | Pending | Pending | Todo | Todo | Analyzed |

## Profile

| Feature | Old Route | Swagger Endpoint | New Feature | Adapter | Tests | Android | iOS | Status |
|---------|-----------|-----------------|-------------|---------|-------|---------|-----|--------|
| 用户资料 | UserInfoComponent | `user/detail` | profile | Pending | Pending | Todo | Todo | Analyzed |
| 修改昵称 | ChangeNicknameComponent | TBD | profile | Pending | Pending | Todo | Todo | Analyzed |
| 修改手机号 | ChangePhoneComponent | TBD | profile | Pending | Pending | Todo | Todo | Analyzed |
| 设置 | SettingComponent | — | profile | N/A | Pending | Todo | Todo | Analyzed |
| 关于 | AboutComponent | — | profile | N/A | N/A | Todo | Todo | Analyzed |

## Content / WebView

| Feature | Old Route | Swagger Endpoint | New Feature | Adapter | Tests | Android | iOS | Status |
|---------|-----------|-----------------|-------------|---------|-------|---------|-----|--------|
| WebView | SimpleWebview | — | web/[page] | N/A | N/A | Todo | Todo | Analyzed |
