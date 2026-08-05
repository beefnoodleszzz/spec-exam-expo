# Legacy API Service Inventory — Phase 0

## Base URL

- Production: `https://iservice.enchunsi.com/ecsmotojk/api/`
- Dev/KZT: `https://ifch.i-cbao.com/ecsmotojk/api/`
- Map: `https://ifch.i-cbao.com/vcomponent/api/`

## Request Headers (Must Preserve)

| Header | Source | Description |
|--------|--------|-------------|
| `examtoken` | SecureStore → memory | Auth token |
| `examTypeId` | appStore.currentExamProfile | Current exam type |
| `random1` | Math.random() * 100 | Signature input |
| `random2` | Math.random() * 100 | Signature input |
| `checkResult` | FuckingDSign(r1, r2, key) | Signature result |

## Auth Endpoints (`examV2/app/login/...`)

| Method | Path | Description | Old Service |
|--------|------|-------------|-------------|
| GET | `examV2/app/login` | 微信登录 | LoginService.getUserInfo |
| POST | `examV2/app/login/shortMessage` | 短信登录 | LoginService.getUserLogin |
| GET | `examV2/app/login/sendShortMessage` | 发送短信验证码 | LoginService.getSendShortMessage |
| POST | `examV2/app/login/oneClickLogin` | 一键登录 | LoginService.getPhoneOneClickLogin |
| GET | `examV2/app/login/getUserInfoByToken` | 获取用户信息 | LoginService.getUserDetail |
| GET | `examV2/app/user/userDataDetail` | 我的模块详情 | LoginService.getUserDataDetailInfo |
| GET | `examV2/app/user/detail` | 用户详情 | LoginService.getUserDetail |
| GET | `examV2/app/user/checkInviteCode` | 验证邀请码 | LoginService.checkInviteCode |
| GET | `examV2/versionVerify` | 版本号 | LoginService.versionVerify |
| GET | `examV2/app/login/getUserTerminal` | 用户平台信息 | SubjectService.getUserTerminal |

## Subject/Question Endpoints (`examV2/app/subject/...`)

| Method | Path | Description | Old Service |
|--------|------|-------------|-------------|
| POST | `examV2/app/subject/getSubjects` | 获取练习题目 | SubjectService.getSubjects |
| GET | `examV2/app/subject/getExamType` | 获取科目及子科目 | SubjectService.getExamType |
| GET | `examV2/app/subject/getSubjectGroup` | 获取套题列表 | SubjectService.getSubjectGroup |
| POST | `examV2/app/subject/getSubjectsByGroup` | 获取套题题目 | SubjectService.getSubjectsByGroup |
| PUT | `examV2/app/subject/submitExerciseRecord` | 提交答题记录 | SubjectService.submitExerciseRecord |
| GET | `examV2/app/subject/getSubjectsTypeData` | 易错题类型数量 | SubjectService.getSubjectsTypeData |

## Order/Course Endpoints (`examV2/app/order/...`)

| Method | Path | Description | Old Service |
|--------|------|-------------|-------------|
| GET | `examV2/app/order/myCourse` | 我的科目列表 | SubjectService.myCourse |
| GET | `examV2/app/order/changeCourse` | 切换科目 | SubjectService.changeCourse |
| POST | `examV2/app/order/insertUserOrder` | 新增科目订单 | SubjectService.insertUserOrder |

## Home

| Method | Path | Description | Old Service |
|--------|------|-------------|-------------|
| GET | `examV2/app/home` | 首页数据 | SubjectService.home |

## Note Endpoints (`examV2/app/note/...`)

| Method | Path | Description | Old Service |
|--------|------|-------------|-------------|
| POST | `examV2/app/note/queryNotePagedList` | 题目笔记列表 | SubjectService.queryNotePagedList |
| POST | `examV2/app/note/insertNote` | 新增笔记 | SubjectService.insertNote |
| GET | `examV2/app/note/insertNoteLike` | 点赞 | SubjectService.insertNoteLike |
| GET | `examV2/app/note/cancelNoteLike` | 取消点赞 | SubjectService.cancelNoteLike |

## Search

| Method | Path | Description | Old Service |
|--------|------|-------------|-------------|
| GET | `examV2/app/search/queryEsSubjectList` | 搜题 | SubjectService.queryEsSubjectList |

## Mine/Stats Endpoints

From `mine.service.ts` (needs inspection):
| Method | Path | Description |
|--------|------|-------------|
| TBD | TBD | 学习统计 |

## Pay Endpoints

From `pay.service.ts` (needs inspection):
| Method | Path | Description |
|--------|------|-------------|
| TBD | TBD | 创建订单, 查询订单 |

## Simulation Endpoints

From `simulation-test.service.ts` (needs inspection):
| Method | Path | Description |
|--------|------|-------------|
| TBD | TBD | 模拟考试, 提交 |

## Wallet Endpoints

From `my-wallet.service.ts` (needs inspection):
| Method | Path | Description |
|--------|------|-------------|
| TBD | TBD | 钱包余额, 提现 |

## Map Endpoint (different host)

| Method | Path | Host | Description |
|--------|------|------|-------------|
| GET | `vehicleComponent/queryAreaInfoList` | MAP_BASE_URL | 获取地区列表 |

## Response Envelope

All API responses use this envelope:
```json
{
  "status": true,
  "data": <T>,
  "total": 100,
  "code": 0,
  "StatusCode": 0,
  "message": "success"
}
```

Business error: `status: false`, `code: 401` triggers logout.

## Legacy ExamType Constants

From `shared/constant/baseContent`:
```
CHILD_TYPE.RANDOM_EXAM = 快速练习 (shuffle questions)
```

## System Parameter

Login requests include `system: 3` (identifies the platform/client).
