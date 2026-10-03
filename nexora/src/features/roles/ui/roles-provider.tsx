import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { CreateRole } from '../application/create-role'
import { DeleteRole } from '../application/delete-role'
import { GetRoles } from '../application/get-roles'
import { UpdateRole } from '../application/update-role'
import type { Role, RoleInput } from '../domain/role'
import type { RoleRepository } from '../domain/role-repository'
import { RolesContext, type RolesState } from './roles-context'

export interface RolesProviderProps {
  repository: RoleRepository
  children: ReactNode
}

export function RolesProvider({ repository, children }: RolesProviderProps) {
  const [roles, setRoles] = useState<Role[]>(() => GetRoles(repository)())

  const create = useCallback(
    (input: RoleInput): Role => {
      const role = CreateRole(repository)(input)
      setRoles((prev) => [...prev, role])
      return role
    },
    [repository],
  )

  const update = useCallback(
    (id: string, input: RoleInput) => {
      const updated = UpdateRole(repository)(id, input)
      if (!updated) return
      setRoles((prev) => prev.map((role) => (role.id === id ? updated : role)))
    },
    [repository],
  )

  const remove = useCallback(
    (id: string) => {
      DeleteRole(repository)(id)
      setRoles((prev) => prev.filter((role) => role.id !== id))
    },
    [repository],
  )

  const value = useMemo<RolesState>(
    () => ({ roles, create, update, remove }),
    [roles, create, update, remove],
  )

  return <RolesContext.Provider value={value}>{children}</RolesContext.Provider>
}