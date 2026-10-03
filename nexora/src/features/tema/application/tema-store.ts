import { create } from 'zustand'
import type { Palette } from '../domain/palette'

const STORAGE_KEY = 'nexora.tema.palette'

function readPersistedPalette(): Palette | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Palette
    if (!parsed?.name || !Array.isArray(parsed.colors)) return null
    return parsed
  } catch {
    return null
  }
}

interface TemaState {
  appliedPalette: Palette | null
  previewPalette: Palette | null
  preview: (palette: Palette) => void
  cancelPreview: () => void
  applyPermanently: () => void
  applyPalette: (palette: Palette) => void
  resetToDefault: () => void
}

export const useTemaStore = create<TemaState>((set, get) => ({
  appliedPalette: readPersistedPalette(),
  previewPalette: null,
  preview: (palette) => set({ previewPalette: palette }),
  cancelPreview: () => set({ previewPalette: null }),
  applyPermanently: () => {
    const { previewPalette } = get()
    if (!previewPalette) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(previewPalette))
    } catch {
      // Si localStorage no está disponible, el cambio se mantiene solo en memoria.
    }
    set({ appliedPalette: previewPalette, previewPalette: null })
  },
  applyPalette: (palette: Palette) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(palette))
    } catch {
      // Si localStorage no está disponible, el cambio se mantiene solo en memoria.
    }
    set({ appliedPalette: palette, previewPalette: null })
  },
  resetToDefault: () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // Si localStorage no está disponible, el cambio se mantiene solo en memoria.
    }
    set({ appliedPalette: null, previewPalette: null })
  },
}))