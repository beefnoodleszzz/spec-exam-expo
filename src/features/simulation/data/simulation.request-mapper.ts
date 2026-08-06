import type {
  ExaminationManageContractDtoSubjectVMockExam,
  ExaminationManageContractDtoSubjectSubjectDto,
  ExaminationManageContractDtoSubjectVGradeHistory,
  ExaminationManageContractDtoSubjectSubmitExerciseRecordInput,
  ExaminationManageContractDtoSubjectSubjectBase,
} from '@/shared/api/generated/models'
import type { SimulationRule } from '../domain/simulation-rule.types'
import type { SimulationPaper, SimulationQuestionRef } from '../domain/simulation-paper.types'
import type { SimulationHistoryItem } from '../domain/simulation-history.types'
import type { SimulationSession } from '../domain/simulation-session.types'

export function mapSimulationRule(
  examTypeId: string,
  dto: ExaminationManageContractDtoSubjectVMockExam,
): SimulationRule {
  return {
    examTypeId,
    durationSeconds: (dto.time || 0) * 60,
    totalQuestions: dto.subjectCount || 0,
    totalScore: null,
    passScore: null,
  }
}

export function mapSimulationPaper(
  paperId: string,
  rule: SimulationRule,
  dtos: ExaminationManageContractDtoSubjectSubjectDto[],
): SimulationPaper {
  const questions: SimulationQuestionRef[] = dtos.map((dto, index) => ({
    questionId: dto.id || '',
    subjectId: null, // subjectId usually means coarse-grained chapter/subject, not provided directly in simulation question dto typically.
    score: null,     // Not provided by backend explicitly in paper generation.
    order: index,
  }))

  return {
    paperId,
    title: '模拟考试',
    durationSeconds: rule.durationSeconds,
    questions,
    startedAt: new Date().toISOString(),
    expiresAt: null,
  }
}

export function mapSubmitPaperRequest(
  session: SimulationSession,
): ExaminationManageContractDtoSubjectSubmitExerciseRecordInput {
  // Sort answers by question ID to ensure stable signature
  const entries = Object.entries(session.answers).sort(([a], [b]) =>
    a.localeCompare(b),
  )

  const subjectList: ExaminationManageContractDtoSubjectSubjectBase[] = entries.map(
    ([questionId, answer]) => ({
      id: questionId,
      answer: answer.answers.join(','), // Assuming answers are sorted/joined correctly depending on type
      isMistake: false, // Legacy used this for "wrong" but backend calculates score.
      isCollection: false,
    }),
  )

  return {
    examTypeId: session.examTypeId,
    subjectGroupType: 2, // 2 for simulation
    time: Math.floor(
      (Date.now() - new Date(session.startedAt).getTime()) / 1000,
    ),
    subjectList,
  }
}

export function mapSimulationHistory(
  examTypeId: string,
  dto: ExaminationManageContractDtoSubjectVGradeHistory,
): SimulationHistoryItem[] {
  return (dto.gradeHistories || []).map((history, index) => ({
    resultId: `${examTypeId}-${index}-${history.createTime}`, // Generate stable ID if missing
    paperId: '', // Legacy history doesn't return paperId
    title: dto.examTypeName || '模拟考试',
    score: history.score || 0,
    passScore: null,
    passed: history.isPass ?? null,
    durationSeconds: history.time || 0,
    createdAt: history.createTime || new Date().toISOString(),
  }))
}
