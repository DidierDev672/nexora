import { useMemo } from 'react'
import { motion } from 'motion/react'
import { fadeIn } from '../../../../design-tokens/motion'
import { MOCK_OCCUPANCY } from '../../infrastructure/mock-data'

const W = 640
const H = 240
const PAD_TOP = 24
const PAD_BOTTOM = 34
const PAD_LEFT = 40
const PAD_RIGHT = 18
const Y_TICKS = [0, 25, 50, 75, 100] as const

export function OccupancyChart() {
  const { points, linePath, areaPath, baseY, average } = useMemo(() => {
    const count = MOCK_OCCUPANCY.length
    const plotWidth = W - PAD_LEFT - PAD_RIGHT
    const plotHeight = H - PAD_TOP - PAD_BOTTOM
    const yBase = H - PAD_BOTTOM

    const pts = MOCK_OCCUPANCY.map((point, index) => {
      const x = PAD_LEFT + (index * plotWidth) / (count - 1)
      const y = yBase - (point.occupancy / 100) * plotHeight
      return { x, y }
    })

    const line = pts
      .map((p, index) => `${index === 0 ? 'M' : 'L'}${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
      .join(' ')
    const area = `${line} L${pts[count - 1].x.toFixed(2)} ${yBase} L${pts[0].x.toFixed(2)} ${yBase} Z`
    const avg = Math.round(
      MOCK_OCCUPANCY.reduce((sum, point) => sum + point.occupancy, 0) / count,
    )

    return { points: pts, linePath: line, areaPath: area, baseY: yBase, average: avg }
  }, [])

  const last = points[points.length - 1]
  const best = Math.max(...MOCK_OCCUPANCY.map((point) => point.occupancy))

  return (
    <motion.section
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      aria-label="Gráfico de ocupación mensual"
      className="rounded-2xl border border-line bg-panel p-5 shadow-sm sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-ink">Ocupación mensual</h2>
          <p className="mt-0.5 text-sm text-ink-muted">
            Los meses buenos se acumulan: así late tu red en el último año.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
            Promedio {average}%
          </span>
          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            Récord {best}%
          </span>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2 text-xs text-ink-muted">
        <span className="size-2 rounded-full bg-primary" />
        <span>Ocupación</span>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-3 w-full"
        role="img"
        aria-label="Curva de ocupación mensual en porcentaje"
      >
        <defs>
          <linearGradient id="occupancy-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {Y_TICKS.map((tick) => {
          const y = baseY - (tick / 100) * (H - PAD_TOP - PAD_BOTTOM)
          return (
            <g key={tick}>
              <line
                x1={PAD_LEFT}
                x2={W - PAD_RIGHT}
                y1={y}
                y2={y}
                stroke="var(--color-line)"
                strokeDasharray={tick === 0 ? undefined : '4 4'}
                vectorEffect="non-scaling-stroke"
              />
              <text
                x={PAD_LEFT - 8}
                y={y + 4}
                textAnchor="end"
                fontSize="11"
                fill="var(--color-ink-soft)"
              >
                {tick}%
              </text>
            </g>
          )
        })}

        <motion.path
          d={areaPath}
          fill="url(#occupancy-area)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.25 }}
        />

        <motion.path
          d={linePath}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.9, ease: 'easeOut', delay: 0.1 }}
        />

        {points.map((point, index) => (
          <g key={MOCK_OCCUPANCY[index].month}>
            <title>{`${MOCK_OCCUPANCY[index].month}: ${MOCK_OCCUPANCY[index].occupancy}%`}</title>
            <motion.circle
              cx={point.x}
              cy={point.y}
              r="3"
              fill="var(--color-panel)"
              stroke="var(--color-primary)"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.5 + index * 0.04 }}
            />
          </g>
        ))}

        {MOCK_OCCUPANCY.map((point, index) => (
          <text
            key={point.month}
            x={points[index].x}
            y={H - 12}
            textAnchor="middle"
            fontSize="11"
            fill="var(--color-ink-soft)"
          >
            {point.month}
          </text>
        ))}

        <motion.circle
          cx={last.x}
          cy={last.y}
          r="5"
          fill="var(--color-primary)"
          stroke="var(--color-panel)"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 18, delay: 0.9 }}
        />
        <text
          x={last.x}
          y={last.y - 14}
          textAnchor="middle"
          fontSize="12"
          fontWeight="700"
          fill="var(--color-primary)"
        >
          {MOCK_OCCUPANCY[MOCK_OCCUPANCY.length - 1].occupancy}%
        </text>
      </svg>
    </motion.section>
  )
}