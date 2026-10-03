import type { Sede } from './sede'

export interface SedeRepository {
  list(): Promise<Sede[]>
  save(sede: Sede): void
  remove(id: string): void
  removeStatic(id: string): void
}