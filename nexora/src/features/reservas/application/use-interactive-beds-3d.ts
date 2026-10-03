import { useCallback, useEffect, useState } from 'react'
import type { BedItem3D, TipoCamaApiResponse } from '../domain/reserva'
import type { ReservaRepository } from '../domain/reserva-repository'

export interface UseInteractiveBeds3DResult {
  beds: BedItem3D[]
  loadingBeds: boolean
  bedsError: string | null
  refetchBeds: () => Promise<void>
}

// Catálogo demo de contingencia para resiliencia total (Offline / Backend vacío)
const FALLBACK_BEDS_3D: BedItem3D[] = [
  {
    bedId: 'bed-demo-1',
    roomId: 'room-demo-101',
    roomName: 'Suite Imperial 101',
    floorNumber: 1,
    etiquette: 'Cama 01 - Principal',
    capacity: 2,
    pricePerNight: 220000,
    typeName: 'King Size',
    status: 'disponible',
  },
  {
    bedId: 'bed-demo-2',
    roomId: 'room-demo-102',
    roomName: 'Habitación Premium 102',
    floorNumber: 1,
    etiquette: 'Cama 02 - Matrimonial',
    capacity: 2,
    pricePerNight: 185000,
    typeName: 'Queen Confort',
    status: 'disponible',
  },
  {
    bedId: 'bed-demo-3',
    roomId: 'room-demo-201',
    roomName: 'Habitación Deluxe 201',
    floorNumber: 2,
    etiquette: 'Cama 03 - Twin A',
    capacity: 1,
    pricePerNight: 125000,
    typeName: 'Twin Individual',
    status: 'disponible',
  },
  {
    bedId: 'bed-demo-4',
    roomId: 'room-demo-202',
    roomName: 'Suite Familiar 202',
    floorNumber: 2,
    etiquette: 'Cama 04 - Sofá Cama',
    capacity: 2,
    pricePerNight: 160000,
    typeName: 'Sofá Cama Modular',
    status: 'disponible',
  },
  {
    bedId: 'bed-demo-5',
    roomId: 'room-demo-301',
    roomName: 'Penthouse Panorámico 301',
    floorNumber: 3,
    etiquette: 'Cama 05 - Master King',
    capacity: 3,
    pricePerNight: 350000,
    typeName: 'King Presidencial',
    status: 'disponible',
  },
]

export function useInteractiveBeds3D(repository: ReservaRepository): UseInteractiveBeds3DResult {
  const [beds, setBeds] = useState<BedItem3D[]>([])
  const [loadingBeds, setLoadingBeds] = useState(true)
  const [bedsError, setBedsError] = useState<string | null>(null)

  const loadBeds = useCallback(async () => {
    setLoadingBeds(true)
    setBedsError(null)

    try {
      const [bedsApi, typesBedApi] = await Promise.all([
        repository.getBeds(),
        repository.getTypesBed ? repository.getTypesBed() : Promise.resolve([] as TipoCamaApiResponse[]),
      ])

      const typesMap = new Map<string, TipoCamaApiResponse>()
      for (const t of typesBedApi) {
        typesMap.set(t.id, t)
      }

      if (bedsApi.length === 0) {
        // Fallback resiliente
        setBeds(FALLBACK_BEDS_3D)
        return
      }

      // Enriquecer cada cama con su habitación y tipo 3D
      const enrichedBeds: BedItem3D[] = await Promise.all(
        bedsApi.map(async (b, index) => {
          let roomName = `Habitación ${b.room_id.slice(0, 6)}`
          let floorNumber: number | string = 1
          let price = 185000 + (index % 3) * 35000

          try {
            const room = await repository.getRoom(b.room_id)
            if (room && room.name) {
              roomName = room.name
              if (room.floor) floorNumber = room.floor
              if (typeof room.price === 'number' && room.price > 0) price = room.price
            }
          } catch {
            // Continúa con valores predeterminados
          }

          // Resolver tipo de confort
          let typeName = 'Queen Confort'
          let capacity = 2
          const typeId = Array.isArray(b.types_bed_id) && b.types_bed_id.length > 0 ? b.types_bed_id[0] : undefined

          if (typeId && typesMap.has(typeId)) {
            const foundType = typesMap.get(typeId)!
            typeName = foundType.name
            capacity = foundType.capacity_people || 2
          } else {
            const etiquetteLower = (b.etiquette || '').toLowerCase()
            if (etiquetteLower.includes('king')) {
              typeName = 'King Size'
              capacity = 2
            } else if (etiquetteLower.includes('sofa') || etiquetteLower.includes('sofá')) {
              typeName = 'Sofá Cama'
              capacity = 2
            } else if (etiquetteLower.includes('twin') || etiquetteLower.includes('indiv')) {
              typeName = 'Twin Individual'
              capacity = 1
            }
          }

          const etiquette = b.etiquette && b.etiquette !== 'N/A' ? b.etiquette : `Cama ${String(index + 1).padStart(2, '0')}`

          return {
            bedId: b.id,
            roomId: b.room_id,
            roomName,
            floorNumber,
            etiquette,
            capacity,
            pricePerNight: price,
            typeName,
            typeBedId: typeId,
            status: b.status || 'disponible',
          }
        }),
      )

      setBeds(enrichedBeds.length > 0 ? enrichedBeds : FALLBACK_BEDS_3D)
    } catch {
      setBedsError('No fue posible sincronizar el catálogo de camas. Se habilitó el catálogo seguro de contingencia.')
      setBeds(FALLBACK_BEDS_3D)
    } finally {
      setLoadingBeds(false)
    }
  }, [repository])

  useEffect(() => {
    void loadBeds()
  }, [loadBeds])

  return {
    beds,
    loadingBeds,
    bedsError,
    refetchBeds: loadBeds,
  }
}
