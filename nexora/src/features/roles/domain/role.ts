export interface Role {
  id: string
  name: string
  description: string
}

export interface RoleInput {
  name: string
  description: string
}

export interface RoleValidationErrors {
  name?: string
  description?: string
}

export const NAME_MAX = 60
export const DESCRIPTION_MAX = 240

function newId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID()
  }
  return `role-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export function newRole(input: RoleInput): Role {
  return {
    id: newId(),
    name: input.name.trim(),
    description: input.description.trim(),
  }
}

export function updateRoleFields(role: Role, input: RoleInput): Role {
  return {
    id: role.id,
    name: input.name.trim(),
    description: input.description.trim(),
  }
}

export function validateRoleInput(input: RoleInput): RoleValidationErrors {
  const errors: RoleValidationErrors = {}
  const name = input.name.trim()

  if (!name) {
    errors.name = 'El nombre es obligatorio.'
  } else if (name.length < 2) {
    errors.name = 'El nombre debe tener al menos 2 caracteres.'
  } else if (name.length > NAME_MAX) {
    errors.name = `El nombre no puede superar los ${NAME_MAX} caracteres.`
  }

  if (input.description.trim().length > DESCRIPTION_MAX) {
    errors.description = `La descripción no puede superar los ${DESCRIPTION_MAX} caracteres.`
  }

  return errors
}