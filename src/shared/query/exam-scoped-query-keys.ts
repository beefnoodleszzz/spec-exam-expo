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
}
