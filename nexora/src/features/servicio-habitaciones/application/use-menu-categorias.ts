import { useState, useEffect, useCallback, useMemo } from 'react'
import type { StatusCodeValidationResult } from '../../../shared/lib/status-code-validator'
import type { MenuCategoria } from '../domain/menu-categoria'
import { obtenerMenuCategoriasApi } from '../infrastructure/api-menu-categoria-repository'

export type CriterioOrden = 'order-asc' | 'order-desc' | 'name-asc' | 'name-desc'

export function useMenuCategorias() {
  const [categorias, setCategorias] = useState<MenuCategoria[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [feedback, setFeedback] = useState<StatusCodeValidationResult | null>(null)
  const [usandoFallback, setUsandoFallback] = useState<boolean>(false)

  // Filtros reactivos de la interfaz de usuario
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectedBuilding, setSelectedBuilding] = useState<string>('todos')
  const [selectedHeadquarter, setSelectedHeadquarter] = useState<string>('todas')
  const [orden, setOrden] = useState<CriterioOrden>('order-asc')

  // Carga inicial y refetch manual
  const cargarCategorias = useCallback(async () => {
    setLoading(true)
    setFeedback(null)
    try {
      const res = await obtenerMenuCategoriasApi()
      setCategorias(res.categorias)
      setFeedback(res.validation)
      setUsandoFallback(res.usandoFallback)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void cargarCategorias()
  }, [cargarCategorias])

  // Lista única de edificios y sedes presentes en las categorías para poblar filtros
  const edificiosDisponibles = useMemo(() => {
    const set = new Set<string>()
    categorias.forEach((c) => {
      if (c.building_id) set.add(c.building_id)
    })
    return Array.from(set)
  }, [categorias])

  const sedesDisponibles = useMemo(() => {
    const set = new Set<string>()
    categorias.forEach((c) => {
      if (c.headquartes_id) set.add(c.headquartes_id)
    })
    return Array.from(set)
  }, [categorias])

  // Filtrado y ordenamiento en memoria optimizado
  const categoriasFiltradas = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()

    const filtradas = categorias.filter((item) => {
      // Filtro de texto (nombre o descripción)
      const coincideTexto =
        !term ||
        item.name.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term)

      // Filtro de edificio
      const coincideEdificio =
        selectedBuilding === 'todos' || item.building_id === selectedBuilding

      // Filtro de sede
      const coincideSede =
        selectedHeadquarter === 'todas' || item.headquartes_id === selectedHeadquarter

      return coincideTexto && coincideEdificio && coincideSede
    })

    // Ordenamiento
    return filtradas.sort((a, b) => {
      if (orden === 'order-asc') return a.order - b.order
      if (orden === 'order-desc') return b.order - a.order
      if (orden === 'name-asc') return a.name.localeCompare(b.name)
      if (orden === 'name-desc') return b.name.localeCompare(a.name)
      return 0
    })
  }, [categorias, searchTerm, selectedBuilding, selectedHeadquarter, orden])

  // Reset de filtros
  const limpiarFiltros = () => {
    setSearchTerm('')
    setSelectedBuilding('todos')
    setSelectedHeadquarter('todas')
    setOrden('order-asc')
  }

  return {
    categorias,
    categoriasFiltradas,
    loading,
    feedback,
    usandoFallback,
    searchTerm,
    setSearchTerm,
    selectedBuilding,
    setSelectedBuilding,
    selectedHeadquarter,
    setSelectedHeadquarter,
    orden,
    setOrden,
    edificiosDisponibles,
    sedesDisponibles,
    recargar: cargarCategorias,
    limpiarFiltros,
  }
}
