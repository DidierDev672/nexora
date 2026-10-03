import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { fadeIn } from '../../../../design-tokens/motion'
import { Button } from '../atoms/button'
import { BedIcon, BuildingIcon } from '../icons'

export type SectionSoonIcon = 'building' | 'bed'

const ICONS: Record<SectionSoonIcon, ReactNode> = {
  building: <BuildingIcon className="size-7" />,
  bed: <BedIcon className="size-7" />,
}

export interface SectionSoonProps {
  icon: SectionSoonIcon
  title: string
  message: string
  actionLabel: string
  onAction: () => void
}

export function SectionSoon({ icon, title, message, actionLabel, onAction }: SectionSoonProps) {
  return (
    <motion.section
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.3, ease: 'easeOut' }}
      aria-label={title}
      className="mx-auto flex w-full max-w-lg flex-col items-center rounded-2xl border border-line bg-panel px-6 py-14 text-center shadow-sm"
    >
      <span className="grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary">
        {ICONS[icon]}
      </span>
      <h2 className="mt-5 text-xl font-bold text-ink">{title}</h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-muted">{message}</p>
      <Button variant="secondary" className="mt-6" onClick={onAction}>
        {actionLabel}
      </Button>
    </motion.section>
  )
}