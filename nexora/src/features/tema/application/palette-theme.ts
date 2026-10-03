import type { Palette } from '../domain/palette'

type RGB = [number, number, number]

function hexToRgb(hex: string): RGB {
  const value = hex.replace('#', '')
  const full = value.length === 3 ? value.split('').map((c) => c + c).join('') : value
  const int = Number.parseInt(full, 16)
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255]
}

function rgbToHex([r, g, b]: RGB): string {
  const to = (n: number) =>
    Math.round(Math.max(0, Math.min(255, n)))
      .toString(16)
      .padStart(2, '0')
  return `#${to(r)}${to(g)}${to(b)}`
}

function mix(hexA: string, hexB: string, weightB: number): string {
  const a = hexToRgb(hexA)
  const b = hexToRgb(hexB)
  return rgbToHex(a.map((v, i) => v + (b[i] - v) * weightB) as RGB)
}

const lighten = (hex: string, amount: number) => mix(hex, '#ffffff', amount)
const darken = (hex: string, amount: number) => mix(hex, '#000000', amount)

function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex)
    .map((v) => v / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export interface PaletteThemeTokens {
  primary: string
  secondary: string
  neutral: string
  surface: string
  danger: string
  canvas: string
  panel: string
  line: string
  ink: string
  inkMuted: string
  inkSoft: string
  sidebar: string
  cream: string
}

const ROLE_KEYWORDS: Array<{ keywords: string[]; role: keyof PaletteThemeTokens }> = [
  { keywords: ['primary', 'principal', 'primario', 'brand', 'marca', 'titulo'], role: 'primary' },
  { keywords: ['secondary', 'secundario', 'accent', 'acento', 'subtitulo'], role: 'secondary' },
  { keywords: ['neutral', 'gray', 'grey', 'gris', 'parrafos'], role: 'neutral' },
  { keywords: ['surface', 'superficie', 'pildoras', 'pildora'], role: 'surface' },
  { keywords: ['danger', 'error', 'alert', 'alerta', 'red', 'rojo'], role: 'danger' },
  { keywords: ['canvas', 'background', 'fondo', 'bg', 'navbar'], role: 'canvas' },
  { keywords: ['panel', 'card', 'tarjeta'], role: 'panel' },
  { keywords: ['line', 'border', 'borde', 'separator', 'separador'], role: 'line' },
  { keywords: ['text', 'ink', 'tinta', 'foreground', 'texto'], role: 'ink' },
  { keywords: ['sidebar', 'barra lateral', 'aside'], role: 'sidebar' },
  { keywords: ['cream', 'crema', 'ivory', 'marfil'], role: 'cream' },
]

const DEFAULT_PRIMARY = '#5a311f'
const DEFAULT_WARM_CANVAS = '#f6f1e8'

export function paletteToTokens(palette: Palette): PaletteThemeTokens {
  const explicit: Partial<PaletteThemeTokens> = {}

  for (const color of palette.colors) {
    const name = color.name.toLocaleLowerCase()
    for (const { keywords, role } of ROLE_KEYWORDS) {
      if (explicit[role]) continue
      if (keywords.some((keyword) => name.includes(keyword))) {
        explicit[role] = color.hex
        break
      }
    }
  }

  const primary = explicit.primary ?? palette.colors[0]?.hex ?? DEFAULT_PRIMARY
  const secondary = explicit.secondary ?? palette.colors[1]?.hex ?? lighten(primary, 0.28)
  const neutral = explicit.neutral ?? palette.colors[2]?.hex ?? lighten(primary, 0.45)
  const surface = explicit.surface ?? lighten(primary, 0.55)
  const canvas = explicit.canvas ?? mix(primary, DEFAULT_WARM_CANVAS, 0.86)
  const danger = explicit.danger ?? '#9c3b31'
  const cream = explicit.cream ?? '#f5ecde'

  const isDark = luminance(canvas) < 0.45
  const ink = explicit.ink ?? (isDark ? '#f0e8da' : '#2c2118')
  const panel = explicit.panel ?? mix(canvas, isDark ? '#000000' : '#ffffff', isDark ? 0.12 : 0.24)
  const line = explicit.line ?? mix(canvas, isDark ? '#ffffff' : '#000000', isDark ? 0.14 : 0.1)
  const inkMuted = mix(ink, isDark ? '#000000' : '#ffffff', isDark ? 0.22 : 0.45)
  const inkSoft = mix(ink, isDark ? '#000000' : '#ffffff', isDark ? 0.4 : 0.65)
  const sidebar = explicit.sidebar ?? darken(primary, 0.32)

  return {
    primary,
    secondary,
    neutral,
    surface,
    danger,
    canvas,
    panel,
    line,
    ink,
    inkMuted,
    inkSoft,
    sidebar,
    cream,
  }
}

const TOKEN_CSS_VARS: Record<keyof PaletteThemeTokens, string> = {
  primary: '--color-primary',
  secondary: '--color-secondary',
  neutral: '--color-neutral',
  surface: '--color-surface',
  danger: '--color-danger',
  canvas: '--nx-canvas',
  panel: '--nx-panel',
  line: '--nx-line',
  ink: '--nx-ink',
  inkMuted: '--nx-ink-muted',
  inkSoft: '--nx-ink-soft',
  sidebar: '--nx-sidebar',
  cream: '--nx-cream',
}

export function applyPaletteToDocument(palette: Palette): void {
  const root = document.documentElement
  const tokens = paletteToTokens(palette)
  for (const [token, cssVar] of Object.entries(TOKEN_CSS_VARS) as Array<
    [keyof PaletteThemeTokens, string]
  >) {
    root.style.setProperty(cssVar, tokens[token])
  }
  root.style.setProperty('--nx-sidebar-hover', 'rgba(255, 255, 255, 0.08)')
}

export function clearPaletteFromDocument(): void {
  const root = document.documentElement
  for (const cssVar of [
    ...new Set(Object.values(TOKEN_CSS_VARS)),
    '--nx-sidebar-hover',
  ]) {
    root.style.removeProperty(cssVar)
  }
}