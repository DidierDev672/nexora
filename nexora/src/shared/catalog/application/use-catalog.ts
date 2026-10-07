import { useEffect, useState } from 'react'
import { catalogApi, type CatalogQueryResult } from '../infrastructure/catalog-api-client'
import type {
  PersonCatalogItem,
  RoomCatalogItem,
  RoomTypeCatalogItem,
  BedTypeCatalogItem,
  BuildingCatalogItem,
  HeadquarterCatalogItem,
  SubHeadquarterCatalogItem,
  RoleCatalogItem,
} from '../domain/catalog-types'
import type { StatusCodeValidationResult } from '../../lib/status-code-validator'

export interface HookQueryResult<T> {
  data: T | null
  loading: boolean
  validation: StatusCodeValidationResult | null
  reload: () => Promise<void>
}

function useCatalogQuery<T>(
  id: string | null | undefined,
  fetcher: (id: string) => Promise<CatalogQueryResult<T>>
): HookQueryResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState<boolean>(Boolean(id))
  const [validation, setValidation] = useState<StatusCodeValidationResult | null>(null)

  const execute = async () => {
    if (!id || !id.trim()) {
      setData(null)
      setLoading(false)
      setValidation(null)
      return
    }

    setLoading(true)
    const res = await fetcher(id)
    setData(res.data)
    setValidation(res.validation)
    setLoading(false)
  }

  useEffect(() => {
    let isMounted = true
    if (!id || !id.trim()) {
      setData(null)
      setLoading(false)
      setValidation(null)
      return
    }

    setLoading(true)
    void fetcher(id).then((res) => {
      if (!isMounted) return
      setData(res.data)
      setValidation(res.validation)
      setLoading(false)
    })

    return () => {
      isMounted = false
    }
  }, [id])

  return {
    data,
    loading,
    validation,
    reload: execute,
  }
}

/**
 * Hook para consultar Huéspedes / Personas (GET /person/{id})
 */
export function useCatalogPerson(personId?: string | null): HookQueryResult<PersonCatalogItem> {
  return useCatalogQuery(personId, catalogApi.getPerson)
}

/**
 * Hook para consultar Habitaciones (GET /room/{id})
 */
export function useCatalogRoom(roomId?: string | null): HookQueryResult<RoomCatalogItem> {
  return useCatalogQuery(roomId, catalogApi.getRoom)
}

/**
 * Hook para consultar Tipos de Habitación (GET /room-types/{id})
 */
export function useCatalogRoomType(roomTypeId?: string | null): HookQueryResult<RoomTypeCatalogItem> {
  return useCatalogQuery(roomTypeId, catalogApi.getRoomType)
}

/**
 * Hook para consultar Tipos de Cama (GET /types-bed/{id})
 */
export function useCatalogBedType(bedTypeId?: string | null): HookQueryResult<BedTypeCatalogItem> {
  return useCatalogQuery(bedTypeId, catalogApi.getBedType)
}

/**
 * Hook para consultar Edificios (GET /building/{id})
 */
export function useCatalogBuilding(buildingId?: string | null): HookQueryResult<BuildingCatalogItem> {
  return useCatalogQuery(buildingId, catalogApi.getBuilding)
}

/**
 * Hook para consultar Sedes Principales (GET /headquarters/{id})
 */
export function useCatalogHeadquarter(headquartersId?: string | null): HookQueryResult<HeadquarterCatalogItem> {
  return useCatalogQuery(headquartersId, catalogApi.getHeadquarter)
}

/**
 * Hook para consultar Subsedes Secundarias (GET /sub-headquarters/{id})
 */
export function useCatalogSubHeadquarter(subHeadquartersId?: string | null): HookQueryResult<SubHeadquarterCatalogItem> {
  return useCatalogQuery(subHeadquartersId, catalogApi.getSubHeadquarter)
}

/**
 * Hook para consultar Roles de Usuario (GET /roles/{id}) con validación de status code
 */
export function useCatalogRole(roleId?: string | null): HookQueryResult<RoleCatalogItem> {
  return useCatalogQuery(roleId, catalogApi.getRole)
}

/**
 * Hook orquestador de jerarquía de Edificio (Edificio + Sede + Subsede).
 * Resuelve automáticamente las relaciones sin que la vista tenga que anidar llamadas manuales.
 */
export function useCatalogBuildingHierarchy(buildingId?: string | null) {
  const building = useCatalogBuilding(buildingId)
  const headquarter = useCatalogHeadquarter(building.data?.headquarters_id)
  const subHeadquarter = useCatalogSubHeadquarter(building.data?.sub_headquarters_id)

  return {
    building: building.data,
    buildingLoading: building.loading,
    headquarter: headquarter.data,
    headquarterLoading: headquarter.loading,
    subHeadquarter: subHeadquarter.data,
    subHeadquarterLoading: subHeadquarter.loading,
    loading: building.loading || headquarter.loading,
  }
}
