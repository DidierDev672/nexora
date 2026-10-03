import type { Palette } from './palette'

export interface PaletteRepository {
  list(): Promise<Palette[]>
}