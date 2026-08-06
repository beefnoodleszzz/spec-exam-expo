# Legacy User Center Mapping

## 1. 接口映射

| 业务 | 旧项目 API | 新项目 Generated API |
|---|---|---|
| 用户详情 | `examV2/app/user/detail` | `apiExamV2AppUserDetailGet` |
| 我的模块详情(含统计) | `examV2/app/user/userDataDetail` | `apiExamV2AppUserUserDataDetailGet` |
| 修改资料 | `examV2/app/user/updateUser` | `apiExamV2AppUserUpdateUserPost` |
| 学习统计(题库统计) | `examV2/app/subject/getSubjectsStatics` | `apiExamV2AppSubjectGetSubjectsStaticsPost` |
| 成绩单历史 | `examV2/app/subject/getGradeHistory` | `apiExamV2AppSubjectGetGradeHistoryGet` |
| 提交反馈 | H5 (`#/SpecialTrade/feedback`) / `examV2/app/insertFeedBack` | `apiExamV2AppInsertFeedBackPost` |
| 注销账号 | 无明确前端原生调用(旧项目跳转 H5 退出或走 loginService.logout) / `examV2/app/user/deleteUser` | `apiExamV2AppUserDeleteUserGet` |

## 2. 协议地址

| 业务 | 旧项目静态配置 |
|---|---|
| 用户协议 | `pages/specwork_user_agreement.html?title=特种作业` |
| 隐私政策 | `pages/specwork_private_policy.html?title=特种作业` |

## 3. 页面入口与跳转

- **个人中心首页** (`MineComponent` -> `/(protected)/(tabs)/me`)
  - 学习统计区域 (做题数、正确率等，通过 `userDataDetail` 获取)
  - 我的科目 (切换考试类型 -> `/(protected)/exam-profile`)
  - 我的钱包 / 购买记录 (忽略)
- **用户资料修改** (`UserInfoComponent` -> `/(protected)/user/profile`)
- **设置** (`SettingComponent` -> `/(protected)/settings/index`)
  - 用户协议 -> Webview
  - 隐私政策 -> Webview
  - 意见反馈 -> `/(protected)/settings/feedback` (旧项目为 H5，新项目原生实现)
  - 退出登录 -> Auth 清理
  - 清理缓存 -> 清除 Storage
- **错题与收藏**
  - 跳转至刷题页的错题模式/收藏模式 (`/(protected)/questions?mode=wrong|favorite`)
  - 旧项目通过 setting 跳转 logout。新项目中 Delete Account UI 已经被隐藏并移除，因为其安全性合约未被验证。
