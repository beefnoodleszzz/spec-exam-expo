export interface HomeQuickAction {
  id: string
  title: string
  icon: string
  route: string
  params?: unknown
}

export interface HomeBanner {
  id: string
  imageUrl: string
  link?: string
  title?: string
}

export interface HomeNotice {
  id: string
  title: string
  description?: string
  imageUrl?: string
  date: string
}

export interface HomeDashboard {
  examDay: number | null
  totalSubject: number
  totalAnswer: number
  answerRate: string
  
  banners: HomeBanner[]
  notices: HomeNotice[]
  quickActions: HomeQuickAction[]
}
