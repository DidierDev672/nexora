import { useCallback, useState } from 'react'
import type { HeadquarterInfo, SubHeadquarterInfo } from '../domain/tarifa-sede'
import {
  fetchHeadquarterById,
  fetchSubHeadquartersByHq,
} from '../infrastructure/api-tarifa-sede-service'

export function useTarifaSedeModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [headquarterId, setHeadquarterId] = useState<string | null>(null)
  const [sedeData, setSedeData] = useState<HeadquarterInfo | null>(null)
  const [subSedes, setSubSedes] = useState<SubHeadquarterInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [sedeError, setSedeError] = useState<string | null>(null)
  const [subSedeError, setSubSedeError] = useState<string | null>(null)

  const loadSedeInfo = useCallback(async (id: string) => {
    setLoading(true)
    setSedeError(null)
    setSubSedeError(null)

    try {
      // Peticiones en paralelo para Sede y Subsedes
      const [sedeResult, subSedesResult] = await Promise.all([
        fetchHeadquarterById(id),
        fetchSubHeadquartersByHq(id),
      ])

      setSedeData(sedeResult.data)
      setSedeError(sedeResult.errorMessage)

      setSubSedes(subSedesResult.data)
      setSubSedeError(subSedesResult.errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const openSedeModal = useCallback(
    (id: string) => {
      setHeadquarterId(id)
      setIsOpen(true)
      void loadSedeInfo(id)
    },
    [loadSedeInfo],
  )

  const closeModal = useCallback(() => {
    setIsOpen(false)
    setHeadquarterId(null)
    setSedeData(null)
    setSubSedes([])
    setSedeError(null)
    setSubSedeError(null)
  }, [])

  const refetch = useCallback(() => {
    if (headquarterId) {
      void loadSedeInfo(headquarterId)
    }
  }, [headquarterId, loadSedeInfo])

  return {
    isOpen,
    headquarterId,
    sedeData,
    subSedes,
    loading,
    sedeError,
    subSedeError,
    openSedeModal,
    closeModal,
    refetch,
  }
}
