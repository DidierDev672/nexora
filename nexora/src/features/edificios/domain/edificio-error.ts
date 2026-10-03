export class EdificioApiError extends Error {
  readonly status: number

  constructor(status: number) {
    super(`La API de edificios respondió con el código ${status}.`)
    this.name = 'EdificioApiError'
    this.status = status
  }
}