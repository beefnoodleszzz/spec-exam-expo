import { queryOptions } from '@tanstack/react-query'
import { homeRemote } from '../data/home.remote.impl'
import { homeQuickActions } from '../config/home-quick-actions'

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
      queryFn: async ({ signal }) => {
        const data = await homeRemote.getDashboard(signal)
        return {
          ...data,
          quickActions: homeQuickActions,
        }
      },
    }),
}
