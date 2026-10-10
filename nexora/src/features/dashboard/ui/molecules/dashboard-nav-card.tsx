import type React from 'react'
import { motion, type Variants } from 'motion/react'
import { staggerItem } from '../../../../design-tokens/motion'
import type { DashboardCardDefinition } from '../../domain/dashboard-card'
import type { NavId } from '../navigation'
import {
  BuildingIcon,
  BedIcon,
  TagIcon,
  CubeIcon,
  CalendarIcon,
  ConciergeBellIcon,
  UserIcon,
  UsersIcon,
  ShieldIcon,
  PaletteIcon,
  ClipboardCheckIcon,
  ChevronRightIcon,
  UtensilsIcon,
} from '../icons'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  BuildingIcon,
  BedIcon,
  TagIcon,
  CubeIcon,
  CalendarIcon,
  ConciergeBellIcon,
  ClipboardCheckIcon,
  UserIcon,
  UsersIcon,
  ShieldIcon,
  PaletteIcon,
  UtensilsIcon,
}

export interface DashboardNavCardProps {
  card: DashboardCardDefinition
  onNavigate: (id: NavId) => void
  variants?: Variants
}

export function DashboardNavCard({ card, onNavigate, variants = staggerItem }: DashboardNavCardProps) {
  const IconComponent = ICON_MAP[card.iconName] ?? BuildingIcon

  return (
    <motion.button
      type="button"
      onClick={() => onNavigate(card.id)}
      variants={variants}
      whileHover={{ y: -4, scale: 1.015, transition: { type: 'spring', stiffness: 400, damping: 26 } }}
      whileTap={{ scale: 0.985, transition: { type: 'spring', stiffness: 400, damping: 26 } }}
      aria-label={`Ir a la sección de ${card.title}: ${card.subtitle}`}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-line bg-panel p-5 sm:p-6 text-left shadow-xs transition-colors hover:border-primary/40 hover:shadow-md focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer w-full"
    >
      {/* Resplandor decorativo con el color tonal de la sección */}
      <div
        className={`pointer-events-none absolute -right-12 -top-12 size-36 rounded-full bg-linear-to-br ${card.accentColor} opacity-20 blur-2xl transition-opacity group-hover:opacity-40`}
        aria-hidden="true"
      />

      <div className="w-full">
        {/* Cabecera de la Card: Icono + Badge */}
        <div className="flex items-center justify-between gap-3">
          <div
            className={`flex size-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br ${card.accentColor} shadow-inner transition-transform group-hover:scale-105`}
          >
            <IconComponent className="size-6" />
          </div>

          <span className="inline-flex items-center rounded-full border border-line/80 bg-canvas/80 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-ink-muted group-hover:border-primary/20 group-hover:text-primary transition-colors">
            {card.badgeText}
          </span>
        </div>

        {/* Títulos y descripción explicativa */}
        <div className="mt-4">
          <h3 className="text-lg font-bold text-ink transition-colors group-hover:text-primary">
            {card.title}
          </h3>
          <p className="text-xs font-medium text-ink-muted">
            {card.subtitle}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-ink-muted/80 line-clamp-2">
            {card.description}
          </p>
        </div>
      </div>

      {/* Footer interactivo con llamada a la acción y flecha */}
      <div className="mt-5 flex w-full items-center justify-between border-t border-line/50 pt-3 text-xs font-semibold text-ink-muted group-hover:text-primary transition-colors">
        <span>{card.highlightMetric ?? 'Acceder al módulo'}</span>
        <div className="flex size-7 items-center justify-center rounded-full bg-canvas/60 text-ink-muted group-hover:bg-primary group-hover:text-white transition-all shadow-2xs">
          <ChevronRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </motion.button>
  )
}
