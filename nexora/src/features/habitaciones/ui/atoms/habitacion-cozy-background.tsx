import { memo, type ReactNode } from 'react'
import type { GuestDisplayInfo } from '../../domain/habitacion-stay'
import { HabitacionCama } from './habitacion-cama'
import { HabitacionCuadro } from './habitacion-cuadro'
import { HabitacionMesaNoche } from './habitacion-mesa-noche'
import { HabitacionParedJoyce } from './habitacion-pared-joyce'
import { HabitacionPisoPerspectiva } from './habitacion-piso-perspectiva'
import { HabitacionPuerta } from './habitacion-puerta'
import { HabitacionSofa } from './habitacion-sofa'
import { HabitacionVentana } from './habitacion-ventana'

export interface HabitacionCozyBackgroundProps {
  className?: string
  landscapeSrc?: string
  archedWindow?: boolean
  roomNumber?: string | number
  withJoyceWall?: boolean
  withCuadro?: boolean
  guests?: GuestDisplayInfo[]
  isLoadingGuests?: boolean
  hasActiveStay?: boolean
  /** Callback al hacer clic en el cojín de diamante de la cama */
  onDiamondClick?: () => void
  /** Callback para abrir el modal centrado con la ficha del huésped */
  onOpenGuestFolio?: () => void
  /** Callback al hacer clic en la puerta abierta para volver a la lista de habitaciones */
  onDoorClick?: () => void
  children?: ReactNode
}

/**
 * Background moderno de una habitación minimalista estilizada (estilo cozy bedroom).
 * Implementado según las especificaciones técnicas de:
 * prompt/prompt-background-habitacion-cozy.md (Versión B - Optimizada para Producción)
 * 
 * 1. Arquitectura de Capas y Aislamiento:
 *    - Capa base con aria-hidden="true", pointer-events-none, absolute inset-0 z-0 select-none.
 * 2. Iluminación Indirecta (Efecto Glow):
 *    - Foco cenital / cabecero: absolute -top-32 left-1/2 -translate-x-1/2 size-96 rounded-full bg-amber-500/20 blur-[120px]
 *    - Lámpara de noche / lectura: absolute top-1/4 -left-20 size-80 rounded-full bg-orange-500/20 blur-[120px]
 *    - Luz de cortesía / zócalo: absolute bottom-14 left-1/3 size-72 rounded-full bg-primary/20 blur-[120px]
 * 3. Perspectiva y Estructura Espacial:
 *    - Suelo y zócalo: absolute inset-x-0 bottom-0 flex h-80 items-end justify-center border-b-[16px] border-line/70 bg-linear-to-t from-line/35 via-line/10 to-transparent
 *    - Pared de acento / cabecero estilizado: rounded-t-3xl border-t border-x border-line/40 bg-panel/30 con divisiones verticales
 * 4. Dinamismo y Accesibilidad:
 *    - animate-pulse motion-reduce:animate-none en focos de luz
 *    - Atenuación vertical bg-linear-to-b from-transparent via-transparent to-canvas/70
 */
export const HabitacionCozyBackground = memo(function HabitacionCozyBackground({
  className = '',
  landscapeSrc = '/images/landscape-cozy-window.jpg',
  archedWindow = true,
  roomNumber = '101',
  withJoyceWall = false,
  withCuadro = true,
  guests = [],
  isLoadingGuests = false,
  hasActiveStay = false,
  onDiamondClick,
  onOpenGuestFolio,
  onDoorClick,
  children,
}: HabitacionCozyBackgroundProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 z-0 overflow-hidden select-none ${className}`}
    >
      {/* ========================================================= */}
      {/* 1. ILUMINACIÓN INDIRECTA (GLOW AMBIENTAL ESTÁTICO DE CERO CONSUMO GPU) */}
      {/* ========================================================= */}
      {/* Foco cenital / cabecero */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 size-96 rounded-full bg-amber-500/15 blur-[85px] opacity-80 pointer-events-none" />

      {/* Lámpara de noche / lectura */}
      <div className="absolute top-1/4 -left-20 size-80 rounded-full bg-orange-500/15 blur-[85px] opacity-75 pointer-events-none" />

      {/* Luz de cortesía / zócalo */}
      <div className="absolute bottom-14 left-1/3 size-72 rounded-full bg-primary/15 blur-[85px] opacity-75 pointer-events-none" />

      {/* ========================================================= */}
      {/* 2. PERSPECTIVA Y ESTRUCTURA ESPACIAL: SUELO Y CABECERO    */}
      {/* ========================================================= */}
      <div className="absolute inset-x-0 bottom-0 flex h-80 items-end justify-center border-b-[16px] border-line/70 bg-linear-to-t from-line/35 via-line/10 to-transparent">
        {/* Patrón de textura en perspectiva para el parquet del suelo */}
        <HabitacionPisoPerspectiva className="absolute inset-0 opacity-20 pointer-events-none" />

        {/* Pared de acento / cabecero estilizado con divisiones verticales sutiles */}
        <div className="relative flex h-56 w-full max-w-4xl items-end justify-between rounded-t-3xl border-t border-x border-line/40 bg-panel/30 px-6 backdrop-blur-[2px]">
          <div className="h-full w-px bg-line/20" />
          <div className="h-full w-px bg-line/20" />
          <div className="h-full w-px bg-line/20" />
          <div className="h-full w-px bg-line/20" />
          <div className="h-full w-px bg-line/20" />
          <div className="h-full w-px bg-line/20" />
          <div className="h-full w-px bg-line/20" />
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. GRADIENTE DE ATENUACIÓN VERTICAL (ALTO CONTRASTE)      */}
      {/* ========================================================= */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-canvas/70 pointer-events-none" />

      {/* ========================================================= */}
      {/* 4. MOBILIARIO Y ELEMENTOS ARQUITECTÓNICOS DE LA HABITACIÓN */}
      {/* ========================================================= */}

      {/* 4.1 Ventana arquitectónica con paisaje alpino (extremo izquierdo) */}
      <div className="absolute top-5 sm:top-7 left-2 sm:left-4 lg:left-8 z-10 pointer-events-auto">
        <HabitacionVentana
          className="w-36 h-56 sm:w-44 sm:h-72 lg:w-56 lg:h-84 opacity-95 sm:opacity-100 drop-shadow-xl"
          landscapeSrc={landscapeSrc}
          arched={archedWindow}
        />
      </div>

      {/* 4.2 Cuadro decorativo de pared / Ficha del huésped (extremo derecho) */}
      {withCuadro && (
        <div className="hidden sm:block absolute top-6 right-2 sm:top-8 sm:right-4 lg:top-9 lg:right-8 z-10 origin-top-right scale-85 sm:scale-95 lg:scale-100 opacity-95 hover:opacity-100 transition-all pointer-events-auto">
          <HabitacionCuadro
            guests={guests}
            isLoading={isLoadingGuests}
            hasActiveStay={hasActiveStay}
            onOpenGuestDetail={onOpenGuestFolio}
          />
        </div>
      )}

      {/* 4.3 Tablero de Joyce Byers (Stranger Things) en el centro superior */}
      {withJoyceWall && (
        <div className="absolute top-6 sm:top-8 lg:top-10 left-40 sm:left-52 lg:left-68 right-2 sm:right-48 lg:right-60 z-10 flex items-center justify-center pointer-events-auto">
          <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl [filter:drop-shadow(0_12px_28px_rgba(0,0,0,0.5))]">
            <HabitacionParedJoyce />
          </div>
        </div>
      )}

      {/* 4.4 Puerta interactiva con placa de habitación */}
      {onDoorClick && (
        <div className="absolute bottom-4 left-3 sm:left-6 z-10 pointer-events-auto origin-bottom scale-75 sm:scale-85">
          <HabitacionPuerta
            roomNumber={roomNumber}
            onDoorClick={onDoorClick}
          />
        </div>
      )}

      {/* 4.5 Mesa de noche con lámpara cálida */}
      <div className="hidden lg:flex absolute bottom-4 left-[20%] xl:left-[24%] z-10 pointer-events-auto origin-bottom scale-75 md:scale-85">
        <HabitacionMesaNoche withLamp={true} />
      </div>

      {/* 4.6 Cama confortable con cojín interactivo de diamante */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-auto origin-bottom scale-75 sm:scale-85 md:scale-95 drop-shadow-2xl">
        <HabitacionCama
          showDiamond={!hasActiveStay}
          onDiamondClick={onDiamondClick}
        />
      </div>

      {/* 4.7 Sofá nórdico minimalista con mayor separación de la cama */}
      <div className="hidden lg:flex absolute bottom-4 right-6 lg:right-10 xl:right-[8%] 2xl:right-[11%] z-10 pointer-events-auto origin-bottom scale-75 md:scale-80 transition-all">
        <HabitacionSofa />
      </div>

      {/* 4.8 Badge discreto con número de habitación */}
      <span className="absolute bottom-4 right-4 text-xs font-mono text-ink-muted/50 select-none">
        #{roomNumber}
      </span>

      {/* 4.9 Mensaje accesible de carga si está cargando huéspedes */}
      {isLoadingGuests && (
        <div
          aria-live="polite"
          className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full border border-line/50 bg-panel/80 px-3 py-1 text-xs text-ink-muted backdrop-blur-md"
        >
          Cargando huéspedes…
        </div>
      )}

      {children}
    </div>
  )
})

HabitacionCozyBackground.displayName = 'HabitacionCozyBackground'

export default HabitacionCozyBackground
