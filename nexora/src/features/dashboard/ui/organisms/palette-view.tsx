import { motion } from 'motion/react'
import { fadeIn } from '../../../../design-tokens/motion'
import { TemaPage } from '../../../tema/ui/tema-page'

export function PaletteView() {
  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible">
      <TemaPage />
    </motion.div>
  )
}