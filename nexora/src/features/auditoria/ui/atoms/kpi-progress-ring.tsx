import { motion } from 'motion/react'

export interface KpiProgressRingProps {
  value: number // p. ej. 88.1
  target: number // p. ej. 95
  label: string
  size?: number
  strokeWidth?: number
}

export function KpiProgressRing({
  value,
  target,
  label,
  size = 96,
  strokeWidth = 8,
}: KpiProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const clampedValue = Math.min(Math.max(value, 0), 100)
  const offset = circumference - (clampedValue / 100) * circumference

  // Posición angular del target (meta de referencia)
  const targetAngle = (target / 100) * 360 - 90
  const targetRad = (targetAngle * Math.PI) / 180
  const markerInnerR = radius - strokeWidth / 2 - 2
  const markerOuterR = radius + strokeWidth / 2 + 2
  const cx = size / 2
  const cy = size / 2

  const x1 = cx + markerInnerR * Math.cos(targetRad)
  const y1 = cy + markerInnerR * Math.sin(targetRad)
  const x2 = cx + markerOuterR * Math.cos(targetRad)
  const y2 = cy + markerOuterR * Math.sin(targetRad)

  const isCompliant = value >= target
  const ringColor = isCompliant
    ? 'text-emerald-500'
    : value >= target * 0.85
      ? 'text-amber-500'
      : 'text-rose-500'

  return (
    <div
      className="relative flex items-center justify-center select-none"
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${label}: ${value.toFixed(1)}% (Meta: ${target}%)`}
    >
      <svg width={size} height={size} className="rotate-[-90deg] overflow-visible">
        {/* Track de fondo */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-stone-200 dark:text-stone-700/60"
        />

        {/* Anillo de progreso animado */}
        <motion.circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeLinecap="round"
          className={ringColor}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        />

        {/* Línea de referencia de la meta (target) */}
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="currentColor"
          strokeWidth="2.5"
          className="text-stone-800 dark:text-stone-100 drop-shadow-sm"
        />
      </svg>

      {/* Texto central con porcentaje y meta */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-lg font-bold tracking-tight text-ink dark:text-white">
          {value.toFixed(1)}%
        </span>
        <span className="text-[10px] font-medium text-stone-600 dark:text-stone-300">
          Meta ≥{target}%
        </span>
      </div>
    </div>
  )
}
