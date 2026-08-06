export const examScopedQueryKeys = {
  home(
    examTypeId: string,
  ) {
    return [
      'home',
      'dashboard',
      examTypeId,
    ] as const
  },

  subjects(
    examTypeId: string,
  ) {
    return [
      'subjects',
      examTypeId,
    ] as const
  },

  practiceRoot(
    examTypeId: string,
  ) {
    return [
      'practice',
      examTypeId,
    ] as const
  },

  simulationRule(examTypeId: string) {
    return ['simulationRule', examTypeId] as const
  },

  simulationPaper(examTypeId: string, paperId: string) {
    return ['simulationPaper', examTypeId, paperId] as const
  },

  simulationResult(examTypeId: string, paperId: string) {
    return ['simulationResult', examTypeId, paperId] as const
  },

  simulationHistory(examTypeId: string) {
    return ['simulationHistory', examTypeId] as const
  },
}
