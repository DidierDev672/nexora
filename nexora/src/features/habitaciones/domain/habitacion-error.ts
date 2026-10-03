export class HabitacionApiError extends Error {
  readonly status: number

  constructor(status: number) {
    super(`No se pudo registrar la habitación (estado ${status || 'desconocido'})`)
    this.name = 'HabitacionApiError'
    this.status = status
  }
}