import { motion } from 'motion/react'
import { fadeUp } from '../../../../design-tokens/motion'

export function HabitacionTableSkeletonRows({ count = 6 }: { count?: number }) {
  return (
    <motion.tbody
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="divide-y divide-line"
    >
      {Array.from({ length: count }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          {/* 1. Número */}
          <td className="px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-line/60" />
              <div className="space-y-1.5">
                <div className="h-4 w-16 rounded-md bg-line/70" />
                <div className="h-3 w-12 rounded-md bg-line/40" />
              </div>
            </div>
          </td>

          {/* 2. Piso */}
          <td className="px-4 py-4">
            <div className="h-4 w-14 rounded-md bg-line/60" />
          </td>

          {/* 3. Edificio */}
          <td className="px-4 py-4">
            <div className="space-y-1.5">
              <div className="h-4 w-28 rounded-md bg-line/60" />
              <div className="h-3 w-16 rounded-md bg-line/40" />
            </div>
          </td>

          {/* 4. Tipo de cama */}
          <td className="px-4 py-4">
            <div className="space-y-1.5">
              <div className="h-4 w-32 rounded-md bg-line/60" />
              <div className="h-3 w-20 rounded-md bg-line/40" />
            </div>
          </td>

          {/* 5. Estado */}
          <td className="px-4 py-4">
            <div className="h-6 w-24 rounded-full bg-line/50" />
          </td>

          {/* 6. Precio */}
          <td className="px-4 py-4">
            <div className="h-5 w-20 rounded-md bg-line/60" />
          </td>

          {/* 7. Tarifas */}
          <td className="px-4 py-4">
            <div className="h-7 w-20 rounded-xl bg-line/50" />
          </td>

          {/* 8. Actualizado */}
          <td className="px-4 py-4 text-right">
            <div className="ml-auto h-4 w-16 rounded-md bg-line/40" />
          </td>
        </tr>
      ))}
    </motion.tbody>
  )
}

export function HabitacionCardsSkeleton({
  count = 4,
  className = 'grid grid-cols-1 gap-3 sm:grid-cols-2 md:hidden',
}: {
  count?: number
  className?: string
}) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-2xl border border-line bg-panel p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="h-5 w-24 rounded-md bg-line/60" />
            <div className="h-5 w-16 rounded-full bg-line/50" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-36 rounded-md bg-line/50" />
            <div className="h-4 w-40 rounded-md bg-line/40" />
          </div>
          <div className="flex items-center justify-between border-t border-line/60 pt-2.5">
            <div className="h-4 w-20 rounded-md bg-line/50" />
            <div className="h-3 w-16 rounded-md bg-line/40" />
          </div>
        </div>
      ))}
    </div>
  )
}
