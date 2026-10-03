import { useEffect, useState } from 'react'
import type { EdificioInfo, SedeInfo, SubSedeInfo } from '../domain/recepcion'
import { ApiRecepcionRepository } from '../infrastructure/api-recepcion-repository'

const defaultRepository = new ApiRecepcionRepository()

export function useSedeDetalle(sedeId: string | null, repository = defaultRepository) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sede, setSede] = useState<SedeInfo | null>(null)
  const [subSedes, setSubSedes] = useState<SubSedeInfo[]>([])
  const [edificios, setEdificios] = useState<EdificioInfo[]>([])

  useEffect(() => {
    if (!sedeId) {
      setSede(null)
      setSubSedes([])
      setEdificios([])
      setError(null)
      return
    }

    let isMounted = true
    setLoading(true)
    setError(null)

    void (async () => {
      try {
        const [allSedes, subsList, edificiosList] = await Promise.all([
          repository.getSedes(),
          repository.getSubSedes(sedeId),
          repository.getEdificios(sedeId),
        ])

        if (!isMounted) return

        const foundSede = allSedes.find((s) => s.id === sedeId) || null
        setSede(foundSede)
        setSubSedes(subsList)
        setEdificios(edificiosList)
      } catch (err) {
        console.error('Error al cargar detalle de sede:', err)
        if (isMounted) {
          setError('No fue posible cargar toda la información de esta sede en este momento.')
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
  }, [sedeId, repository])

  return {
    loading,
    error,
    sede,
    subSedes,
    edificios,
  }
}
