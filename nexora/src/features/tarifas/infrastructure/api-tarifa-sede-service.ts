import { isAxiosError } from 'axios'
import { api } from '../../../lib/api'
import {
  type HeadquarterInfo,
  type SubHeadquarterInfo,
  KNOWN_SEDES_NAMES,
} from '../domain/tarifa-sede'

export interface SedeResult {
  statusCode: number
  data: HeadquarterInfo | null
  errorMessage: string | null
}

export interface SubSedeResult {
  statusCode: number
  data: SubHeadquarterInfo[]
  errorMessage: string | null
}

/**
 * Catálogo de contingencia en caso de desconexión o modo demostración.
 */
const DEMO_SEDES_MAP: Record<string, { sede: HeadquarterInfo; subsedes: SubHeadquarterInfo[] }> = {
  'sede-central-miraflores': {
    sede: {
      id: 'sede-central-miraflores',
      name: 'Sede Principal Miraflores',
      city: 'Bogotá D.C.',
      address: 'Carrera 7 # 72 - 41, Zona Financiera',
      phone: '+57 (601) 745-8900',
      status: 'active',
      created_by: 'admin@nexorahoteles.com',
      created_at: '2026-01-15T08:00:00Z',
      updated_at: '2026-03-20T14:30:00Z',
    },
    subsedes: [
      {
        id: 'sub-norte',
        headquarter_id: 'sede-central-miraflores',
        name: 'Torre Empresarial Norte',
        address: 'Calle 73 # 7 - 22',
        phone: '+57 (601) 745-8901',
        status: 'active',
        created_by: 'admin@nexorahoteles.com',
        created_at: '2026-01-18T10:00:00Z',
        updated_at: '2026-03-20T14:30:00Z',
      },
      {
        id: 'sub-suites',
        headquarter_id: 'sede-central-miraflores',
        name: 'Pabellón Suites Miraflores',
        address: 'Carrera 7 # 72 - 55',
        phone: '+57 (601) 745-8902',
        status: 'active',
        created_by: 'admin@nexorahoteles.com',
        created_at: '2026-01-20T11:00:00Z',
        updated_at: '2026-03-20T14:30:00Z',
      },
    ],
  },
  'sede-san-isidro': {
    sede: {
      id: 'sede-san-isidro',
      name: 'Sede San Isidro Campestre',
      city: 'Medellín',
      address: 'Calle 10A # 40 - 25, El Poblado',
      phone: '+57 (604) 448-1200',
      status: 'active',
      created_by: 'gerencia@nexorahoteles.com',
      created_at: '2026-02-01T09:00:00Z',
      updated_at: '2026-03-25T11:15:00Z',
    },
    subsedes: [
      {
        id: 'sub-sur',
        headquarter_id: 'sede-san-isidro',
        name: 'Módulo Colonial San Isidro',
        address: 'Calle 10A # 40 - 30',
        phone: '+57 (604) 448-1205',
        status: 'active',
        created_by: 'gerencia@nexorahoteles.com',
        created_at: '2026-02-05T12:00:00Z',
        updated_at: '2026-03-25T11:15:00Z',
      },
    ],
  },
}

/**
 * Consulta la información de la sede principal (GET /headquarters/{id})
 * y evalúa el código HTTP mediante un switch de validación.
 * REGLA: En status 200 NO se genera mensaje para el usuario.
 * Para los demás status codes sí se implementa un mensaje explicativo y amigable.
 */
export async function fetchHeadquarterById(id: string): Promise<SedeResult> {
  const cleanId = id.trim()
  try {
    const response = await api.get<unknown>(`/headquarters/${encodeURIComponent(cleanId)}`, {
      headers: { Accept: 'application/json' },
      validateStatus: () => true, // Permite evaluar todos los status codes en el switch
    })

    const serverMsg = extractServerMessage(response.data)

    // SWITCH DE VALIDACIÓN DE STATUS CODE PARA SEDE
    switch (response.status) {
      case 200: {
        // En status 200 NO se presenta mensaje al usuario; entregamos la información limpia
        const data = parseHeadquarterObject(response.data, cleanId)
        return {
          statusCode: 200,
          data,
          errorMessage: null,
        }
      }

      case 204: {
        return {
          statusCode: 204,
          data: null,
          errorMessage: 'El registro de esta sede no contiene datos disponibles en este momento.',
        }
      }

      case 400: {
        return {
          statusCode: 400,
          data: null,
          errorMessage:
            serverMsg ||
            'La solicitud para consultar la sede contiene parámetros con formato no reconocido.',
        }
      }

      case 401: {
        return {
          statusCode: 401,
          data: null,
          errorMessage:
            'Tu sesión ha expirado. Por favor ingresa nuevamente para consultar la información de la sede.',
        }
      }

      case 403: {
        return {
          statusCode: 403,
          data: null,
          errorMessage:
            'No dispones de los permisos necesarios para visualizar la información confidencial de esta sede.',
        }
      }

      case 404: {
        // En caso de 404 (ej. en desarrollo local con IDs mockeados), usamos contingencia si existe
        const fallback = DEMO_SEDES_MAP[cleanId]?.sede || buildGenericFallbackSede(cleanId)
        return {
          statusCode: 404,
          data: fallback,
          errorMessage:
            serverMsg ||
            `No encontramos un registro oficial en el servidor para el identificador "${cleanId}". Te mostramos la ficha de contingencia disponible.`,
        }
      }

      case 409: {
        return {
          statusCode: 409,
          data: null,
          errorMessage:
            'Existe un conflicto temporal al sincronizar la información de la sede con el catálogo.',
        }
      }

      case 422: {
        return {
          statusCode: 422,
          data: null,
          errorMessage:
            'El identificador de la sede no cumple con los requisitos esperados por el sistema.',
        }
      }

      case 429: {
        return {
          statusCode: 429,
          data: null,
          errorMessage:
            'Se han realizado demasiadas solicitudes en poco tiempo. Por favor espera unos momentos antes de reintentar.',
        }
      }

      case 500: {
        return {
          statusCode: 500,
          data: null,
          errorMessage:
            serverMsg ||
            'Nuestros servidores presentaron un inconveniente momentáneo al consultar la sede. Por favor reintenta en breve.',
        }
      }

      case 502:
      case 503:
      case 504: {
        return {
          statusCode: response.status,
          data: null,
          errorMessage:
            `El servicio de sedes se encuentra temporalmente fuera de línea (HTTP ${response.status}). Estamos restableciendo la conexión.`,
        }
      }

      default: {
        return {
          statusCode: response.status,
          data: null,
          errorMessage:
            serverMsg ||
            `Se presentó una respuesta no esperada del servidor (HTTP ${response.status}) al consultar la sede.`,
        }
      }
    }
  } catch (error: unknown) {
    const isNetwork = isAxiosError(error) && !error.response
    const fallback = DEMO_SEDES_MAP[cleanId]?.sede || buildGenericFallbackSede(cleanId)

    return {
      statusCode: 0,
      data: fallback,
      errorMessage: isNetwork
        ? 'No pudimos conectar con el servidor de sedes. Por favor verifica tu conexión a internet.'
        : 'Ocurrió una interrupción al intentar consultar la información de la sede.',
    }
  }
}

/**
 * Consulta la información de las subsedes de una sede principal (GET /sub-headquarters/by-headquarter/{id_headquarters})
 * y evalúa el código HTTP mediante un switch de validación.
 * REGLA: En status 200 NO se genera mensaje para el usuario.
 * Para los demás status codes sí se implementa un mensaje explicativo y amigable.
 */
export async function fetchSubHeadquartersByHq(hqId: string): Promise<SubSedeResult> {
  const cleanId = hqId.trim()
  try {
    const response = await api.get<unknown>(
      `/sub-headquarters/by-headquarter/${encodeURIComponent(cleanId)}`,
      {
        headers: { Accept: 'application/json' },
        validateStatus: () => true,
      },
    )

    const serverMsg = extractServerMessage(response.data)

    // SWITCH DE VALIDACIÓN DE STATUS CODE PARA SUB-SEDE
    switch (response.status) {
      case 200: {
        // En status 200 NO se presenta mensaje al usuario; entregamos la lista limpia
        const list = parseSubHeadquartersList(response.data, cleanId)
        return {
          statusCode: 200,
          data: list,
          errorMessage: null,
        }
      }

      case 204: {
        return {
          statusCode: 204,
          data: [],
          errorMessage: 'Esta sede principal no tiene subsedes secundarias asociadas.',
        }
      }

      case 400: {
        return {
          statusCode: 400,
          data: [],
          errorMessage:
            serverMsg || 'Los parámetros para consultar las subsedes son inconsistentes.',
        }
      }

      case 401: {
        return {
          statusCode: 401,
          data: [],
          errorMessage: 'Sesión no autorizada para consultar las subsedes de esta sede.',
        }
      }

      case 403: {
        return {
          statusCode: 403,
          data: [],
          errorMessage: 'No tienes los permisos asignados para consultar las subsedes.',
        }
      }

      case 404: {
        const fallbackList = DEMO_SEDES_MAP[cleanId]?.subsedes || []
        return {
          statusCode: 404,
          data: fallbackList,
          errorMessage:
            fallbackList.length > 0
              ? null
              : 'No se encontraron subsedes vinculadas a esta sede principal.',
        }
      }

      case 500: {
        return {
          statusCode: 500,
          data: [],
          errorMessage:
            serverMsg ||
            'Inconveniente interno en el servidor al consultar las subsedes vinculadas.',
        }
      }

      case 502:
      case 503:
      case 504: {
        return {
          statusCode: response.status,
          data: [],
          errorMessage:
            'El servicio de subsedes no se encuentra disponible temporalmente.',
        }
      }

      default: {
        return {
          statusCode: response.status,
          data: [],
          errorMessage:
            serverMsg ||
            `Respuesta no habitual (HTTP ${response.status}) al obtener las subsedes.`,
        }
      }
    }
  } catch {
    const fallbackList = DEMO_SEDES_MAP[cleanId]?.subsedes || []
    return {
      statusCode: 0,
      data: fallbackList,
      errorMessage:
        fallbackList.length > 0
          ? null
          : 'No se pudo comunicar con el servidor para obtener las subsedes.',
    }
  }
}

function parseHeadquarterObject(raw: unknown, fallbackId: string): HeadquarterInfo {
  let target = raw
  if (Array.isArray(raw) && raw.length > 0) {
    target = raw[0]
  } else if (typeof raw === 'object' && raw !== null && 'data' in raw) {
    target = (raw as { data: unknown }).data
    if (Array.isArray(target) && target.length > 0) {
      target = target[0]
    }
  }

  if (typeof target === 'object' && target !== null) {
    const obj = target as Record<string, unknown>
    return {
      id: String(obj.id || fallbackId),
      name: String(obj.name || fallbackId),
      city: String(obj.city || 'Ciudad no especificada'),
      address: String(obj.address || 'Dirección no registrada'),
      phone: String(obj.phone || 'Teléfono no registrado'),
      status: String(obj.status || 'active'),
      created_by: obj.created_by ? String(obj.created_by) : undefined,
      created_at: obj.created_at ? String(obj.created_at) : undefined,
      updated_at: obj.updated_at ? String(obj.updated_at) : undefined,
    }
  }

  return buildGenericFallbackSede(fallbackId)
}

function parseSubHeadquartersList(raw: unknown, hqId: string): SubHeadquarterInfo[] {
  let target = raw
  if (typeof raw === 'object' && raw !== null && 'data' in raw) {
    target = (raw as { data: unknown }).data
  }

  if (Array.isArray(target)) {
    return target.map((item, index) => {
      const obj = (typeof item === 'object' && item !== null ? item : {}) as Record<string, unknown>
      return {
        id: String(obj.id || `sub-${index + 1}`),
        headquarter_id: String(obj.headquarter_id || hqId),
        name: String(obj.name || `Sub Sede ${index + 1}`),
        address: String(obj.address || 'Dirección no registrada'),
        phone: String(obj.phone || 'Teléfono no registrado'),
        status: String(obj.status || 'active'),
        created_by: obj.created_by ? String(obj.created_by) : undefined,
        created_at: obj.created_at ? String(obj.created_at) : undefined,
        updated_at: obj.updated_at ? String(obj.updated_at) : undefined,
      }
    })
  }

  if (typeof target === 'object' && target !== null) {
    const obj = target as Record<string, unknown>
    if (obj.name || obj.id) {
      return [
        {
          id: String(obj.id || 'sub-1'),
          headquarter_id: String(obj.headquarter_id || hqId),
          name: String(obj.name || 'Sub Sede Vinculada'),
          address: String(obj.address || 'Dirección no registrada'),
          phone: String(obj.phone || 'Teléfono no registrado'),
          status: String(obj.status || 'active'),
          created_by: obj.created_by ? String(obj.created_by) : undefined,
          created_at: obj.created_at ? String(obj.created_at) : undefined,
          updated_at: obj.updated_at ? String(obj.updated_at) : undefined,
        },
      ]
    }
  }

  return []
}

function buildGenericFallbackSede(id: string): HeadquarterInfo {
  // Formatear nombre legible desde el ID (ej: "sede-central-miraflores" -> "Sede Central Miraflores")
  const humanized = id
    .replace(/^sede[-_]/i, 'Sede ')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())

  return {
    id,
    name: humanized,
    city: 'Bogotá D.C.',
    address: 'Avenida Principal # 100 - 50',
    phone: '+57 (601) 800-4000',
    status: 'active',
  }
}

function extractServerMessage(data: unknown): string | undefined {
  if (typeof data === 'object' && data !== null) {
    if ('message' in data && typeof data.message === 'string') return data.message
    if ('error' in data && typeof data.error === 'string') return data.error
    if ('detail' in data && typeof data.detail === 'string') return data.detail
  }
  return undefined
}

let cachedSedesNames: Record<string, string> | null = null

/**
 * Consulta la lista general de sedes (/headquarters) para obtener un mapa de ID -> Nombre oficial.
 * Dispone de caché en memoria y fallback instantáneo a las sedes conocidas.
 */
export async function fetchHeadquarterNamesMap(): Promise<Record<string, string>> {
  if (cachedSedesNames) return cachedSedesNames

  const map: Record<string, string> = { ...KNOWN_SEDES_NAMES }

  try {
    const response = await api.get<unknown>('/headquarters', {
      headers: { Accept: 'application/json' },
      validateStatus: () => true,
    })

    if (response.status === 200 && Array.isArray(response.data)) {
      for (const item of response.data) {
        if (item && typeof item === 'object' && 'id' in item && 'name' in item) {
          const id = String((item as { id: unknown }).id)
          const name = String((item as { name: unknown }).name)
          if (id && name) {
            map[id] = name
            map[id.toLowerCase()] = name
          }
        }
      }
      cachedSedesNames = map
      return map
    }
  } catch {
    // Si no hay conexión con el endpoint /headquarters se devuelve el catálogo precargado
  }

  cachedSedesNames = map
  return map
}
