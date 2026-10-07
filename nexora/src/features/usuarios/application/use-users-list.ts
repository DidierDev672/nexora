import { useState, useEffect, useMemo, useCallback } from 'react'
import type { StatusCodeValidationResult } from '../../../shared/lib/status-code-validator'
import type { UserItem, UsersViewMode } from '../domain/user-list'
import { fetchUsersFromApi } from '../infrastructure/users-api'

export function useUsersList() {
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [validation, setValidation] = useState<StatusCodeValidationResult | null>(null)
  const [fromFallback, setFromFallback] = useState(false)

  // Modo de visualización: 'card' | 'table'
  const [viewMode, setViewMode] = useState<UsersViewMode>('card')

  // Filtros interactivos
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('todos')
  const [roleFilter, setRoleFilter] = useState<string>('todos')

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchUsersFromApi()
      setUsers(result.users)
      setValidation(result.validation)
      setFromFallback(result.fromFallback)

      if (!result.validation.isValid && !result.fromFallback) {
        setError(result.validation.message || 'No fue posible completar la consulta.')
      }
    } catch (err) {
      setError('Ocurrió un error inesperado al conectar con el servidor.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  // Filtrado reactivo en memoria
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // 1. Filtro de búsqueda por nombre o correo
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase()
        const matchName = u.name.toLowerCase().includes(query)
        const matchEmail = u.email.toLowerCase().includes(query)
        if (!matchName && !matchEmail) return false
      }

      // 2. Filtro por estado
      if (statusFilter !== 'todos') {
        const normStatus = (u.status || '').toLowerCase()
        if (statusFilter === 'active' && normStatus !== 'active' && normStatus !== 'activo') {
          return false
        }
        if (statusFilter === 'inactive' && normStatus !== 'inactive' && normStatus !== 'inactivo') {
          return false
        }
      }

      // 3. Filtro por rol
      if (roleFilter !== 'todos') {
        if (u.role_id !== roleFilter) return false
      }

      return true
    })
  }, [users, searchQuery, statusFilter, roleFilter])

  // Métricas calculadas para la cabecera
  const metrics = useMemo(() => {
    const total = users.length
    const active = users.filter((u) => {
      const s = (u.status || '').toLowerCase()
      return s === 'active' || s === 'activo'
    }).length
    const inactive = total - active
    const rolesCount = new Set(users.map((u) => u.role_id)).size

    return {
      total,
      active,
      inactive,
      rolesCount,
    }
  }, [users])

  // Lista única de roles presentes para poblar el dropdown de filtro
  const availableRoles = useMemo(() => {
    const uniqueRoleIds = Array.from(new Set(users.map((u) => u.role_id)))
    return uniqueRoleIds
  }, [users])

  return {
    users,
    filteredUsers,
    loading,
    error,
    validation,
    fromFallback,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    roleFilter,
    setRoleFilter,
    availableRoles,
    metrics,
    reload: loadUsers,
  }
}
