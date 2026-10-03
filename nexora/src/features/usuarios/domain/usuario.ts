export type UsuarioEstado = 'activo' | 'inactivo'

export const USUARIO_ESTADOS: readonly UsuarioEstado[] = ['activo', 'inactivo'] as const

export const USUARIO_ESTADO_LABELS: Record<UsuarioEstado, string> = {
  activo: 'Activo',
  inactivo: 'Inactivo',
}

export interface Usuario {
  id: string
  nombre: string
  email: string
  rol: string
  sedeId: string
  subSedeId?: string
  estado: UsuarioEstado
}

export interface UsuarioInput {
  nombre: string
  email: string
  password: string
  rol: string
  sedeId: string
  subSedeId?: string
  estado: UsuarioEstado
}

export interface UsuarioValidationErrors {
  nombre?: string
  email?: string
  password?: string
  rol?: string
  sedeId?: string
  subSedeId?: string
  estado?: string
}

export const NOMBRE_MAX = 80
export const PASSWORD_MIN = 8

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function newId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID()
  }
  return `usuario-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export function newUsuario(input: UsuarioInput): Usuario {
  return {
    id: newId(),
    nombre: input.nombre.trim(),
    email: input.email.trim(),
    rol: input.rol,
    sedeId: input.sedeId,
    subSedeId: input.subSedeId,
    estado: input.estado,
  }
}

export function validateUsuarioInput(input: UsuarioInput): UsuarioValidationErrors {
  const errors: UsuarioValidationErrors = {}
  const nombre = input.nombre.trim()
  const email = input.email.trim()

  if (!nombre) {
    errors.nombre = 'Escribe el nombre del usuario.'
  } else if (nombre.length < 2) {
    errors.nombre = 'El nombre debe tener al menos 2 caracteres.'
  } else if (nombre.length > NOMBRE_MAX) {
    errors.nombre = `El nombre no puede superar los ${NOMBRE_MAX} caracteres.`
  }

  if (!email) {
    errors.email = 'Escribe el correo del usuario.'
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Revisa el formato: usuario@correo.com'
  }

  if (!input.password) {
    errors.password = 'Elige una contraseña.'
  } else if (input.password.length < PASSWORD_MIN) {
    errors.password = `La contraseña debe tener al menos ${PASSWORD_MIN} caracteres.`
  }

  if (!input.rol) {
    errors.rol = 'Elige un rol para este usuario.'
  }

  if (!input.sedeId) {
    errors.sedeId = 'Elige la sede donde trabajará.'
  }

  if (!USUARIO_ESTADOS.includes(input.estado)) {
    errors.estado = 'Elige un estado válido.'
  }

  return errors
}