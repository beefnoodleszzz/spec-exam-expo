import { queryOptions } from '@tanstack/react-query'
import { questionBankRemote } from '../data/question-bank.remote.impl'

export const questionBankQueryKeys = {
  all: ['question-bank'] as const,
  subjects: (examTypeId: string) => [...questionBankQueryKeys.all, 'subjects', examTypeId] as const,
  chapters: (subjectId: string) => [...questionBankQueryKeys.all, 'chapters', subjectId] as const,
}

export const questionBankQueries = {
  subjects: (examTypeId: string) => queryOptions({
    queryKey: questionBankQueryKeys.subjects(examTypeId),
    queryFn: ({ signal }) => questionBankRemote.listSubjects(examTypeId, signal),
    staleTime: 5 * 60 * 1000,
    enabled: !!examTypeId,
  }),
  chapters: (subjectId: string) => queryOptions({
    queryKey: questionBankQueryKeys.chapters(subjectId),
    queryFn: ({ signal }) => questionBankRemote.listChapters(subjectId, signal),
    staleTime: 5 * 60 * 1000,
    enabled: !!subjectId,
  }),
}
