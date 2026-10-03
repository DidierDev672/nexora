import type { Sede } from '../domain/sede'
import type { SedeRepository } from '../domain/sede-repository'

export const GetSedes =
  (repository: SedeRepository): (() => Promise<Sede[]>) =>
  async (): Promise<Sede[]> =>
    repository.list()