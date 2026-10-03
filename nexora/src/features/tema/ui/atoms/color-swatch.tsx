export interface ColorSwatchProps {
  hex: string
  name?: string
}

import { motion } from 'motion/react'

export interface ColorSwatchProps {
  hex: string
  name?: string
}

export function ColorSwatch({ hex, name }: ColorSwatchProps) {
  return (
    <motion.span
      role="img"
      aria-label={name ? `${name}: ${hex}` : `Color ${hex}`}
      title={name ? `${name} · ${hex}` : hex}
      whileHover={{ scale: 1.4, zIndex: 10 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="h-10 min-w-0 flex-1 cursor-pointer rounded-lg border border-black/10 shadow-inner"
      style={{ backgroundColor: hex }}
    />
  )
}