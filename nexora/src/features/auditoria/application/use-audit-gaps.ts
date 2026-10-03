import { useCallback, useEffect, useState } from 'react'
import type {
  InactiveTariffInUse,
  RoomWithoutTariff,
} from '../domain/audit-types'
import { auditRepository } from '../infrastructure/api-audit-repository'
import { useAuditScope } from './audit-scope-context'

export function useAuditGaps() {
  const { scope, refreshSummary } = useAuditScope()

  const [roomsWithoutTariff, setRoomsWithoutTariff] = useState<RoomWithoutTariff[]>([])
  const [roomsLoading, setRoomsLoading] = useState<boolean>(true)
  const [roomsError, setRoomsError] = useState<string | null>(null)

  const [tariffsInactive, setTariffsInactive] = useState<InactiveTariffInUse[]>([])
  const [tariffsLoading, setTariffsLoading] = useState<boolean>(true)
  const [tariffsError, setTariffsError] = useState<string | null>(null)

  // Estado para el modal de asignación de tarifa (reutilizando TariffPicker)
  const [assigningRoom, setAssigningRoom] = useState<RoomWithoutTariff | null>(null)
  const [isTariffPickerOpen, setIsTariffPickerOpen] = useState<boolean>(false)

  // Estado de acción en curso (reactivación o desvinculación)
  const [actionInProgress, setActionInProgress] = useState<string | null>(null)

  const fetchRoomsWithoutTariff = useCallback(async () => {
    setRoomsLoading(true)
    setRoomsError(null)
    try {
      const data = await auditRepository.getRoomsWithoutTariff(scope)
      setRoomsWithoutTariff(data)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al obtener habitaciones sin tarifa'
      setRoomsError(msg)
    } finally {
      setRoomsLoading(false)
    }
  }, [scope])

  const fetchTariffsInactiveInUse = useCallback(async () => {
    setTariffsLoading(true)
    setTariffsError(null)
    try {
      const data = await auditRepository.getTariffsInactiveInUse(scope)
      setTariffsInactive(data)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al obtener tarifas inactivas'
      setTariffsError(msg)
    } finally {
      setTariffsLoading(false)
    }
  }, [scope])

  useEffect(() => {
    void fetchRoomsWithoutTariff()
    void fetchTariffsInactiveInUse()
  }, [fetchRoomsWithoutTariff, fetchTariffsInactiveInUse])

  // Abrir TariffPicker para una habitación puntual
  const openTariffPickerForRoom = useCallback((room: RoomWithoutTariff) => {
    setAssigningRoom(room)
    setIsTariffPickerOpen(true)
  }, [])

  const closeTariffPicker = useCallback(() => {
    setAssigningRoom(null)
    setIsTariffPickerOpen(false)
  }, [])

  const onTariffAssigned = useCallback(
    (roomId: string) => {
      // Elimina de la lista de pendientes de tarifa
      setRoomsWithoutTariff((prev) => prev.filter((r) => r.id !== roomId))
      setIsTariffPickerOpen(false)
      setAssigningRoom(null)
      // Refresca el resumen global
      void refreshSummary()
    },
    [refreshSummary],
  )

  // Reactivar tarifa inactiva
  const reactivateTariff = useCallback(
    async (tariffId: string) => {
      setActionInProgress(`reactivate-${tariffId}`)
      try {
        const ok = await auditRepository.reactivateTariff(tariffId)
        if (ok) {
          setTariffsInactive((prev) => prev.filter((t) => t.tariff_id !== tariffId))
          void refreshSummary()
        }
      } catch (err) {
        console.warn('Fallo al reactivar tarifa:', err)
      } finally {
        setActionInProgress(null)
      }
    },
    [refreshSummary],
  )

  // Desvincular tarifa de las habitaciones afectadas
  const unlinkTariff = useCallback(
    async (tariffId: string, roomIds: string[]) => {
      setActionInProgress(`unlink-${tariffId}`)
      try {
        const ok = await auditRepository.unlinkTariffFromRooms(tariffId, roomIds)
        if (ok) {
          setTariffsInactive((prev) => prev.filter((t) => t.tariff_id !== tariffId))
          void refreshSummary()
          void fetchRoomsWithoutTariff()
        }
      } catch (err) {
        console.warn('Fallo al desvincular tarifa:', err)
      } finally {
        setActionInProgress(null)
      }
    },
    [fetchRoomsWithoutTariff, refreshSummary],
  )

  return {
    roomsWithoutTariff,
    roomsLoading,
    roomsError,
    refetchRooms: fetchRoomsWithoutTariff,
    tariffsInactive,
    tariffsLoading,
    tariffsError,
    refetchTariffs: fetchTariffsInactiveInUse,
    // TariffPicker
    assigningRoom,
    isTariffPickerOpen,
    openTariffPickerForRoom,
    closeTariffPicker,
    onTariffAssigned,
    // Acciones de remediación
    actionInProgress,
    reactivateTariff,
    unlinkTariff,
  }
}
