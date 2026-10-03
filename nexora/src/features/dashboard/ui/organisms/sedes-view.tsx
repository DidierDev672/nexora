import { ApiSedeRepository } from '../../../sedes/infrastructure/api-sede-repository'
import { SedesProvider } from '../../../sedes/ui/sedes-provider'
import { SedesPage } from '../../../sedes/ui/sedes-page'
import { fadeIn } from '../../../../design-tokens/motion'
import { motion } from 'motion/react'

const repository = new ApiSedeRepository()

export function SedesView() {
  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible">
      <SedesProvider repository={repository}>
        <SedesPage />
      </SedesProvider>
    </motion.div>
  )
}