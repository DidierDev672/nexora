import { useState } from 'react'
import { motion } from 'motion/react'
import { SedesHeader } from './molecules/sedes-header'
import { SedesPanel } from './organisms/sedes-panel'
import type { SedesViewMode } from './molecules/sedes-view-switch'

export function SedesPage() {
  const [viewMode, setViewMode] = useState<SedesViewMode>('cards')

  return (
    <div className="min-h-screen bg-canvas px-4 py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mx-auto w-full max-w-7xl space-y-8"
      >
        <SedesHeader />

        <SedesPanel viewMode={viewMode} onViewModeChange={setViewMode} />
      </motion.div>
    </div>
  )
}