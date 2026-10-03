import { api } from '../../../lib/api'
import type { UsuarioInput } from '../domain/usuario'
import type { UsuarioRepository } from '../domain/usuario-repository'

const ESTADO_TO_STATUS: Record<string, string> = {
  activo: 'active',
  inactivo: 'inactive',
}

export class ApiUsuarioRepository implements UsuarioRepository {
  async save(input: UsuarioInput): Promise<void> {
    const response = await api.post('/users', {
      name: input.nombre.trim(),
      email: input.email.trim(),
      password: input.password,
      role_id: input.rol,
      headquarters_id: input.sedeId,
      sub_headquarters_id: input.subSedeId ?? null,
      status: ESTADO_TO_STATUS[input.estado] ?? 'active',
      created_by: 'user_system',
    })
    if (response.status !== 201) {
      throw new Error('Registro de usuario no disponible')
    }
  }
}