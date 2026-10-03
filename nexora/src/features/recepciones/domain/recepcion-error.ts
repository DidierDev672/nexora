/**
 * Excepción base para fallos originados en la API REST de recepciones
 */
export class RecepcionApiError extends Error {
  readonly statusCode: number
  readonly serverMessage?: string

  constructor(statusCode: number, message?: string) {
    super(message || `Error en la API de recepciones con código ${statusCode}`)
    this.name = 'RecepcionApiError'
    this.statusCode = statusCode
    this.serverMessage = message
  }
}

/** Error 404: Habitación, Huésped, Sede o recurso no localizado */
export class RecepcionNotFoundError extends RecepcionApiError {
  constructor(recurso: string, id: string) {
    super(404, `No encontramos el registro de ${recurso} con identificador "${id}".`)
    this.name = 'RecepcionNotFoundError'
  }
}

/** Error 409: Conflicto de ocupación de cama o habitación */
export class RecepcionConflictError extends RecepcionApiError {
  constructor(mensaje?: string) {
    super(409, mensaje || 'La habitación o cama seleccionada ya se encuentra ocupada por otra estadía activa.')
    this.name = 'RecepcionConflictError'
  }
}

/** Error 0 o Network: Falla de conexión, DNS o timeout */
export class RecepcionNetworkError extends RecepcionApiError {
  constructor(mensaje?: string) {
    super(0, mensaje || 'No pudimos conectar con los servidores de Nexora. Por favor verifica tu conexión a internet.')
    this.name = 'RecepcionNetworkError'
  }
}
