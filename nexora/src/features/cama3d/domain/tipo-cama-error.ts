export class TipoCamaApiError extends Error {
  readonly status: number

  constructor(status: number) {
    super(`No se pudieron obtener los tipos de cama (estado ${status || 'desconocido'})`)
    this.name = 'TipoCamaApiError'
    this.status = status
  }
}