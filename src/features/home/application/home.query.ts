import { queryOptions } from '@tanstack/react-query'
import { homeRemote } from '../data/home.remote.impl'

export const homeQueryKeys = {
  root: ['home'] as const,

  dashboard(examTypeId: string) {
    return [...this.root, 'dashboard', examTypeId] as const
  },
}

export const homeQueries = {
  dashboard: (examTypeId: string) =>
    queryOptions({
      queryKey: homeQueryKeys.dashboard(examTypeId),
      queryFn: ({ signal }) => homeRemote.getDashboard(signal),
    }),
}
