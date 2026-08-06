import type { HomeDashboard } from '../domain/home.types'

export interface HomeRemote {
  getDashboard(signal?: AbortSignal): Promise<Omit<HomeDashboard, 'quickActions'>>
}
