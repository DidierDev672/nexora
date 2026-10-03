import { api } from '../../../lib/api'
import {
  mapDiasSemanaToEnglish,
  mapModalidadToEnglish,
  type Tarifa,
  type TarifaInput,
} from '../domain/tarifa'
import type { TarifaRepository } from '../domain/tarifa-repository'

const STORAGE_KEY = 'nexora_tarifas_cache_v1'

function generateId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID()
  }
  return `tarifa-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function loadFromLocal(): Tarifa[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveToLocal(list: Tarifa[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {
    // ignore quota errors
  }
}

export class ApiTarifaRepository implements TarifaRepository {
  async guardar(
    input: TarifaInput,
    meta?: { sedeNombre?: string; subSedeNombre?: string },
  ): Promise<Tarifa> {
    const nuevaTarifa: Tarifa = {
      id: generateId(),
      nombre: input.nombre.trim(),
      sedeId: input.sedeId,
      sedeNombre: meta?.sedeNombre,
      subSedeId: input.subSedeId || undefined,
      subSedeNombre: meta?.subSedeNombre,
      modalidad: input.modalidad as Tarifa['modalidad'],
      precio: Number.parseFloat(input.precio),
      duracion: Number.parseInt(input.duracion, 10),
      fechaInicio: input.fechaInicio,
      fechaFinal: input.fechaFinal,
      diasSemana: input.diasSemana as Tarifa['diasSemana'],
      estado: input.estado,
      createdAt: new Date().toISOString(),
    }

    try {
      // Intentamos sincronizar con la API REST si está disponible
      await api.post('/rate', {
        name: nuevaTarifa.nombre,
        headquarter_id: nuevaTarifa.sedeId,
        sub_headquarter_id: nuevaTarifa.subSedeId,
        modality: mapModalidadToEnglish(nuevaTarifa.modalidad),
        price: nuevaTarifa.precio,
        duration: nuevaTarifa.duracion,
        start_date: nuevaTarifa.fechaInicio,
        end_date: nuevaTarifa.fechaFinal,
        days_of_week: mapDiasSemanaToEnglish(nuevaTarifa.diasSemana),
        status: nuevaTarifa.estado,
      })
    } catch {
      // Si la API remota aún no tiene implementado el endpoint o está fuera de línea,
      // no rompemos la experiencia del usuario y persistimos localmente de forma segura.
    }

    // Persistimos en la caché local
    const actuales = loadFromLocal()
    saveToLocal([nuevaTarifa, ...actuales])

    return nuevaTarifa
  }

  async listar(): Promise<Tarifa[]> {
    try {
      const response = await api.get<Tarifa[]>('/rates')
      if (response.status === 200 && Array.isArray(response.data)) {
        return response.data
      }
    } catch {
      // Fallback a almacenamiento local
    }
    return loadFromLocal()
  }
}
