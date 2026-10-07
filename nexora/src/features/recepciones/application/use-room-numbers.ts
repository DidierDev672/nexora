import { useEffect, useState } from 'react'
import { fetchRoomById, SAMPLE_ROOMS } from '../infrastructure/room-api'

const globalRoomNumberCache: Record<string, string> = {
  ...Object.fromEntries(
    Object.entries(SAMPLE_ROOMS).map(([id, r]) => [id, r.number])
  ),
}

/**
 * Hook para resolver y almacenar en caché los números de habitación (`number`)
 * a partir de sus IDs consumiendo GET /room/{id} con Axios y validando con validateStatusCode.
 */
export function useRoomNumbers(roomIds: string[]): Record<string, string> {
  const [numbers, setNumbers] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    for (const id of roomIds) {
      if (globalRoomNumberCache[id]) {
        initial[id] = globalRoomNumberCache[id]
      } else {
        // Extracción preventiva de dígitos si el formato es room-102 o hab-201
        const match = id.match(/^(?:room|hab|habitacion)[-_]?(\d+)$/i)
        initial[id] = match ? match[1] : id
      }
    }
    return initial
  })

  const idsKey = roomIds.join(',')

  useEffect(() => {
    let isMounted = true

    const missingIds = roomIds.filter((id) => !globalRoomNumberCache[id])

    if (missingIds.length === 0) {
      setNumbers((prev) => {
        let changed = false
        const next = { ...prev }
        for (const id of roomIds) {
          if (next[id] !== globalRoomNumberCache[id]) {
            next[id] = globalRoomNumberCache[id]
            changed = true
          }
        }
        return changed ? next : prev
      })
      return
    }

    void Promise.all(
      missingIds.map(async (id) => {
        try {
          const res = await fetchRoomById(id)
          if (res.validation.isValid && res.data?.number) {
            globalRoomNumberCache[id] = String(res.data.number)
          }
        } catch {
          // Ignorar fallo puntual
        }
      })
    ).then(() => {
      if (isMounted) {
        setNumbers((prev) => {
          const next = { ...prev }
          for (const id of roomIds) {
            if (globalRoomNumberCache[id]) {
              next[id] = globalRoomNumberCache[id]
            }
          }
          return next
        })
      }
    })

    return () => {
      isMounted = false
    }
  }, [idsKey])

  return numbers
}

/**
 * Hook individual para resolver el número (`number`) de una habitación por su id.
 */
export function useRoomNumber(roomId?: string | null): string {
  const [roomNumber, setRoomNumber] = useState<string>(() => {
    if (!roomId) return ''
    if (globalRoomNumberCache[roomId]) return globalRoomNumberCache[roomId]
    const match = roomId.match(/^(?:room|hab|habitacion)[-_]?(\d+)$/i)
    return match ? match[1] : ''
  })

  useEffect(() => {
    if (!roomId) {
      setRoomNumber('')
      return
    }

    if (globalRoomNumberCache[roomId]) {
      setRoomNumber(globalRoomNumberCache[roomId])
      return
    }

    let isMounted = true

    void fetchRoomById(roomId).then((res) => {
      if (!isMounted) return
      if (res.validation.isValid && res.data?.number) {
        const num = String(res.data.number)
        globalRoomNumberCache[roomId] = num
        setRoomNumber(num)
      }
    })

    return () => {
      isMounted = false
    }
  }, [roomId])

  return roomNumber
}

