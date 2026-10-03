export interface PaletteColor {
  hex: string
  name: string
}

export interface Palette {
  name: string
  colors: PaletteColor[]
  isDefined: boolean
}