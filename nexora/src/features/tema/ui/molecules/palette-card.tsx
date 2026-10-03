import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import type { Palette } from '../../domain/palette'
import { useTemaStore } from '../../application/tema-store'
import { ColorSwatch } from '../atoms/color-swatch'
import { cn } from '../lib/cn'

export interface PaletteCardProps {
  palette: Palette
}

const MAX_TILT = 9
const GLARE_OPACITY = 0.28

export function PaletteCard({ palette }: PaletteCardProps) {
  const cardRef = useRef<HTMLLIElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const previewPalette = useTemaStore((state) => state.previewPalette)
  const appliedPalette = useTemaStore((state) => state.appliedPalette)
  const preview = useTemaStore((state) => state.preview)

  const isActive =
    previewPalette?.name === palette.name ||
    (!previewPalette && appliedPalette?.name === palette.name)

  // Fade-in suave: pasa de opacity 0 a 1 al montar o al entrar en el viewport.
  useEffect(() => {
    const element = cardRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  // Coordenadas del mouse relativas a la tarjeta → rotaciones y reflejo de luz.
  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)
  const glareX = useMotionValue(50)
  const glareY = useMotionValue(50)

  const smoothRotateX = useSpring(rotateX, { stiffness: 280, damping: 20 })
  const smoothRotateY = useSpring(rotateY, { stiffness: 280, damping: 20 })

  const glareBackground = useTransform(
    [glareX, glareY],
    ([x, y]) =>
      `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,${GLARE_OPACITY}) 0%, rgba(255,255,255,0.1) 35%, transparent 65%)`,
  )

  const handleMouseMove = (event: MouseEvent<HTMLLIElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width
    const y = (event.clientY - rect.top) / rect.height

    rotateY.set((x - 0.5) * MAX_TILT * 2)
    rotateX.set((0.5 - y) * MAX_TILT * 2)
    glareX.set(x * 100)
    glareY.set(y * 100)
  }

  const resetTilt = () => {
    rotateX.set(0)
    rotateY.set(0)
    glareX.set(50)
    glareY.set(50)
  }

  return (
    <motion.li
      ref={cardRef}
      style={{
        rotateX: smoothRotateX,
        rotateY: smoothRotateY,
        transformStyle: 'preserve-3d',
        transformPerspective: 900,
      }}
      initial={{ opacity: 0, y: 24 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ type: 'spring', stiffness: 400, damping: 26 }}
      exit={{ opacity: 0, y: 16, transition: { duration: 0.15, ease: 'easeOut' } }}
      onMouseMove={handleMouseMove}
      onMouseLeave={resetTilt}
      className={cn(
        'group relative cursor-pointer overflow-hidden rounded-2xl border bg-panel shadow-xs will-change-transform transition-colors',
        isActive ? 'border-primary/40' : 'border-line hover:border-primary/25',
      )}
    >
      <motion.div
        aria-hidden="true"
        style={{ background: glareBackground }}
        className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />

      <div className="relative" style={{ transform: 'translateZ(28px)' }}>
        <div className="px-4 pt-4">
          {palette.colors.length > 0 ? (
            <div className="flex gap-1.5">
              {palette.colors.map((color) => (
                <ColorSwatch key={color.hex} hex={color.hex} name={color.name} />
              ))}
            </div>
          ) : (
            <div className="flex h-10 items-center justify-center rounded-lg border border-dashed border-line bg-canvas text-xs text-ink-soft">
              Sin colores definidos
            </div>
          )}
        </div>
        <div className="px-4 py-3.5">
          <div className="flex items-center justify-between gap-2">
            <h4 className="truncate font-semibold text-ink">{palette.name}</h4>
            {isActive && (
              <span
                aria-hidden="true"
                className="grid size-5 shrink-0 place-items-center rounded-full bg-primary/15 text-primary"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-3"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => preview(palette)}
            disabled={isActive}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-primary/30 bg-panel px-3.5 py-2 text-sm font-medium text-primary outline-none transition-colors hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-primary/30 disabled:pointer-events-none disabled:opacity-60"
          >
            {isActive ? 'Paleta aplicada' : 'aplicar paleta de colores'}
          </button>
        </div>
      </div>
    </motion.li>
  )
}