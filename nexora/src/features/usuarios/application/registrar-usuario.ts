import { newUsuario, type Usuario, type UsuarioInput } from '../domain/usuario'
import type { UsuarioRepository } from '../domain/usuario-repository'

export const RegistrarUsuario =
  (repository: UsuarioRepository): ((input: UsuarioInput) => Promise<Usuario>) =>
  async (input: UsuarioInput): Promise<Usuario> => {
    const usuario = newUsuario(input)
    await repository.save(input)
    return usuario
  }