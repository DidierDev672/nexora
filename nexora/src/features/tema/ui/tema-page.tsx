import { useState } from 'react'
import { PaletteHeader } from './molecules/palette-header'
import { CustomThemePage } from './organisms/custom-theme-page'
import { PalettePanel } from './organisms/palette-panel'

export function TemaPage() {
  const [view, setView] = useState<'palettes' | 'custom'>('palettes')

  return (
    <div className="min-h-screen bg-canvas px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <div className={view === 'custom' ? 'hidden' : undefined}>
          <PaletteHeader />
          <PalettePanel onOpenCustom={() => setView('custom')} />
        </div>

        {view === 'custom' && <CustomThemePage onBack={() => setView('palettes')} />}
      </div>
    </div>
  )
}