import { api } from '../../../lib/api'
import type { Palette, PaletteColor } from '../domain/palette'
import type { PaletteRepository } from '../domain/palette-repository'

interface ApiPaletteColor {
  hex: string
  name: string
}

interface ApiPalette {
  name: string
  colors: ApiPaletteColor[]
  is_defined: boolean
}

function fromApiColor(item: ApiPaletteColor): PaletteColor {
  return { hex: item.hex, name: item.name }
}

function fromApiPalette(item: ApiPalette): Palette {
  return {
    name: item.name,
    colors: Array.isArray(item.colors) ? item.colors.map(fromApiColor) : [],
    isDefined: item.is_defined,
  }
}

export class ApiPaletteRepository implements PaletteRepository {
  async list(): Promise<Palette[]> {
    const response = await api.get<ApiPalette[]>('/palette')
    if (response.status !== 200 || !Array.isArray(response.data)) {
      throw new Error('Lista de paletas no disponible')
    }
    return response.data.map(fromApiPalette)
  }
}