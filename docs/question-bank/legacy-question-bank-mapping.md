# Legacy Question Bank Mapping

## Subjects
- **Interface**: `apiExamV2AppSubjectGetExamTypeGet` (In legacy, `getExamType` fetched what the new app calls "Subjects" & "Chapters")
- **Behavior**: It returns a tree structure where top-level items are subjects and children are chapters.
- **Store**: Handled via `ChooseTheSubjectStore` in legacy.

## Chapters
- **Interface**: Same as above, returned as `examSubtypes` on the subject.
- **Fields**: `id`, `name`, `tryOn`, `examSubtypes`.

## Questions (Legacy: Subjects)
- **Interface**: `apiExamV2AppSubjectGetSubjectsPost`
- **Fields Mapping**:
  - `id`: Question ID
  - `title`: Question Stem HTML (`stemHtml`)
  - `selection`: Question Options (JSON string or array of strings, e.g. `["A、正确", "B、错误"]`)
  - `answer`: Correct Answers (string, e.g. "AB")
  - `desc`: Explanation HTML (`explanationHtml`)
  - `isCollection`: `isFavorite`
- **Rules**:
  - Multiple choice: `answer` has length > 1.
  - Judge: `selection` contains "正确" / "错误".
  - Unknown: Fallback if format is weird.

## Answer Submission & Practice Record
- **Interface**: `apiExamV2AppSubjectSubmitExerciseRecordPut`
- **Payload**:
  - `examTypeId`: string
  - `subjectGroupId`: string
  - `subjectGroupType`: number
  - `subjectList`: Array of `{ id: string, isMistake: boolean, isCollection: boolean, answer: string }`
  - `time`: elapsed seconds
- **Behavior**: Submits the user's answers, mistakes, and favorites in one batch.

## Favorite (Collection)
- **Action**: Toggled locally on `isCollection` and submitted via the `submitExerciseRecord` endpoint in the `subjectList` array.
- **Note**: There is no dedicated `toggleFavorite` endpoint for practice questions.

## Wrong Questions
- **Interface**: `apiExamV2AppSubjectGetSubjectsPost` with `isMistake: true`.
- **Store**: `WrongTopicCollectionStore`.

## Resume Practice
- **Mechanism**: Legacy uses `AsyncStorage` with key format `personInfo?.selectProject?.id + routeParams?.childType + id + indexPage` to save the `currentIndex`.
- **Behavior**: When opening the page, if this index exists, it prompts "You last stopped at X, continue?".

