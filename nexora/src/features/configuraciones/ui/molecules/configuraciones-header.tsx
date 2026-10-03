import { motion } from 'motion/react';
import {
  SparklesIcon,
  ShieldIcon,
  CheckCircleIcon,
} from '../../../dashboard/ui/icons';

export type SlideDirection =
  | 'izq'
  | 'der'
  | 'arriba'
  | 'abajo'
  | 'left'
  | 'right'
  | 'top'
  | 'bottom';

export interface ConfiguracionesHeaderProps {
  totalModulos: number;
  direction?: SlideDirection;
  duration?: number;
}

function getInitialOffset(direction: SlideDirection) {
  switch (direction) {
    case 'izq':
    case 'left':
      return { x: -60, y: 0 };
    case 'der':
    case 'right':
      return { x: 60, y: 0 };
    case 'arriba':
    case 'top':
      return { x: 0, y: -40 };
    case 'abajo':
    case 'bottom':
      return { x: 0, y: 40 };
    default:
      return { x: -60, y: 0 };
  }
}

export function ConfiguracionesHeader({
  totalModulos,
  direction = 'izq',
  duration = 0.5,
}: ConfiguracionesHeaderProps) {
  const initialOffset = getInitialOffset(direction);

  return (
    <motion.header
      initial={{ opacity: 0, x: initialOffset.x, y: initialOffset.y }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{
        duration: duration,
        ease: 'easeOut',
      }}
      className="border-line bg-panel relative overflow-hidden rounded-3xl border p-6 shadow-xs sm:p-8"
    >
      {/* Resplandor decorativo sutil en esquina */}
      <div
        className="bg-primary/10 pointer-events-none absolute -top-20 -right-20 size-64 rounded-full blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="border-primary/20 bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold">
              <SparklesIcon className="size-3.5" />
              Panel de Administración
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="size-2 animate-pulse rounded-full bg-emerald-500" />
              Sistema Operativo
            </span>
          </div>

          <h1 className="text-ink mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            Configuración y Gestión de Módulos
          </h1>
          <p className="text-ink-muted mt-2 max-w-2xl text-sm leading-relaxed">
            Supervisa los módulos del hotel, personaliza parámetros
            operacionales y mantén el control integral de tu red hotelera desde
            un único punto seguro.
          </p>
        </div>

        {/* Métricas rápidas / indicadores de estado */}
        <div className="flex flex-wrap items-center gap-3">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="border-line bg-canvas/60 flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-2xs"
          >
            <div className="bg-primary/10 text-primary grid size-10 place-items-center rounded-xl">
              <CheckCircleIcon className="size-5" />
            </div>
            <div>
              <p className="text-ink-muted text-xs">Módulos conectados</p>
              <p className="text-ink text-lg font-bold">{totalModulos} activos</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="border-line bg-canvas/60 flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-2xs"
          >
            <div className="bg-primary/10 text-primary grid size-10 place-items-center rounded-xl">
              <ShieldIcon className="size-5" />
            </div>
            <div>
              <p className="text-ink-muted text-xs">Políticas de seguridad</p>
              <p className="text-ink text-lg font-bold">RBAC Estricto</p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}
