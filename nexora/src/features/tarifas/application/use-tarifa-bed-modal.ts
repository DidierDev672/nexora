import { useCallback, useState } from 'react'
import type { BedTypeInfo } from '../domain/tarifa-cama'
import {
  fetchBedTypeById,
  type BedTypeResult,
} from '../infrastructure/api-tarifa-bed-service'

export interface UseTarifaBedModalReturn {
  isOpen: boolean
  bedId: string | null
  isGeneral: boolean
  bedData: BedTypeInfo | null
  loading: boolean
  errorMessage: string | null
  openBedModal: (id?: string | null) => void
  closeModal: () => void
  refetch: () => void
}

export function useTarifaBedModal(): UseTarifaBedModalReturn {
  const [isOpen, setIsOpen] = useState(false)
  const [bedId, setBedId] = useState<string | null>(null)
  const [isGeneral, setIsGeneral] = useState(false)
  const [bedData, setBedData] = useState<BedTypeInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loadData = useCallback(async (id: string | null) => {
    // Si no hay id o es null, representa una tarifa de ámbito universal (aplica a todas las habitaciones/camas)
    if (!id || id.trim() === '' || id === 'null' || id === 'undefined') {
      setIsGeneral(true)
      setBedData(null)
      setErrorMessage(null)
      setLoading(false)
      return
    }

    setIsGeneral(false)
    setLoading(true)
    setErrorMessage(null)

    try {
      const result: BedTypeResult = await fetchBedTypeById(id)

      if (result.statusCode === 200 && result.data) {
        setBedData(result.data)
        setErrorMessage(null)
      } else {
        setBedData(null)
        setErrorMessage(
          result.errorMessage ||
            'No se logró recuperar la información técnica de este tipo de cama.'
        )
      }
    } catch {
      setBedData(null)
      setErrorMessage(
        'Ocurrió una interrupción inesperada al consultar la configuración de la cama.'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  const openBedModal = useCallback(
    (id?: string | null) => {
      const cleanId = id ? id.trim() : null
      setBedId(cleanId)
      setIsOpen(true)
      void loadData(cleanId)
    },
    [loadData]
  )

  const closeModal = useCallback(() => {
    setIsOpen(false)
    setBedId(null)
    setBedData(null)
    setErrorMessage(null)
  }, [])

  const refetch = useCallback(() => {
    if (bedId) {
      void loadData(bedId)
    }
  }, [bedId, loadData])

  return {
    isOpen,
    bedId,
    isGeneral,
    bedData,
    loading,
    errorMessage,
    openBedModal,
    closeModal,
    refetch,
  }
}
