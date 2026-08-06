import type { ExaminationManageContractDtoSubjectGetSubjectsByGroupInput } from '@/shared/api/generated/models/examinationManageContractDtoSubjectGetSubjectsByGroupInput'
import type { ExaminationManageContractDtoSubjectGetSubjectsInput } from '@/shared/api/generated/models/examinationManageContractDtoSubjectGetSubjectsInput'
import type { ExaminationManageContractDtoSubjectSubmitExerciseRecordInput } from '@/shared/api/generated/models/examinationManageContractDtoSubjectSubmitExerciseRecordInput'
import type { ApiExamV2AppSubjectGetSubjectGroupGetParams } from '@/shared/api/generated/models/apiExamV2AppSubjectGetSubjectGroupGetParams'
import { createContractError } from '@/shared/api/errors/app-error'

export function mapListChaptersRequest(subjectId: string): ApiExamV2AppSubjectGetSubjectGroupGetParams {
  const type = Number(subjectId)
  if (!Number.isSafeInteger(type)) {
    throw createContractError('无效的科目 ID')
  }
  return {
    type,
    index: 1,
    size: 1000
  }
}

export function mapCreateOrderPracticeRequest(examTypeId: string, chapterId?: string): ExaminationManageContractDtoSubjectGetSubjectsByGroupInput {
  return {
    examTypeId,
    ...(chapterId ? { subjectGroupId: chapterId } : {}),
    index: 1,
    size: 1000
  }
}

export function mapCreateRandomPracticeRequest(examTypeId: string): ExaminationManageContractDtoSubjectGetSubjectsInput {
  return {
    examTypeId,
    index: 1,
    size: 1000
  }
}

export function mapListWrongQuestionsRequest(examTypeId: string): ExaminationManageContractDtoSubjectGetSubjectsInput {
  return {
    examTypeId,
    isMistake: true,
    index: 1,
    size: 1000
  }
}

export function mapListFavoriteQuestionsRequest(examTypeId: string): ExaminationManageContractDtoSubjectGetSubjectsInput {
  return {
    examTypeId,
    isCollection: true,
    index: 1,
    size: 1000
  }
}

export function mapSubmitAnswerRequest(
  questionId: string, 
  answers: string[], 
  elapsedSeconds: number,
  isMistake: boolean,
  isFavorite: boolean
): ExaminationManageContractDtoSubjectSubmitExerciseRecordInput {
  return {
    subjectList: [{
      id: questionId,
      isMistake,
      isCollection: isFavorite,
      answer: answers.join(',')
    }],
    time: elapsedSeconds
  }
}

export function mapToggleCollectionRequest(
  questionId: string,
  favorite: boolean
): ExaminationManageContractDtoSubjectSubmitExerciseRecordInput {
  return {
    subjectList: [{
      id: questionId,
      isMistake: false,
      isCollection: favorite,
      answer: ''
    }],
    time: 0
  }
}
