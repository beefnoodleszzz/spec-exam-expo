# Legacy Simulation Mapping

## 1. 模拟考试入口接口 (Mock Exam Entry & Rules)
- **API Endpoint:** `getMockExam` -> `/api/examV2/app/subject/getMockExam`
- **Generated Name:** `apiExamV2AppSubjectGetMockExamGet`
- **Response Type:** `ExaminationManageContractDtoSubjectVMockExam`
- **Extracted Fields:**
  - `time` -> duration in minutes (legacy multiplied by 60 for seconds).
  - `subjectCount` -> total number of questions.
  - `examTypeName` -> name of the mock exam.

## 2. 试卷生成接口 & 试卷详情接口 (Paper Generation)
- **API Endpoint:** `getSubjectsByGroup` -> `/api/examV2/app/subject/getSubjectsByGroup`
- **Generated Name:** `apiExamV2AppSubjectGetSubjectsByGroupPost`
- **Payload:** `{ subjectGroupType: 2 }` (Type 2 represents Simulation).
- **Response:** Array of questions.

## 3. 考试时长 (Duration)
- Provided by `getMockExam` in the `time` field (value in minutes).

## 4. 题目分组 & 单题分值 (Groups & Scores)
- Grouping is theoretically outlined in `subjectTypeDistribute` from `getMockExam`, but questions are returned flat via `getSubjectsByGroup`.
- The exact score per question isn't explicitly defined in the payload. Legacy code hardcoded increments (e.g., `score = score + 2` in some instances), but this calculation happens on the backend now.

## 5. 答题保存方式 (Save Progress)
- **Legacy:** Kept in local state (`examInfoCopy` inside Zustand store) and only submitted at the end.
- **Phase 7 Requirement:** We need to implement a local debounced persistence mechanism that flushes to `AsyncStorage` and possibly calls a backend endpoint if one exists. Since there isn't an explicit `saveProgress` API, `saveProgress` in Remote may just be a local operation unless the backend supports intermediate calls to `submitExerciseRecord` (which is unlikely without finishing the exam). The spec requires a stub or local simulation for this if no server API exists.

## 6. 最终交卷接口 (Submit Exam)
- **API Endpoint:** `submitExerciseRecord` -> `/api/examV2/app/subject/submitExerciseRecord`
- **Generated Name:** `apiExamV2AppSubjectSubmitExerciseRecordPut`
- **Payload:** 
  - `subjectGroupType: 2`
  - `time`: elapsed time in seconds.
  - `subjectList`: array of answered questions (id, answer, isMistake, isCollection).
- **Response:** Returns `ExaminationManageContractDtoSubjectSubjectResultDto` which contains:
  - `isPass`, `score`, `subjectCorrectCount`, `subjectErrorCount`, `time`.

## 7. 成绩接口 (Exam Result)
- Relies on the immediate response from `submitExerciseRecord` (which yields the `isPass` and `score`).
- There is no specific `getResult` by `paperId` endpoint in legacy; results are either kept in memory after submission or loaded from history. 
- Requirement states we need `getResult(paperId)`, which we will likely satisfy by caching the result in `AsyncStorage` / `Zustand` locally mapped by `paperId` upon submission success.

## 8. 历史记录接口 (History)
- **API Endpoint:** `getGradeHistory` -> `/api/examV2/app/subject/getGradeHistory`
- **Generated Name:** `apiExamV2AppSubjectGetGradeHistoryGet`
- **Response:** `ExaminationManageContractDtoSubjectVGradeHistory`, containing `answerRate`, `passTimes`, `averageScore`, `highestScore`, `lowestScore`, and `gradeHistories` (the list of past exam scores, times, and pass status).

## 9. 时间模型与恢复机制
- **Legacy Timer:** Purely local `setInterval` using the `time` provided by `getMockExam`.
- **Phase 7 Timer:** We will use `startedAt` and `expiresAt` recorded at the start of the session, persisting it to `AsyncStorage`. Resuming the app will calculate `Math.floor((expiresAt - Date.now()) / 1000)` as the authoritative remaining time.
