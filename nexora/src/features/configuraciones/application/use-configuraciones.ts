import { useState, useMemo } from 'react'
import {
  type ModuloCategoria,
  type PreferenciasHotel,
  PREFERENCIAS_HOTEL_DEFAULT,
  MODULO_A_CATEGORIA,
} from '../domain/configuracion'
import { DASHBOARD_CARDS, type DashboardCardDefinition } from '../../dashboard/domain/dashboard-card'

export function useConfiguraciones() {
  const [categoriaActiva, setCategoriaActiva] = useState<ModuloCategoria>('todas')
  const [busqueda, setBusqueda] = useState('')
  const [preferencias, setPreferencias] = useState<PreferenciasHotel>(PREFERENCIAS_HOTEL_DEFAULT)

  const modulosFiltrados = useMemo(() => {
    return DASHBOARD_CARDS.filter((card: DashboardCardDefinition) => {
      // Filtro por categoría
      if (categoriaActiva !== 'todas') {
        const categoriaModulo = MODULO_A_CATEGORIA[card.id]
        if (categoriaModulo !== categoriaActiva) {
          return false
        }
      }

      // Filtro por texto de búsqueda
      if (busqueda.trim() !== '') {
        const query = busqueda.toLowerCase().trim()
        const matchesTitle = card.title.toLowerCase().includes(query)
        const matchesSubtitle = card.subtitle.toLowerCase().includes(query)
        const matchesDescription = card.description.toLowerCase().includes(query)
        const matchesBadge = card.badgeText.toLowerCase().includes(query)
        return matchesTitle || matchesSubtitle || matchesDescription || matchesBadge
      }

      return true
    })
  }, [categoriaActiva, busqueda])

  const togglePreferencia = (clave: keyof PreferenciasHotel) => {
    setPreferencias((prev) => {
      if (typeof prev[clave] === 'boolean') {
        return { ...prev, [clave]: !prev[clave] }
      }
      return prev
    })
  }

  const setSedePredeterminada = (sedeId: string) => {
    setPreferencias((prev) => ({ ...prev, sedePredeterminadaId: sedeId }))
  }

  return {
    categoriaActiva,
    setCategoriaActiva,
    busqueda,
    setBusqueda,
    modulosFiltrados,
    totalModulos: DASHBOARD_CARDS.length,
    preferencias,
    togglePreferencia,
    setSedePredeterminada,
  }
}
