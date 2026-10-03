export interface ReceptionStay {
  id: string
  room_id: string
  reservation_id?: string | null
  person_ids: string[]
  check_in_date: string
  check_out_date: string
  payment_method: string
  security_deposit: number
  remarks?: string
  status: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface PersonApiResponse {
  id: string
  document_type: string
  document_number: string
  name: string
  phone_number: string
  email: string
  date_of_birth?: string
  gender: string
  nationality?: string
  roles?: string[]
  created_by?: string
  created_at?: string
  updated_at?: string
}

export interface GuestDisplayInfo {
  id: string
  name: string
  documentTypeSpanish: string
  documentNumber: string
  genderSpanish: string
  phoneNumber: string
  email: string
  dateOfBirth?: string
  nationality?: string
  roles?: string[]
}

export interface PsychologicalStayNotice {
  title: string
  message: string
  solution?: string
  type: 'occupied' | 'available' | 'warning' | 'error'
  statusCode?: number
}

/**
 * Traduce el tipo de documento del backend al español claro y formal para el recepcionista
 */
export function translateDocumentTypeToSpanish(docType?: string): string {
  const norm = (docType || '').toLowerCase().trim()
  if (norm.includes('card') || norm.includes('tarjeta') || norm === 'id_card') {
    return 'Tarjeta de identidad'
  }
  if (norm.includes('national') || norm.includes('nacional') || norm === 'national_id') {
    return 'Identificación nacional'
  }
  if (norm.includes('foreign') || norm.includes('extranjera') || norm === 'foreign_id') {
    return 'Identificación extranjera'
  }
  if (norm.includes('passport') || norm.includes('pasaporte')) {
    return 'Pasaporte'
  }
  return docType ? docType.replace(/_/g, ' ') : 'Documento general'
}

/**
 * Traduce el género del huésped al español formal
 */
export function translateGenderToSpanish(gender?: string): string {
  const norm = (gender || '').toUpperCase().trim()
  if (norm === 'M' || norm.startsWith('MASC')) {
    return 'Masculino'
  }
  if (norm === 'F' || norm.startsWith('FEM')) {
    return 'Femenino'
  }
  return gender?.trim() || 'No especificado'
}
