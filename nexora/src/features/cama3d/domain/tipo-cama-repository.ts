import type { TipoCama, TipoCamaDraft } from './tipo-cama'

export interface TipoCamaRepository {
  list(): Promise<TipoCama[]>
  create(draft: TipoCamaDraft): Promise<void>
}