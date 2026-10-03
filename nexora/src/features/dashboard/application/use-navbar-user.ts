import { useCallback, useEffect, useState } from 'react'

export interface NavbarUserData {
  /** Nombre completo del usuario obtenido de `name_full` en el JSON auth_user */
  name: string
  /** Alias exacto para `name_full` */
  name_full: string
  /** Iniciales calculadas a partir del nombre (ej: "Lucía Morales" -> "LM", "Juan Pérez" -> "JP") */
  initials: string
  /** Correo electrónico del usuario */
  email: string
  /** Rol o cargo del usuario (ej: "Administradora") */
  role: string
  /** Indica si se encontró información de usuario válida en localStorage */
  isAuthenticated: boolean
  /** Datos completos deserializados del JSON auth_user */
  raw: Record<string, unknown> | null
}

const DEFAULT_USER: NavbarUserData = {
  name: 'Lucía Morales',
  name_full: 'Lucía Morales',
  initials: 'LM',
  email: 'operaciones@nexora.com',
  role: 'Administradora',
  isAuthenticated: false,
  raw: null,
}

/**
 * Calcula las iniciales del nombre completo para el avatar.
 * Ejemplos:
 * - "Lucía Morales" -> "LM"
 * - "Juan Carlos Pérez Gómez" -> "JC"
 * - "Admin" -> "AD"
 * - "" -> "U"
 */
export function extractInitials(name?: string | null): string {
  if (!name || typeof name !== 'string') return 'U'
  const trimmed = name.trim()
  if (!trimmed) return 'U'

  const words = trimmed.split(/\s+/).filter(Boolean)
  if (words.length === 0) return 'U'

  if (words.length === 1) {
    return words[0].slice(0, Math.min(2, words[0].length)).toUpperCase()
  }

  // Toma la primera letra de las dos primeras palabras
  const first = words[0][0] || ''
  const second = words[1][0] || ''
  return (first + second).toUpperCase()
}

/**
 * Parsea el JSON `auth_user` almacenado en localStorage como fuente principal.
 * Si no está presente, recurre como respaldo a `auth_token` o `nexora.auth.token`.
 */
function parseAuthStorage(): Record<string, unknown> | null {
  if (typeof window === 'undefined' || !window.localStorage) return null

  // 1. Clave principal: 'auth_user'
  try {
    const rawAuthUser = window.localStorage.getItem('auth_user')
    if (rawAuthUser) {
      try {
        const parsed = JSON.parse(rawAuthUser) as unknown
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return parsed as Record<string, unknown>
        }
      } catch {
        // En caso de que se haya guardado como cadena de texto plano con el nombre
        if (typeof rawAuthUser === 'string' && rawAuthUser.trim()) {
          return { name_full: rawAuthUser.trim() }
        }
      }
    }
  } catch {
    // Si localStorage no está disponible
  }

  // 2. Respaldo secundario: 'auth_token'
  try {
    const rawAuthToken = window.localStorage.getItem('auth_token')
    if (rawAuthToken) {
      try {
        const parsed = JSON.parse(rawAuthToken) as unknown
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return parsed as Record<string, unknown>
        }
      } catch {
        // En caso de que sea un token JWT (header.payload.signature)
        const parts = rawAuthToken.split('.')
        if (parts.length >= 2) {
          const base64 = (parts[1] ?? '').replace(/-/g, '+').replace(/_/g, '/')
          const padLength = (4 - (base64.length % 4)) % 4
          const padded = base64.padEnd(base64.length + padLength, '=')
          const decoded = decodeURIComponent(
            atob(padded)
              .split('')
              .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, '0')}`)
              .join(''),
          )
          const jwtData = JSON.parse(decoded) as unknown
          if (jwtData && typeof jwtData === 'object' && !Array.isArray(jwtData)) {
            return jwtData as Record<string, unknown>
          }
        }
      }
    }
  } catch {
    // Ignorar error de acceso
  }

  // 3. Respaldo terciario: 'nexora.auth.token'
  try {
    const nexoraRaw = window.localStorage.getItem('nexora.auth.token')
    if (nexoraRaw) {
      try {
        const parsed = JSON.parse(nexoraRaw) as unknown
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return parsed as Record<string, unknown>
        }
      } catch {
        const parts = nexoraRaw.split('.')
        if (parts.length >= 2) {
          const base64 = (parts[1] ?? '').replace(/-/g, '+').replace(/_/g, '/')
          const padLength = (4 - (base64.length % 4)) % 4
          const padded = base64.padEnd(base64.length + padLength, '=')
          const decoded = decodeURIComponent(
            atob(padded)
              .split('')
              .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, '0')}`)
              .join(''),
          )
          const jwtData = JSON.parse(decoded) as unknown
          if (jwtData && typeof jwtData === 'object' && !Array.isArray(jwtData)) {
            return jwtData as Record<string, unknown>
          }
        }
      }
    }
  } catch {
    // Ignorar error de acceso
  }

  return null
}

/**
 * Extrae el nombre del usuario dando prioridad absoluta a `name_full`.
 */
function extractNameFromRecord(record: Record<string, unknown> | null): string | null {
  if (!record) return null

  // 1. Prioridad: `name_full`
  if (typeof record.name_full === 'string' && record.name_full.trim().length > 0) {
    return record.name_full.trim()
  }
  if (typeof record.Name_full === 'string' && record.Name_full.trim().length > 0) {
    return record.Name_full.trim()
  }

  // 2. Verificar sub-objeto anidado (ej: { user: { name_full: "..." } })
  const nested = (record.user || record.usuario || record.data) as Record<string, unknown> | undefined
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    const fromNested = extractNameFromRecord(nested)
    if (fromNested) return fromNested
  }

  // 3. Fallbacks de claves alternativas comunes
  const candidateKeys = [
    'full_name',
    'fullName',
    'FullName',
    'name_full',
    'Name_full',
    'nombre',
    'Nombre',
    'nombre_completo',
    'nombreCompleto',
    'username',
    'Username',
    'user_name',
    'userName',
  ]

  for (const key of candidateKeys) {
    const val = record[key]
    if (typeof val === 'string' && val.trim().length > 0) {
      return val.trim()
    }
  }

  // 4. Si no hay nombre pero hay email, derivar el nombre legible
  const emailVal = record.email || record.Email || record.correo
  if (typeof emailVal === 'string' && emailVal.includes('@')) {
    const prefix = emailVal.split('@')[0].replace(/[._-]+/g, ' ').trim()
    if (prefix) {
      return prefix
        .split(/\s+/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ')
    }
  }

  return null
}

/**
 * Extrae el email del usuario examinando claves comunes.
 */
function extractEmailFromRecord(record: Record<string, unknown> | null): string | null {
  if (!record) return null

  const candidateKeys = ['email', 'Email', 'correo', 'mail', 'sub']
  for (const key of candidateKeys) {
    const val = record[key]
    if (typeof val === 'string' && val.includes('@')) {
      return val.trim()
    }
  }

  const nested = (record.user || record.usuario || record.data) as Record<string, unknown> | undefined
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    return extractEmailFromRecord(nested)
  }

  return null
}

/**
 * Extrae el rol o cargo del usuario.
 */
function extractRoleFromRecord(record: Record<string, unknown> | null): string | null {
  if (!record) return null

  const candidateKeys = ['role', 'Role', 'rol', 'Rol', 'cargo', 'position', 'profile', 'perfil']
  for (const key of candidateKeys) {
    const val = record[key]
    if (typeof val === 'string' && val.trim().length > 0) {
      return val.trim()
    }
  }

  const nested = (record.user || record.usuario || record.data) as Record<string, unknown> | undefined
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    return extractRoleFromRecord(nested)
  }

  return null
}

/**
 * Hook para el navbar / avatar que lee la información del usuario
 * desde `localStorage.getItem('auth_user')`, toma la propiedad `name_full`
 * y calcula dinámicamente las iniciales de sus nombres para mostrarlas en el avatar.
 */
export function useNavbarUser(fallback: NavbarUserData = DEFAULT_USER): NavbarUserData & { refresh: () => void } {
  const readUserData = useCallback((): NavbarUserData => {
    const record = parseAuthStorage()
    if (!record) return fallback

    const name = extractNameFromRecord(record) || fallback.name
    const initials = extractInitials(name)
    const email = extractEmailFromRecord(record) || fallback.email
    const role = extractRoleFromRecord(record) || fallback.role

    return {
      name,
      name_full: name,
      initials,
      email,
      role,
      isAuthenticated: true,
      raw: record,
    }
  }, [fallback])

  const [user, setUser] = useState<NavbarUserData>(readUserData)

  const refresh = useCallback(() => {
    setUser(readUserData())
  }, [readUserData])

  useEffect(() => {
    // Sincronización entre pestañas / ventanas
    const handleStorageChange = (e: StorageEvent) => {
      if (!e.key || e.key === 'auth_user' || e.key === 'auth_token' || e.key === 'nexora.auth.token') {
        refresh()
      }
    }

    // Sincronización dentro de la misma pestaña mediante evento personalizado
    const handleCustomAuthChange = () => {
      refresh()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('nexora:auth-change', handleCustomAuthChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('nexora:auth-change', handleCustomAuthChange)
    }
  }, [refresh])

  return {
    ...user,
    refresh,
  }
}

/**
 * Alias semántico del hook useNavbarUser para componentes de avatar.
 */
export const useNavbarAvatar = useNavbarUser
export const useUserAvatar = useNavbarUser
