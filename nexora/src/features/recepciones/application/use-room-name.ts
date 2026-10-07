import { useEffect, useState } from 'react'
import { api } from '../../../lib/api'

/**
 * Mapeo de nombres conocidos para resolución inmediata en UI sin exponer IDs técnicos al usuario.
 */
const KNOWN_ROOM_NAMES: Record<string, string> = {
  'room-1': 'Habitación 101',
  'room-102': 'Habitación 102',
  'suite-presidencial-01': 'Suite Presidencial',
  'room-205': 'Habitación 205',
  'hab-101': 'Suite Panorámica 101',
  'hab-102': 'Habitación Ejecutiva 102',
  'hab-201': 'Apart Familiar 201',
  'hab-204': 'Doble Superior 204',
  'hab-301': 'Master Suite Presidencial 301',
}

const globalRoomNameCache: Record<string, string> = {
  ...KNOWN_ROOM_NAMES,
}

/**
 * Limpia y formatea un identificador de habitación para presentar un texto
 * humano y comprensible al usuario final, eliminando prefijos técnicos y hashes.
 */
export function formatRoomDisplayName(roomId?: string | null): string {
  if (!roomId) return 'Habitación Asignada'

  const trimmed = roomId.trim()
  if (globalRoomNameCache[trimmed]) {
    return globalRoomNameCache[trimmed]
  }

  // Detectar formato room-102, hab-201, habitacion_305
  const numberMatch = trimmed.match(/^(?:room|hab|habitacion)[-_](\d+)$/i)
  if (numberMatch && numberMatch[1]) {
    return `Habitación ${numberMatch[1]}`
  }

  // Detectar nombres con guiones (ej. suite-presidencial-01)
  if (/^[a-zA-Z]+(?:[-_][a-zA-Z0-9]+)+$/.test(trimmed) && !/^[0-9a-fA-F-]{16,}$/.test(trimmed)) {
    const words = trimmed
      .split(/[-_]+/)
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ')
    return words
  }

  // Si parece un UUID o hash técnico de base de datos (MongoDB ObjectID / UUID)
  if (/^[0-9a-fA-F]{24}$/.test(trimmed) || /^[0-9a-fA-F-]{32,}$/.test(trimmed)) {
    return 'Habitación Asignada'
  }

  // Si ya es un número o texto amigable
  if (/^\d+$/.test(trimmed)) {
    return `Habitación ${trimmed}`
  }

  return trimmed
}

/**
 * Hook para obtener el nombre legible de una habitación evitando la exposición de IDs técnicos.
 * Si no está en caché, consulta en segundo plano GET /rooms/{id}.
 */
export function useRoomName(roomId?: string | null): string {
  const [displayName, setDisplayName] = useState<string>(() => formatRoomDisplayName(roomId))

  useEffect(() => {
    if (!roomId) {
      setDisplayName('Habitación Asignada')
      return
    }

    const trimmed = roomId.trim()
    const syncName = formatRoomDisplayName(trimmed)
    setDisplayName(syncName)

    if (globalRoomNameCache[trimmed]) {
      return
    }

    let isMounted = true

    const fetchRoom = async () => {
      try {
        const res = await api.get<{ data?: { name?: string; number?: string | number } } & { name?: string; number?: string | number }>(
          `/rooms/${encodeURIComponent(trimmed)}`,
          { validateStatus: (s: number) => s === 200 }
        )
        const roomData = res.data?.data || res.data
        if (roomData && (roomData.name || roomData.number)) {
          const formatted = roomData.name
            ? roomData.name
            : `Habitación ${roomData.number}`
          globalRoomNameCache[trimmed] = formatted
          if (isMounted) {
            setDisplayName(formatted)
          }
        }
      } catch {
        // En caso de que el backend no responda, mantenemos el formateo limpio sin ID técnico
      }
    }

    void fetchRoom()

    return () => {
      isMounted = false
    }
  }, [roomId])

  return displayName
}

/**
 * Hook para resolver en lote los nombres de habitaciones de una lista de estancias.
 */
export function useRoomNames(roomIds: string[]): Record<string, string> {
  const [names, setNames] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    for (const id of roomIds) {
      initial[id] = formatRoomDisplayName(id)
    }
    return initial
  })

  useEffect(() => {
    let isMounted = true
    const updated: Record<string, string> = {}
    for (const id of roomIds) {
      updated[id] = formatRoomDisplayName(id)
    }
    setNames(updated)

    const missingIds = roomIds.filter((id) => !globalRoomNameCache[id])
    if (missingIds.length === 0) return

    void Promise.all(
      missingIds.map(async (id) => {
        try {
          const res = await api.get<{ data?: { name?: string; number?: string | number } } & { name?: string; number?: string | number }>(
            `/rooms/${encodeURIComponent(id)}`,
            { validateStatus: (s: number) => s === 200 }
          )
          const roomData = res.data?.data || res.data
          if (roomData && (roomData.name || roomData.number)) {
            const formatted = roomData.name
              ? roomData.name
              : `Habitación ${roomData.number}`
            globalRoomNameCache[id] = formatted
          }
        } catch {
          // Fallback silencioso
        }
      })
    ).then(() => {
      if (isMounted) {
        const next: Record<string, string> = {}
        for (const id of roomIds) {
          next[id] = formatRoomDisplayName(id)
        }
        setNames(next)
      }
    })

    return () => {
      isMounted = false
    }
  }, [roomIds.join(',')])

  return names
}
