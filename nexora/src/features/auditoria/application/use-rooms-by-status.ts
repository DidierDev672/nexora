import { useCallback, useEffect, useState } from 'react'
import type {
  PhysicalCheckRecord,
  RoomAuditItem,
  RoomAuditStatus,
} from '../domain/audit-types'
import { auditRepository } from '../infrastructure/api-audit-repository'
import { useAuditScope } from './audit-scope-context'

export function useRoomsByStatus() {
  const { scope, selectedRoomStatus, setSelectedRoomStatus } = useAuditScope()
  const [rooms, setRooms] = useState<RoomAuditItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRooms = useCallback(
    async (status: RoomAuditStatus) => {
      setLoading(true)
      setError(null)
      try {
        const data = await auditRepository.getRoomsByStatus(status, scope)
        setRooms(data)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error al obtener habitaciones'
        setError(msg)
      } finally {
        setLoading(false)
      }
    },
    [scope],
  )

  useEffect(() => {
    void fetchRooms(selectedRoomStatus)
  }, [fetchRooms, selectedRoomStatus])

  const setPhysicalCheck = useCallback(
    async (roomId: string, check: PhysicalCheckRecord) => {
      await auditRepository.savePhysicalCheck(roomId, check)
      setRooms((prev) =>
        prev.map((r) => (r.id === roomId ? { ...r, physical_check: check } : r)),
      )
    },
    [],
  )

  return {
    selectedStatus: selectedRoomStatus,
    setSelectedStatus: setSelectedRoomStatus,
    rooms,
    loading,
    error,
    refetch: () => fetchRooms(selectedRoomStatus),
    setPhysicalCheck,
  }
}
