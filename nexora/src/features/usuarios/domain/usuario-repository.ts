import type { UsuarioInput } from './usuario'

export interface UsuarioRepository {
  save(input: UsuarioInput): Promise<void>
}