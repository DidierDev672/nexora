export const colors = {
  primary: '#5a311f',
  secondary: '#67543e',
  neutral: '#6d6e76',
  surface: '#d4c7b7',
  danger: '#9c3b31',
} as const

export type ColorToken = keyof typeof colors

export const brandDefaults = {
  primary: '#5a311f',
  canvas: '#f6f1e8',
  panel: '#fffdf8',
  line: '#e6dccd',
  ink: '#2c2118',
  inkMuted: '#7d6f5d',
  cream: '#f5ecde',
} as const