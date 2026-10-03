import { motion } from 'motion/react'
import type { NavId } from '../../dashboard/ui/navigation'
import { useConfiguraciones } from '../application/use-configuraciones'
import { ConfiguracionesHeader } from './molecules/configuraciones-header'
import { ModulosHotelSection } from './organisms/modulos-hotel-section'
import { HotelGeneralSettings } from './molecules/hotel-general-settings'

export interface ConfiguracionesPageProps {
  onNavigate: (id: NavId) => void
}

export function ConfiguracionesPage({ onNavigate }: ConfiguracionesPageProps) {
  const {
    categoriaActiva,
    setCategoriaActiva,
    busqueda,
    setBusqueda,
    modulosFiltrados,
    totalModulos,
    preferencias,
    togglePreferencia,
    setSedePredeterminada,
  } = useConfiguraciones()

  return (
    <div className="space-y-8 pb-10">
      {/* 1. Encabezado principal con animación slide-in (dirección y duración personalizables) */}
      <ConfiguracionesHeader
        totalModulos={totalModulos}
        direction="izq"
        duration={0.6}
      />

      {/* 2. Sección principal: Módulos del hotel incorporada */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <ModulosHotelSection
          onNavigate={onNavigate}
          modulos={modulosFiltrados}
          busqueda={busqueda}
          onBusquedaChange={setBusqueda}
          categoriaActiva={categoriaActiva}
          onCategoriaChange={setCategoriaActiva}
          totalModulos={totalModulos}
        />
      </motion.div>

      {/* 3. Parámetros operativos y políticas generales */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <HotelGeneralSettings
          preferencias={preferencias}
          onToggle={togglePreferencia}
          onSedeChange={setSedePredeterminada}
        />
      </motion.div>
    </div>
  )
}
