import { createContext, useContext } from 'react'
import type { Role, RoleInput } from '../domain/role'

export interface RolesState {
  roles: Role[]
  create: (input: RoleInput) => Role
  update: (id: string, input: RoleInput) => void
  remove: (id: string) => void
}

export const RolesContext = createContext<RolesState | null>(null)

export function useRoles(): RolesState {
  const state = useContext(RolesContext)
  if (!state) {
    throw new Error('useRoles debe usarse dentro de <RolesProvider>')
  }
  return state
}