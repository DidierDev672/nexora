export type TipoDocumento = 'Tarjeta de identidad' | 'Cédula' | 'Tarjeta extranjera'

export const TIPOS_DOCUMENTO: readonly TipoDocumento[] = [
  'Tarjeta de identidad',
  'Cédula',
  'Tarjeta extranjera',
] as const

export const TIPOS_DOCUMENTO_OPTIONS = TIPOS_DOCUMENTO.map((tipo) => ({
  value: tipo,
  label: tipo,
}))

export const DOCUMENT_TYPE_MAP: Record<TipoDocumento, string> = {
  'Tarjeta de identidad': 'id_card',
  'Cédula': 'national_id',
  'Tarjeta extranjera': 'foreign_id',
}

export interface PersonaPayload {
  document_type: string
  document_number: string
  name: string
  phone_number: string
  email: string
}

export function toPersonaPayload(input: PersonaInput): PersonaPayload {
  return {
    document_type: DOCUMENT_TYPE_MAP[input.tipoDocumento as TipoDocumento] ?? input.tipoDocumento,
    document_number: input.numeroDocumento.trim(),
    name: (input.nombre || input.name || '').trim(),
    phone_number: input.telefono.trim(),
    email: input.email.trim(),
  }
}

export interface Persona {
  id: string
  tipoDocumento: TipoDocumento
  numeroDocumento: string
  nombre?: string
  name?: string
  telefono: string
  email: string
  roles?: string[]
  creadoEn: string
}

export interface PersonaInput {
  tipoDocumento: string
  numeroDocumento: string
  nombre: string
  name?: string
  telefono: string
  email: string
  roles?: string[]
}

export interface PersonaValidationErrors {
  tipoDocumento?: string
  numeroDocumento?: string
  nombre?: string
  name?: string
  telefono?: string
  email?: string
  roles?: string
}

export function validatePersonaInput(input: PersonaInput): PersonaValidationErrors {
  const errors: PersonaValidationErrors = {}

  const tipo = input.tipoDocumento.trim()
  if (!tipo) {
    errors.tipoDocumento = 'Por favor selecciona un tipo de documento.'
  }

  const numDoc = input.numeroDocumento.trim()
  if (!numDoc) {
    errors.numeroDocumento = 'El número de documento es obligatorio.'
  } else if (numDoc.length < 5) {
    errors.numeroDocumento = 'El número de documento debe tener al menos 5 caracteres.'
  } else if (!/^[a-zA-Z0-9.-]+$/.test(numDoc)) {
    errors.numeroDocumento = 'Ingresa un número de documento válido.'
  }

  const nom = (input.nombre || input.name || '').trim()
  if (!nom) {
    errors.nombre = 'El nombre completo es obligatorio.'
  } else if (nom.length < 3) {
    errors.nombre = 'Ingresa un nombre completo válido (al menos 3 caracteres).'
  }

  const tel = input.telefono.trim()
  if (!tel) {
    errors.telefono = 'El número de teléfono es indispensable para mantener el contacto.'
  } else if (tel.length < 7) {
    errors.telefono = 'Ingresa un teléfono completo (al menos 7 dígitos).'
  }

  const email = input.email.trim()
  if (!email) {
    errors.email = 'El correo electrónico es obligatorio.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Ingresa un correo electrónico con formato válido (ej. nombre@empresa.com).'
  }

  return errors
}

