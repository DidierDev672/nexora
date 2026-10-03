import { useCallback, useState } from 'react'
import { motion } from 'motion/react'
import { fadeIn } from '../../../design-tokens/motion'
import { Loader } from './atoms/loader'
import { Cama3dHeader } from './molecules/cama3d-header'
import { TiposCamaGrid } from './organisms/tipos-cama-grid'
import { AsignarCamaCard } from './organisms/asignar-cama-card'

export function Cama3dPage() {
  const [lista, setLista] = useState(false)

  const handleReady = useCallback(() => setLista(true), [])

  return (
    <div className="min-h-screen bg-canvas px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-10">
        <Cama3dHeader />

        {/* Catálogo completo de cards con modelos 3D de las camas */}
        <motion.div variants={fadeIn} initial="hidden" animate="visible">
          <TiposCamaGrid onReady={handleReady} />
        </motion.div>

        {/* Sección: Asignar camas a tu habitación */}
        <AsignarCamaCard />
      </div>

      <Loader
        overlay
        visible={!lista}
        size={48}
        label="Montando el taller 3D…"
      >
        <span className="max-w-xs text-center text-xs leading-relaxed text-ink-soft">
          En segundo plano estamos construyendo los modelos de las camas y los sofás. Apenas estén listos,
          los deslizamos hasta tu pantalla.
        </span>
      </Loader>
    </div>
  )
}