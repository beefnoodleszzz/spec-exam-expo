# Legacy Home Mapping

## 接口 (Endpoints)
- 考试类型列表: `examV2/app/subject/getExamType` (GET)
- 切换/选择考试类型: `examV2/app/order/insertUserOrder` (POST) - Payload `{examTypeId: string}`
- 首页数据: `examV2/app/home` (GET)
- 高频考题/套题列表: `examV2/app/subject/getSubjectGroup` (GET)

## 字段 (Fields)
- `examTypeId`: 标识选定的考试类型（从 `GetExamTypeResType` 中的 `id` 获取）。
- 首页统计 (`HomeResType`):
  - `examDay` (考试倒计时)
  - `totalSubject` (总题数)
  - `totalAnswer` (已答题数)
  - `answerRate` (答题率)
  - `informationList` (热门资讯)

## 调用顺序 (Call Order)
1. App 启动，进入首页，检查持久化的考试类型缓存。
2. **有缓存**: 发起 `home` 和 `getSubjectGroup` 接口请求展示首页。
3. **无缓存**: 跳转到 `SubjectChoose` (选择考试类型页) -> 调用 `getExamType` 获取类型列表 -> 用户点击选择 -> 调用 `insertUserOrder` -> 触发全局持久化 -> 返回首页并刷新。

## 持久化 Key (Persistence Key)
- `REGISTER_FOR_EXAMINATION_INFO`: 存储包含选定项目的完整结构 `{selectProject, selected}`
- `SUBJECT_CHOOSED`: HomeStore 中临时缓存，JSON stringify 格式。

## 首页模块 (Home Modules)
1. **Banner 轮播**: 使用 swiper 展示宣传海报
2. **快捷功能入口**:
   - 随机练习
   - 顺序练习
   - 模拟考试
   - 快速练习
   - 错题集
   - 收藏夹
   - 成绩单
   - 考试相关(WebView)
3. **考试倒计时**: 提醒用户离考试还有多少天
4. **当前科目概览**:
   - 标题与“切换”按钮
   - 学习进度 (共有多少题，已答多少，答题率)
5. **推荐考题区域**: 高频考题/易错题卡片列表，带有“开始练习”按钮
6. **热门资讯**: 列表模式展示最新资讯图文

## 点击跳转 (Click Redirects)
- 切换科目 -> `SubjectChoose` (选择考试分类页)
- 开始练习(随机) -> `DoExamMain` / `AnswerQuestionMiddle`
- 顺序练习 -> `OrderToPracticeComponent`
- 模拟练习 -> `MockExam` / `SimulationTestComponent`
- 错题集 -> `WrongTopicSetComponent`
- 收藏夹 -> `WrongTopicCollectionComponent`
- 资讯/广告 -> WebView 页面
