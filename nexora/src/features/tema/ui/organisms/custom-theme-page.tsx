import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { slideIn, fadeIn } from '../../../../design-tokens/motion'
import { useTemaStore } from '../../application/tema-store'
import {
  applyPaletteToDocument,
  clearPaletteFromDocument,
  paletteToTokens,
} from '../../application/palette-theme'
import type { Palette } from '../../domain/palette'
import { ColorMenuBar } from '../molecules/color-menu-bar'
import {
  ThemeBottomMenu,
  type ThemeElementKey,
  THEME_BOTTOM_ITEMS,
} from '../molecules/theme-bottom-menu'

export interface CustomThemePageProps {
  onBack: () => void
}

const DEFAULT_ELEMENT_COLORS: Record<ThemeElementKey, string> = {
  titulo: '#5A311F',
  subtitulo: '#67543E',
  parrafos: '#6D6E76',
  navbar: '#F5E6C5',
  sidebar: '#222222',
  card: '#FFFFFF',
  pildoras: '#FF6E1F',
}

export function CustomThemePage({ onBack }: CustomThemePageProps) {
  const appliedPalette = useTemaStore((state) => state.appliedPalette)
  const applyPalette = useTemaStore((state) => state.applyPalette)
  const resetToDefault = useTemaStore((state) => state.resetToDefault)

  const initialElementColors = useMemo(() => {
    if (!appliedPalette?.colors?.length) return DEFAULT_ELEMENT_COLORS
    const tokens = paletteToTokens(appliedPalette)
    return {
      titulo: tokens.primary || DEFAULT_ELEMENT_COLORS.titulo,
      subtitulo: tokens.secondary || DEFAULT_ELEMENT_COLORS.subtitulo,
      parrafos: tokens.neutral || DEFAULT_ELEMENT_COLORS.parrafos,
      navbar: tokens.canvas || DEFAULT_ELEMENT_COLORS.navbar,
      sidebar: tokens.sidebar || DEFAULT_ELEMENT_COLORS.sidebar,
      card: tokens.panel || DEFAULT_ELEMENT_COLORS.card,
      pildoras: tokens.surface || DEFAULT_ELEMENT_COLORS.pildoras,
    }
  }, [appliedPalette])

  const [activeElement, setActiveElement] = useState<ThemeElementKey>('titulo')
  const [elementColors, setElementColors] =
    useState<Record<ThemeElementKey, string>>(initialElementColors)
  const [selectedColor, setSelectedColor] = useState<string | null>(
    initialElementColors.titulo,
  )
  const [isApplied, setIsApplied] = useState(false)
  const [feedbackBanner, setFeedbackBanner] = useState<{
    type: 'applied' | 'reset'
    title: string
    description: string
  } | null>(null)

  const activeItem = THEME_BOTTOM_ITEMS.find((item) => item.id === activeElement)

  const handleColorSelect = (hex: string) => {
    setSelectedColor(hex)
    setElementColors((prev) => ({
      ...prev,
      [activeElement]: hex,
    }))
    setIsApplied(false)
    setFeedbackBanner(null)
  }

  const handleSelectElement = (key: ThemeElementKey) => {
    setActiveElement(key)
    setSelectedColor(elementColors[key] ?? null)
  }

  const handleApplyTheme = () => {
    const customPalette: Palette = {
      name: 'Tema personalizado',
      isDefined: true,
      colors: [
        { name: 'primary titulo', hex: elementColors.titulo },
        { name: 'secondary subtitulo', hex: elementColors.subtitulo },
        { name: 'neutral parrafos ink texto', hex: elementColors.parrafos },
        { name: 'canvas navbar fondo', hex: elementColors.navbar },
        { name: 'sidebar barra lateral', hex: elementColors.sidebar },
        { name: 'panel card tarjeta', hex: elementColors.card },
        { name: 'surface pildoras', hex: elementColors.pildoras },
      ],
    }

    applyPalette(customPalette)
    applyPaletteToDocument(customPalette)
    setIsApplied(true)
    setFeedbackBanner({
      type: 'applied',
      title: '¡Tu tema personalizado ha sido aplicado con éxito!',
      description:
        'Tus elecciones cromáticas para títulos, subtítulos, párrafos, navbar, sidebar, tarjetas y píldoras están ahora activas en toda la aplicación.',
    })
  }

  const handleResetDefaultTheme = () => {
    resetToDefault()
    clearPaletteFromDocument()
    setElementColors(DEFAULT_ELEMENT_COLORS)
    setSelectedColor(DEFAULT_ELEMENT_COLORS[activeElement])
    setIsApplied(false)
    setFeedbackBanner({
      type: 'reset',
      title: 'Tema predeterminado restaurado',
      description:
        'Se han restablecido los colores originales de la plataforma. La interfaz ha vuelto a su diseño predeterminado con total armonía visual.',
    })
  }

  // Helper que aplica el efecto slide in únicamente al elemento seleccionado
  const getSelectedMotionProps = (key: ThemeElementKey) => {
    const isSelected = activeElement === key
    return {
      key: `${key}-${isSelected ? 'selected' : 'idle'}`,
      ...(isSelected
        ? {
            initial: { opacity: 0, x: -36 },
            animate: { opacity: 1, x: 0 },
            transition: { duration: 0.35, ease: 'easeOut' as const },
          }
        : {}),
    }
  }

  return (
    <section
      aria-label="Personalizar tema a medida"
      className="mt-8 space-y-6 pb-40"
    >
      {/* Encabezado */}
      <motion.div
        variants={slideIn}
        initial="hidden"
        animate="visible"
        className="relative overflow-hidden rounded-2xl border border-line bg-panel px-6 py-8 shadow-sm sm:px-10 sm:py-10"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-r from-primary/10 via-primary/5 to-transparent"
        />
        <div className="relative max-w-xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Personalización · A medida
          </p>
          <h1 className="mt-3 text-2xl font-bold text-ink sm:text-3xl">
            Personalizá tu propio tema
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            Selecciona un elemento en el menú inferior y elige un color de la barra superior para
            diseñar tu estilo a medida.
          </p>
        </div>
      </motion.div>

      {/* Barra de menú para los colores con botones Aplicar tema y Restablecer tema predeterminado */}
      <ColorMenuBar
        selectedColor={selectedColor}
        onSelectColor={handleColorSelect}
        onApplyTheme={handleApplyTheme}
        isApplied={isApplied}
        onResetDefaultTheme={handleResetDefaultTheme}
      />

      {/* Mensaje de confirmación psicológica al aplicar o restablecer el tema */}
      <AnimatePresence>
        {feedbackBanner && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className={`flex flex-col gap-3 rounded-xl border p-4 text-ink shadow-sm sm:flex-row sm:items-center sm:justify-between ${
              feedbackBanner.type === 'applied'
                ? 'border-emerald-500/30 bg-emerald-500/10'
                : 'border-primary/30 bg-primary/10'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
                  feedbackBanner.type === 'applied'
                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                    : 'bg-primary/20 text-primary'
                }`}
              >
                {feedbackBanner.type === 'applied' ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-5"
                    aria-hidden="true"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-5"
                    aria-hidden="true"
                  >
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                  </svg>
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-ink">
                  {feedbackBanner.title}
                </p>
                <p className="text-xs text-ink-muted">
                  {feedbackBanner.description}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFeedbackBanner(null)}
              className="self-end sm:self-auto rounded-lg px-3 py-1 text-xs font-semibold text-ink-muted hover:text-ink hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              Entendido
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Banner de elemento actualmente activo para edición */}
      <motion.div
        key={`banner-${activeElement}`}
        initial={{ opacity: 0, x: -28 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="flex flex-col gap-3 rounded-xl border border-line bg-panel p-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-3">
          <span
            style={{
              backgroundColor: elementColors[activeElement],
              borderRadius: '6px',
            }}
            className="size-9 shadow-inner ring-1 ring-black/10 dark:ring-white/10 shrink-0"
            aria-hidden="true"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                Elemento en edición:
              </span>
              <span className="font-bold text-primary">{activeItem?.label}</span>
            </div>
            <p className="text-xs text-ink-muted">
              Color asignado:{' '}
              <strong className="font-mono text-ink">
                {elementColors[activeElement]}
              </strong>
            </p>
          </div>
        </div>

        <p className="text-xs text-ink-muted">
          Haz clic en cualquier color de la barra superior para cambiar el tono de{' '}
          <strong className="text-ink">{activeItem?.label}</strong>.
        </p>
      </motion.div>

      {/* Maqueta de previsualización en vivo (Live Preview) */}
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="overflow-hidden rounded-2xl border border-line bg-canvas p-4 shadow-sm sm:p-6"
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
            Vista previa interactiva
          </h3>
          <span className="text-[11px] text-ink-muted">
            El elemento seleccionado se desliza hacia adentro para resaltar su edición
          </span>
        </div>

        {/* Simulación de interfaz con los 7 elementos */}
        <div className="flex flex-col overflow-hidden rounded-xl border border-line bg-panel shadow-sm">
          {/* 1. Navbar */}
          <motion.button
            type="button"
            onClick={() => handleSelectElement('navbar')}
            {...getSelectedMotionProps('navbar')}
            style={{ backgroundColor: elementColors.navbar }}
            className={`flex w-full items-center justify-between border-b border-black/10 px-4 py-2.5 text-left transition-colors ${
              activeElement === 'navbar'
                ? 'ring-2 ring-primary ring-inset shadow-xs'
                : 'hover:opacity-95'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="size-3.5 rounded-full bg-black/20" />
              <span className="text-xs font-bold text-ink">Nexora App</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                style={{
                  backgroundColor: elementColors.pildoras,
                  color: '#fff',
                }}
                className="rounded-full px-2 py-0.5 text-[10px] font-bold shadow-xs"
              >
                Navbar
              </span>
            </div>
          </motion.button>

          {/* Cuerpo: Sidebar + Card principal */}
          <div className="flex min-h-[220px]">
            {/* 2. Sidebar */}
            <motion.button
              type="button"
              onClick={() => handleSelectElement('sidebar')}
              {...getSelectedMotionProps('sidebar')}
              style={{ backgroundColor: elementColors.sidebar }}
              className={`w-36 shrink-0 border-r border-black/10 p-3 text-left transition-colors ${
                activeElement === 'sidebar'
                  ? 'ring-2 ring-primary ring-inset shadow-xs'
                  : 'hover:opacity-95'
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                Sidebar
              </span>
              <ul className="mt-2 space-y-1.5 text-xs text-white/90">
                <li className="rounded px-2 py-1 bg-white/10 font-medium">Panel</li>
                <li className="rounded px-2 py-1 text-white/60">Recursos</li>
                <li className="rounded px-2 py-1 text-white/60">Ajustes</li>
              </ul>
            </motion.button>

            {/* Área de contenido con Card, Título, Sub título, Párrafos y Píldoras */}
            <div className="flex-1 p-5">
              {/* 3. Card */}
              <motion.div
                onClick={() => handleSelectElement('card')}
                {...getSelectedMotionProps('card')}
                style={{
                  backgroundColor: elementColors.card,
                  borderRadius: '10px',
                }}
                className={`w-full border border-line p-5 text-left shadow-xs transition-colors cursor-pointer ${
                  activeElement === 'card'
                    ? 'ring-2 ring-primary shadow-md'
                    : 'hover:shadow-md'
                }`}
              >
                {/* 4. Título */}
                <motion.h4
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSelectElement('titulo')
                  }}
                  {...getSelectedMotionProps('titulo')}
                  style={{ color: elementColors.titulo }}
                  className={`text-xl font-bold cursor-pointer rounded p-1 transition-all ${
                    activeElement === 'titulo' ? 'ring-2 ring-primary bg-primary/5' : ''
                  }`}
                >
                  Título del tema personalizado
                </motion.h4>

                {/* 5. Sub título */}
                <motion.h5
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSelectElement('subtitulo')
                  }}
                  {...getSelectedMotionProps('subtitulo')}
                  style={{ color: elementColors.subtitulo }}
                  className={`mt-1 text-sm font-semibold cursor-pointer rounded p-1 transition-all ${
                    activeElement === 'subtitulo' ? 'ring-2 ring-primary bg-primary/5' : ''
                  }`}
                >
                  Sub título de ejemplo para validar armonía visual
                </motion.h5>

                {/* 6. Párrafos */}
                <motion.p
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSelectElement('parrafos')
                  }}
                  {...getSelectedMotionProps('parrafos')}
                  style={{ color: elementColors.parrafos }}
                  className={`mt-2 text-xs leading-relaxed cursor-pointer rounded p-1 transition-all ${
                    activeElement === 'parrafos' ? 'ring-2 ring-primary bg-primary/5' : ''
                  }`}
                >
                  Este párrafo representa el texto general de lectura en el sistema. Los colores
                  deben asegurar legibilidad, serenidad y suficiente contraste.
                </motion.p>

                {/* 7. Píldoras */}
                <motion.div
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSelectElement('pildoras')
                  }}
                  {...getSelectedMotionProps('pildoras')}
                  className={`mt-4 flex flex-wrap items-center gap-2 cursor-pointer rounded p-1 transition-all ${
                    activeElement === 'pildoras' ? 'ring-2 ring-primary bg-primary/5' : ''
                  }`}
                >
                  <span
                    style={{
                      backgroundColor: elementColors.pildoras,
                      color: '#ffffff',
                    }}
                    className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-xs"
                  >
                    Píldora activa
                  </span>
                  <span
                    style={{
                      backgroundColor: `${elementColors.pildoras}25`,
                      color: elementColors.pildoras,
                    }}
                    className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                  >
                    Píldora suave
                  </span>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Botón de volver */}
      <div className="flex justify-center pt-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-lg border border-line bg-panel px-4 py-2 text-sm font-medium text-ink-muted outline-none transition-colors hover:bg-primary/5 hover:text-ink focus-visible:ring-2 focus-visible:ring-primary/30"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-4"
            aria-hidden="true"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Volver a las paletas
        </button>
      </div>

      {/* Menú inferior con las 7 cards */}
      <ThemeBottomMenu
        activeElement={activeElement}
        onSelectElement={handleSelectElement}
        elementColors={elementColors}
      />
    </section>
  )
}