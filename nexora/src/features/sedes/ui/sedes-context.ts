import { createContext, useContext } from 'react'
import type { Sede, SedeInput } from '../domain/sede'

export interface SedesState {
  sedes: Sede[]
  isLoading: boolean
  loadError: string | null
  reload: () => void
  create: (input: SedeInput) => Sede
  remove: (id: string) => void
  removeStatic: (id: string) => void
}

export const SedesContext = createContext<SedesState | null>(null)

export function useSedes(): SedesState {
  const state = useContext(SedesContext)
  if (!state) {
    throw new Error('useSedes debe usarse dentro de <SedesProvider>')
  }
  return state
}