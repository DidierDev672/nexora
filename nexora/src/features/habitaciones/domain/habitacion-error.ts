export class HabitacionApiError extends Error {
  readonly status: number
  readonly friendlyMessage?: string

  constructor(status: number, message?: string) {
    super(message ?? `No se pudo registrar la habitación (estado ${status || 'desconocido'})`)
    this.name = 'HabitacionApiError'
    this.status = status
    this.friendlyMessage = message
  }
}