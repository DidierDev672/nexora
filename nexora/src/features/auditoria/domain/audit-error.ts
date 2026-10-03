/**
 * Excepciones de dominio para el módulo de auditoría de Nexora
 */

export class AuditApiError extends Error {
  readonly statusCode: number
  readonly serverMessage?: string

  constructor(statusCode: number, message?: string) {
    super(message || `Error en el servicio de auditoría (Código HTTP ${statusCode})`)
    this.name = 'AuditApiError'
    this.statusCode = statusCode
    this.serverMessage = message
  }
}

export class AuditNotFoundError extends AuditApiError {
  constructor(recurso: string, id?: string) {
    super(404, id ? `No se localizó el recurso "${recurso}" con ID ${id}.` : `No se encontró la información de auditoría para "${recurso}".`)
    this.name = 'AuditNotFoundError'
  }
}

export class AuditUnauthorizedError extends AuditApiError {
  constructor(mensaje?: string) {
    super(401, mensaje || 'La sesión de auditoría ha expirado o requiere credenciales válidas.')
    this.name = 'AuditUnauthorizedError'
  }
}

export class AuditForbiddenError extends AuditApiError {
  constructor(mensaje?: string) {
    super(403, mensaje || 'No dispones de permisos suficientes para acceder a los datos de auditoría de esta sede.')
    this.name = 'AuditForbiddenError'
  }
}

export class AuditNetworkError extends AuditApiError {
  constructor(mensaje?: string) {
    super(0, mensaje || 'Fallo de conectividad al consultar los registros de auditoría.')
    this.name = 'AuditNetworkError'
  }
}

export class AuditScopeError extends Error {
  constructor(mensaje: string) {
    super(mensaje)
    this.name = 'AuditScopeError'
  }
}
