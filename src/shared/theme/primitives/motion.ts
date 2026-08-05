export const motion = {
  duration: {
    fast: 150,
    normal: 250,
    slow: 400,
  },
  easing: {
    standard: 'ease-in-out',
    enter: 'ease-out',
    exit: 'ease-in',
  },
} as const

export type MotionKey = keyof typeof motion
