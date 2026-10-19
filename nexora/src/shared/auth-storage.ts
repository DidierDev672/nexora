const AUTH_USER_KEY = 'auth_user'
const AUTH_TOKEN_KEY = 'nexora.auth.token'
const FALLBACK_CREATED_BY = 'user_system'

function decodeJwtPayload(token: string): unknown {
  const parts = token.split('.')
  if (parts.length < 2) return null
  const base64 = (parts[1] ?? '').replace(/-/g, '+').replace(/_/g, '/')
  const padLength = (4 - (base64.length % 4)) % 4
  const padded = base64.padEnd(base64.length + padLength, '=')
  const decoded = decodeURIComponent(
    atob(padded)
      .split('')
      .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
      .join(''),
  )
  return JSON.parse(decoded) as unknown
}

function readEmailFrom(value: unknown): string | null {
  if (value !== null && typeof value === 'object') {
    const record = value as Record<string, unknown>
    if (typeof record.email === 'string') {
      const email = record.email.trim()
      if (email) return email
    }
    if (typeof record.Email === 'string') {
      const email = record.Email.trim()
      if (email) return email
    }
  }
  return null
}

export function readTokenEmail(): string {
  try {
    const raw = window.localStorage.getItem(AUTH_TOKEN_KEY)
    if (raw) {
      const email = readEmailFrom(decodeJwtPayload(raw))
      if (email) return email
    }
  } catch {
    // Si `nexora.auth.token` no es un JWT legible, se cae al respaldo.
  }
  return readAuthUserEmail()
}

export function readAuthUserEmail(): string {
  try {
    const raw = window.localStorage.getItem(AUTH_USER_KEY)
    if (raw) {
      try {
        const email = readEmailFrom(JSON.parse(raw) as unknown)
        if (email) return email
      } catch {
        // `auth_user` guardado como texto plano: se usa tal cual.
        return raw.trim() || FALLBACK_CREATED_BY
      }
    }
  } catch {
    // localStorage no disponible: se usa el valor por defecto.
  }
  return FALLBACK_CREATED_BY
}

export function readAuthTokenEmail(): string {
  try {
    // 1. Claves directas requeridas: 'auteh_token' y 'auth_token'
    for (const key of ['auteh_token', 'auth_token']) {
      const rawAuthToken = window.localStorage.getItem(key)
      if (rawAuthToken) {
        try {
          const parsed = JSON.parse(rawAuthToken) as unknown
          const email = readEmailFrom(parsed)
          if (email) return email
        } catch {
          // En caso de que sea un token JWT almacenado como cadena plana
          const email = readEmailFrom(decodeJwtPayload(rawAuthToken))
          if (email) return email
        }
      }
    }

    // 2. Token de sesión alternativa: 'nexora.auth.token'
    const nexoraToken = window.localStorage.getItem(AUTH_TOKEN_KEY)
    if (nexoraToken) {
      const email = readEmailFrom(decodeJwtPayload(nexoraToken))
      if (email) return email
    }

    // 3. Objeto de usuario: 'auth_user'
    const authUserRaw = window.localStorage.getItem(AUTH_USER_KEY)
    if (authUserRaw) {
      try {
        const email = readEmailFrom(JSON.parse(authUserRaw) as unknown)
        if (email) return email
      } catch {
        if (authUserRaw.includes('@')) return authUserRaw.trim()
      }
    }
  } catch {
    // localStorage no accesible
  }
  return 'ariasdev672@gmail.com'
}

/**
 * Lee y devuelve el objeto JSON de usuario guardado en `auth_user`.
 */
export function readAuthUser(): Record<string, unknown> | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null
    const raw = window.localStorage.getItem(AUTH_USER_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as unknown
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>
      }
    }
  } catch {
    // localStorage no disponible o JSON no válido
  }
  return null
}

function extractStringProp(obj: Record<string, unknown>, keys: string[]): string | null {
  for (const k of keys) {
    const val = obj[k]
    if (typeof val === 'string' && val.trim().length > 0) {
      return val.trim()
    }
    if (typeof val === 'number') {
      return String(val)
    }
  }
  return null
}

function deriveNameFromEmail(email?: string | null): string {
  if (!email || !email.includes('@')) return ''
  const prefix = email.split('@')[0].replace(/[._-]+/g, ' ').trim()
  if (!prefix) return ''
  return prefix
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Extrae y normaliza los datos de usuario a partir del payload devuelto por la API REST.
 * Soporta respuestas anidadas ({ user, usuario, data }), respuestas planas en la raíz,
 * y claims decodificados desde el JWT.
 */
export function extractUserFromApiResponse(
  responseData: unknown,
  loginEmail?: string,
  tokenOverride?: string,
): Record<string, unknown> {
  let userRecord: Record<string, unknown> = {}

  if (responseData && typeof responseData === 'object' && !Array.isArray(responseData)) {
    const root = responseData as Record<string, unknown>

    const nested =
      (root.user && typeof root.user === 'object' && !Array.isArray(root.user)
        ? (root.user as Record<string, unknown>)
        : null) ||
      (root.usuario && typeof root.usuario === 'object' && !Array.isArray(root.usuario)
        ? (root.usuario as Record<string, unknown>)
        : null) ||
      (root.data && typeof root.data === 'object' && !Array.isArray(root.data)
        ? (((root.data as Record<string, unknown>).user as Record<string, unknown> | undefined) ||
           ((root.data as Record<string, unknown>).usuario as Record<string, unknown> | undefined) ||
           (root.data as Record<string, unknown>))
        : null)

    if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
      userRecord = { ...nested }
    } else {
      const shallow = { ...root }
      delete shallow.token
      delete shallow.access_token
      delete shallow.password
      delete shallow.contrasena
      if (Object.keys(shallow).length > 0) {
        userRecord = shallow
      }
    }
  }

  // Si se dispone de un token JWT, extraer sus claims como respaldo sin sobreescribir datos explícitos
  const rawToken =
    tokenOverride ||
    (responseData && typeof responseData === 'object'
      ? (
          ((responseData as Record<string, unknown>).token as string | undefined) ||
          ((responseData as Record<string, unknown>).access_token as string | undefined) ||
          (((responseData as Record<string, unknown>).data as Record<string, unknown> | undefined)?.token as string | undefined)
        )
      : undefined)

  if (typeof rawToken === 'string' && rawToken.includes('.')) {
    try {
      const jwtClaims = decodeJwtPayload(rawToken)
      if (jwtClaims && typeof jwtClaims === 'object' && !Array.isArray(jwtClaims)) {
        userRecord = {
          ...(jwtClaims as Record<string, unknown>),
          ...userRecord,
        }
      }
    } catch {
      // Ignorar token no parseable
    }
  }

  if (loginEmail && !userRecord.email && !userRecord.Email && !userRecord.correo) {
    userRecord.email = loginEmail.trim()
  }

  return userRecord
}

/**
 * Actualiza la información `auth_user` en localStorage de acuerdo a la respuesta devuelta por la API REST.
 * Normaliza campos estándar (name_full, email, role, id_number, etc.) conservando propiedades adicionales,
 * almacena los tokens correspondientes y despacha el evento global 'nexora:auth-change' para que toda la UI
 * (navbar, avatar, perfil de usuario) se actualice de inmediato.
 */
export function updateAuthUserFromLoginResponse(
  responseData: unknown,
  loginEmail?: string,
  tokenOverride?: string,
): Record<string, unknown> {
  const extracted = extractUserFromApiResponse(responseData, loginEmail, tokenOverride)

  // 1. Obtener datos actuales de auth_user si existen para no perder atributos existentes
  let existingUser: Record<string, unknown> = {}
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const rawCurrent = window.localStorage.getItem(AUTH_USER_KEY)
      if (rawCurrent) {
        const parsed = JSON.parse(rawCurrent) as unknown
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          existingUser = parsed as Record<string, unknown>
        }
      }
    } catch {
      // Ignorar si el JSON previo no es parseable
    }
  }

  // 2. Resolver y garantizar name_full
  const explicitName = extractStringProp(extracted, [
    'name_full',
    'Name_full',
    'full_name',
    'fullName',
    'FullName',
    'nombre_completo',
    'nombreCompleto',
    'nombre',
    'Nombre',
    'name',
    'Name',
    'username',
    'Username',
  ])

  let combinedName = explicitName
  if (!combinedName) {
    const first = extractStringProp(extracted, ['first_name', 'firstName', 'primer_nombre', 'nombre'])
    const last = extractStringProp(extracted, ['last_name', 'lastName', 'apellidos', 'apellido', 'segundo_apellido'])
    if (first) {
      combinedName = last ? `${first} ${last}`.trim() : first
    }
  }

  const resolvedEmail =
    extractStringProp(extracted, ['email', 'Email', 'correo', 'Correo', 'mail', 'Mail']) ||
    (typeof extracted.sub === 'string' && extracted.sub.includes('@') ? extracted.sub.trim() : null) ||
    loginEmail?.trim() ||
    (typeof existingUser.email === 'string' ? existingUser.email.trim() : '')

  const resolvedName =
    combinedName ||
    deriveNameFromEmail(resolvedEmail) ||
    (typeof existingUser.name_full === 'string' && existingUser.name_full.trim().length > 0
      ? existingUser.name_full.trim()
      : 'Usuario Nexora')

  const resolvedRole =
    extractStringProp(extracted, [
      'role',
      'Role',
      'rol',
      'Rol',
      'cargo',
      'Cargo',
      'profile',
      'Profile',
      'perfil',
      'Perfil',
      'user_type',
      'tipo_usuario',
    ]) ||
    (typeof existingUser.role === 'string' && existingUser.role.trim().length > 0
      ? existingUser.role.trim()
      : 'Administrador')

  const resolvedId =
    extractStringProp(extracted, [
      'id_number',
      'idNumber',
      'document_number',
      'documentNumber',
      'identification',
      'identificacion',
      'cedula',
      'documento',
      'dni',
      'rut',
    ]) ||
    (typeof existingUser.id_number === 'string' ? existingUser.id_number : '')

  const resolvedBirth =
    extractStringProp(extracted, [
      'date_of_birth',
      'dateOfBirth',
      'birth_date',
      'birthDate',
      'fecha_nacimiento',
      'fechaNacimiento',
    ]) ||
    (typeof existingUser.date_of_birth === 'string' ? existingUser.date_of_birth : '')

  const resolvedPhone =
    extractStringProp(extracted, [
      'phone',
      'phone_number',
      'phoneNumber',
      'telefono',
      'celular',
      'mobile',
    ]) ||
    (typeof existingUser.phone === 'string' ? existingUser.phone : '')

  const resolvedHeadquarter =
    extractStringProp(extracted, [
      'headquarter',
      'headquarters',
      'sede',
      'sede_nombre',
      'hotel',
      'hotel_name',
      'sucursal',
    ]) ||
    (typeof existingUser.headquarter === 'string' ? existingUser.headquarter : '')

  const resolvedJoined =
    extractStringProp(extracted, [
      'joined_date',
      'joinedDate',
      'created_at',
      'createdAt',
      'fecha_ingreso',
      'fecha_registro',
    ]) ||
    (typeof existingUser.joined_date === 'string' ? existingUser.joined_date : '')

  const resolvedStatus =
    extractStringProp(extracted, ['status', 'estado', 'state']) ||
    (typeof existingUser.status === 'string' ? existingUser.status : 'Activo')

  // 3. Crear el nuevo objeto completo de auth_user
  const updatedAuthUser: Record<string, unknown> = {
    ...existingUser,
    ...extracted,
    name_full: resolvedName,
    email: resolvedEmail,
    role: resolvedRole,
    id_number: resolvedId,
    date_of_birth: resolvedBirth,
    phone: resolvedPhone,
    headquarter: resolvedHeadquarter,
    joined_date: resolvedJoined,
    status: resolvedStatus,
  }

  // 4. Guardar en localStorage y emitir evento
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updatedAuthUser))

      const detectedToken =
        tokenOverride ||
        (responseData && typeof responseData === 'object'
          ? (
              ((responseData as Record<string, unknown>).token as string | undefined) ||
              ((responseData as Record<string, unknown>).access_token as string | undefined) ||
              (((responseData as Record<string, unknown>).data as Record<string, unknown> | undefined)?.token as string | undefined)
            )
          : undefined)

      if (detectedToken) {
        window.localStorage.setItem(AUTH_TOKEN_KEY, detectedToken)
        window.localStorage.setItem('auth_token', detectedToken)
      }

      window.dispatchEvent(new Event('nexora:auth-change'))
    } catch {
      // Manejar posibles excepciones de acceso a localStorage
    }
  }

  return updatedAuthUser
}

/**
 * Elimina toda la información de sesión (`auth_user`, `auth_token`, `nexora.auth.token`)
 * de localStorage y notifica globalmente a la aplicación mediante 'nexora:auth-change'.
 */
export function clearAuthSession(): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(AUTH_USER_KEY)
      window.localStorage.removeItem('auth_token')
      window.localStorage.removeItem(AUTH_TOKEN_KEY)
      window.dispatchEvent(new Event('nexora:auth-change'))
    }
  } catch {
    // Si localStorage no estuviera accesible
  }
}

/**
 * Obtiene el token JWT sin procesar almacenado en localStorage.
 * Busca secuencialmente en las claves estándar ('auth_token', 'nexora.auth.token', 'token', 'access_token', 'jwt')
 * y extrae la cadena JWT tanto si está almacenada en texto plano como si está serializada en un objeto JSON.
 */
export function getRawJwtToken(): string | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null

    const candidateKeys = ['auteh_token', 'auth_token', 'nexora.auth.token', 'token', 'access_token', 'jwt']

    for (const key of candidateKeys) {
      const raw = window.localStorage.getItem(key)
      if (!raw) continue

      const trimmed = raw.trim()
      if (!trimmed) continue

      // Caso 1: Cadena plana (JWT o token)
      if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
        const clean = trimmed.replace(/^["']|["']$/g, '').trim()
        if (clean) return clean
      }

      // Caso 2: Objeto JSON serializado
      try {
        const parsed = JSON.parse(trimmed) as unknown
        if (parsed && typeof parsed === 'object') {
          const record = parsed as Record<string, unknown>
          const candidate =
            record.token ||
            record.access_token ||
            record.jwt ||
            (record.data && typeof record.data === 'object'
              ? (record.data as Record<string, unknown>).token ||
                (record.data as Record<string, unknown>).access_token
              : null)

          if (typeof candidate === 'string' && candidate.trim()) {
            return candidate.trim().replace(/^["']|["']$/g, '')
          }
        }
      } catch {
        const clean = trimmed.replace(/^["']|["']$/g, '').trim()
        if (clean) return clean
      }
    }
  } catch {
    // localStorage no accesible
  }

  return null
}

/**
 * Genera los encabezados HTTP de autorización con el token JWT obtenido desde localStorage.
 * Incluye Authorization Bearer y cabeceras compatibles ('auth-token', 'x-access-token', 'token').
 */
export function getAuthHeaders(extra?: Record<string, string>): Record<string, string> {
  const token = getRawJwtToken()
  const headers: Record<string, string> = { ...(extra || {}) }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
    headers['auth-token'] = token
    headers['x-access-token'] = token
    headers['token'] = token
  }
  return headers
}