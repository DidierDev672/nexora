import { useEffect, useState } from 'react'
import type { CamaInfo, HabitacionInfo, TipoCamaInfo } from '../domain/recepcion'
import { ApiRecepcionRepository } from '../infrastructure/api-recepcion-repository'

const defaultRepository = new ApiRecepcionRepository()

export interface CamaConTipo extends CamaInfo {
  tiposDetalle: TipoCamaInfo[]
  capacidadTotal: number
}

export function useHabitacionDetalle(roomId: string | null, repository = defaultRepository) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [habitacion, setHabitacion] = useState<HabitacionInfo | null>(null)
  const [camas, setCamas] = useState<CamaConTipo[]>([])

  useEffect(() => {
    if (!roomId) {
      setHabitacion(null)
      setCamas([])
      setError(null)
      return
    }

    let isMounted = true
    setLoading(true)
    setError(null)

    void (async () => {
      try {
        const [hab, beds, tipos] = await Promise.all([
          repository.getHabitacionById(roomId),
          repository.getCamas(roomId),
          repository.getTiposCama(),
        ])

        if (!isMounted) return

        setHabitacion(hab)

        const tiposMap = new Map(tipos.map((t) => [t.id, t]))

        const camasConDetalle: CamaConTipo[] = beds.map((bed) => {
          const matchedTipos: TipoCamaInfo[] = (bed.types_bed_id || [])
            .map((tId) => tiposMap.get(tId))
            .filter((t): t is TipoCamaInfo => Boolean(t))

          const capacidad = matchedTipos.reduce((acc, curr) => acc + curr.capacity_people, 0) || 2

          return {
            ...bed,
            tiposDetalle: matchedTipos,
            capacidadTotal: capacidad,
          }
        })

        setCamas(camasConDetalle)
      } catch (err) {
        console.error('Error al cargar detalle de habitación:', err)
        if (isMounted) {
          setError('No fue posible cargar el inventario de esta habitación en este momento.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    })()

    return () => {
      isMounted = false
    }
  }, [roomId, repository])

  return {
    loading,
    error,
    habitacion,
    camas,
  }
}
