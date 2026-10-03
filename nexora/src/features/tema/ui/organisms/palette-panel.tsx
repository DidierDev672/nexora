import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { brandDefaults } from '../../../../design-tokens/colors'
import { fadeUp } from '../../../../design-tokens/motion'
import { Input } from '../../../../shared/ui/Input'
import { InfiniteScroll, InfiniteScrollEnd } from '../../../../shared/ui/InfiniteScroll'
import { GetPalettes } from '../../application/get-palettes'
import { useTemaStore } from '../../application/tema-store'
import type { Palette } from '../../domain/palette'
import { ApiPaletteRepository } from '../../infrastructure/api-palette-repository'
import { Button } from '../atoms/button'
import { EmptyState } from '../atoms/empty-state'
import { Loader } from '../atoms/loader'
import { paletteEmptyMessage, paletteListLoadError } from '../lib/error-copy'
import { PaletteCard } from '../molecules/palette-card'

const PAGE_SIZE = 9

const paletteRepository = new ApiPaletteRepository()

export interface PalettePanelProps {
  /** Abre la página de personalización de un tema propio. */
  onOpenCustom?: () => void
}

export function PalettePanel({ onOpenCustom }: PalettePanelProps) {
  const [palettes, setPalettes] = useState<Palette[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [query, setQuery] = useState('')
  const previewPalette = useTemaStore((state) => state.previewPalette)
  const cancelPreview = useTemaStore((state) => state.cancelPreview)
  const applyPermanently = useTemaStore((state) => state.applyPermanently)

  const fetchPalettes = useCallback(() => {
    GetPalettes(paletteRepository)()
      .then((list) => setPalettes(list))
      .catch(() => setLoadError(paletteListLoadError()))
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    fetchPalettes()
  }, [fetchPalettes])

  const retry = () => {
    setIsLoading(true)
    setLoadError(null)
    setVisibleCount(PAGE_SIZE)
    fetchPalettes()
  }

  const loadMore = async () => {
    setIsLoadingMore(true)
    await new Promise((resolve) => window.setTimeout(resolve, 700))
    setVisibleCount((prev) => prev + PAGE_SIZE)
    setIsLoadingMore(false)
  }

  const filteredPalettes = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase()
    if (!normalized) return palettes
    return palettes.filter((palette) => palette.name.toLocaleLowerCase().includes(normalized))
  }, [palettes, query])

  const handleQueryChange = (value: string) => {
    setQuery(value)
    setVisibleCount(PAGE_SIZE)
  }

  const countLabel =
    filteredPalettes.length === 1
      ? filteredPalettes.length === palettes.length
        ? '1 paleta lista'
        : '1 paleta encontrada'
      : filteredPalettes.length === palettes.length
        ? `${filteredPalettes.length} paletas listas`
        : `${filteredPalettes.length} paletas encontradas`

  return (
    <section aria-label="Paletas de colores" className="mt-8 space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-bold text-ink">Paletas disponibles</h2>
        {isLoading ? null : (
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
            {countLabel}
          </span>
        )}

        <Button onClick={onOpenCustom}>
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
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2Z" />
            <circle cx="7.5" cy="11" r="0.5" fill="currentColor" />
            <circle cx="11" cy="7.5" r="0.5" fill="currentColor" />
            <circle cx="16.5" cy="9.5" r="0.5" fill="currentColor" />
          </svg>
          Personalizar a la medida
        </Button>

        <div className="ml-auto w-full sm:w-72">
          <Input
            role="searchbox"
            type="search"
            aria-label="Buscar paletas por nombre"
            placeholder="Buscar paleta por nombre…"
            value={query}
            onChange={(event) => handleQueryChange(event.target.value)}
            icon={
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
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            }
            action={
              query ? (
                <button
                  type="button"
                  onClick={() => handleQueryChange('')}
                  aria-label="Limpiar búsqueda"
                  className="flex size-8 items-center justify-center rounded-lg text-ink-soft outline-none transition-colors hover:bg-primary/5 hover:text-ink focus-visible:ring-2 focus-visible:ring-primary/40"
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
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              ) : null
            }
          />
        </div>
      </div>

      {isLoading ? (
        <Loader label="Preparando los colores…" className="py-24" />
      ) : loadError ? (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="rounded-2xl border border-danger/20 bg-danger/10 p-6 text-center"
        >
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-danger/10 text-danger">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-6"
              aria-hidden="true"
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <path d="M12 9v4M12 17h.01" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-ink">No pudimos cargar las paletas</h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-muted">
            {loadError}
          </p>
          <Button variant="secondary" className="mt-5" onClick={retry}>
            Reintentar
          </Button>
        </motion.div>
      ) : filteredPalettes.length === 0 ? (
        query ? (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="rounded-2xl border border-line bg-panel p-8 text-center"
          >
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-6"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-ink">Sin resultados para “{query.trim()}”</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-muted">
              No encontramos ninguna paleta con ese nombre. Probá con otra palabra o limpia la
              búsqueda para ver todas las paletas.
            </p>
            <Button variant="secondary" className="mt-5" onClick={() => handleQueryChange('')}>
              Limpiar búsqueda
            </Button>
          </motion.div>
        ) : (
          <EmptyState
            title="Aún no hay paletas"
            message={paletteEmptyMessage()}
            action={
              <Button variant="secondary" onClick={retry}>
                Volver a buscar
              </Button>
            }
          />
        )
      ) : (
        <InfiniteScroll
          onLoadMore={loadMore}
          hasMore={!query && visibleCount < palettes.length}
          isLoading={isLoadingMore}
          loader={<Loader label="Cargando más paletas…" className="py-6" />}
          endMessage={<InfiniteScrollEnd label="Ya aparecen todas las paletas." />}
        >
          <motion.ul
            layout
            className="grid list-none grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence initial={false}>
              {filteredPalettes.slice(0, visibleCount).map((palette) => (
                <PaletteCard key={palette.name} palette={palette} />
              ))}
            </AnimatePresence>
          </motion.ul>
        </InfiniteScroll>
      )}

      <AnimatePresence>
        {previewPalette && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ type: 'spring', stiffness: 400, damping: 26 }}
            className="fixed inset-x-0 bottom-4 z-40 px-4 sm:px-6"
          >
            <div
              role="region"
              aria-label="Vista previa de paleta de colores"
              className="mx-auto flex max-w-4xl flex-wrap items-center gap-x-4 gap-y-3 rounded-2xl border p-4 shadow-2xl"
              style={{
                backgroundColor: brandDefaults.panel,
                borderColor: brandDefaults.line,
              }}
            >
              <div className="flex shrink-0 items-center gap-1.5">
                {previewPalette.colors.slice(0, 6).map((color) => (
                  <span
                    key={color.hex}
                    title={color.name}
                    className="size-5 rounded-full border border-black/10"
                    style={{ backgroundColor: color.hex }}
                  />
                ))}
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className="truncate text-sm font-bold"
                  style={{ color: brandDefaults.ink }}
                >
                  Previsualizando “{previewPalette.name}”
                </p>
                <p
                  className="text-xs"
                  style={{ color: brandDefaults.inkMuted }}
                >
                  El cambio ya se ve en toda la plataforma. Confírmalo para que se quede.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={cancelPreview}
                  className="rounded-lg border px-3.5 py-2 text-sm font-medium outline-none transition-colors hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-[#5a311f]/30"
                  style={{
                    borderColor: brandDefaults.line,
                    color: brandDefaults.inkMuted,
                    backgroundColor: 'transparent',
                  }}
                >
                  Cancelar
                </motion.button>

                <motion.button
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={applyPermanently}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 px-3.5 py-2 text-sm font-semibold shadow-sm outline-none transition-all hover:brightness-95 focus-visible:ring-2 focus-visible:ring-[#5a311f]/40"
                  style={{
                    backgroundColor: brandDefaults.primary,
                    color: brandDefaults.cream,
                  }}
                >
                  Aplicar permanentemente paleta de colores
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}