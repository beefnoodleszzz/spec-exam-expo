export const palette = {
  blue50: '#E8F3FF',
  blue100: '#C9E2FF',
  blue200: '#94C2FF',
  blue300: '#599DFF',
  blue400: '#3385FF',
  blue500: '#1677FF',
  blue600: '#0958D9',
  blue700: '#003EB3',
  blue800: '#002C8C',
  blue900: '#001D66',

  gray0: '#FFFFFF',
  gray50: '#F7F8FA',
  gray100: '#F2F3F5',
  gray200: '#E5E6EB',
  gray300: '#C9CDD4',
  gray400: '#A9AEB8',
  gray500: '#86909C',
  gray600: '#6B7785',
  gray700: '#4E5969',
  gray800: '#272E3B',
  gray900: '#1D2129',

  green50: '#E8FFEA',
  green100: '#AFF0B5',
  green500: '#00B42A',
  green600: '#009A22',

  orange50: '#FFF7E8',
  orange100: '#FFE4BA',
  orange500: '#FF7D00',
  orange600: '#D25F00',

  red50: '#FFECEC',
  red100: '#FDB6B6',
  red500: '#F53F3F',
  red600: '#CB2727',

  amber50: '#FFFBEB',
  amber500: '#D97706',

  transparent: 'transparent',
} as const

export type PaletteKey = keyof typeof palette
