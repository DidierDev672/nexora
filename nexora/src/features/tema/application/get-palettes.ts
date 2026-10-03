import type { Palette } from '../domain/palette'
import type { PaletteRepository } from '../domain/palette-repository'

export const GetPalettes =
  (repository: PaletteRepository): (() => Promise<Palette[]>) =>
  async (): Promise<Palette[]> =>
    repository.list()