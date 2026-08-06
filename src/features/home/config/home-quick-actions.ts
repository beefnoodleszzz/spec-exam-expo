import type { HomeQuickAction } from '../domain/home.types'

export const homeQuickActions: HomeQuickAction[] = [
  { id: 'random', title: '随机练习', icon: 'shuffle', route: 'practice', params: { type: 'RANDOM' } },
  { id: 'order', title: '顺序练习', icon: 'list', route: 'practice', params: { type: 'ORDER' } },
  { id: 'simulation', title: '模拟考试', icon: 'document-text', route: 'simulation' },
  { id: 'quick', title: '快速练习', icon: 'flash', route: 'practice', params: { type: 'QUICK' } },
  { id: 'wrong', title: '错题集', icon: 'close-circle', route: 'questions', params: { type: 'WRONG' } },
  { id: 'favorite', title: '收藏夹', icon: 'star', route: 'questions', params: { type: 'FAVORITE' } },
]
