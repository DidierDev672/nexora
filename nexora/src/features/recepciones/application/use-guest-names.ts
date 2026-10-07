import { useEffect, useState } from 'react'
import { fetchPersonById, SAMPLE_PERSONS } from '../infrastructure/stays-api'

/**
 * Caché en memoria para evitar peticiones redundantes a GET /person/{id}.
 * Se inicializa con los nombres de muestra conocidos para resolución inmediata.
 */
const globalGuestNameCache: Record<string, string> = {
  ...Object.fromEntries(
    Object.entries(SAMPLE_PERSONS).map(([id, person]) => [id, person.name])
  ),
}

/**
 * Hook para resolver y almacenar en caché los nombres de los huéspedes a partir de sus IDs.
 * Consume GET /person/{id} de forma asíncrona cuando un ID no se encuentra en caché.
 */
export function useGuestNames(personIds: string[]): Record<string, string> {
  const [names, setNames] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    for (const id of personIds) {
      if (globalGuestNameCache[id]) {
        initial[id] = globalGuestNameCache[id]
      }
    }
    return initial
  })

  const idsKey = personIds.join(',')

  useEffect(() => {
    let isMounted = true

    // Identificar IDs faltantes en caché
    const missingIds = personIds.filter((id) => !globalGuestNameCache[id])

    if (missingIds.length === 0) {
      setNames((prev) => {
        let changed = false
        const next = { ...prev }
        for (const id of personIds) {
          if (next[id] !== globalGuestNameCache[id]) {
            next[id] = globalGuestNameCache[id]
            changed = true
          }
        }
        return changed ? next : prev
      })
      return
    }

    // Consultar asíncronamente GET /person/{id} para los IDs desconocidos
    void Promise.all(
      missingIds.map(async (id) => {
        try {
          const res = await fetchPersonById(id)
          if (res.data?.name) {
            globalGuestNameCache[id] = res.data.name
          }
        } catch {
          // Ignorar fallo puntual
        }
      })
    ).then(() => {
      if (isMounted) {
        setNames((prev) => {
          const next = { ...prev }
          for (const id of personIds) {
            if (globalGuestNameCache[id]) {
              next[id] = globalGuestNameCache[id]
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

  return names
}
