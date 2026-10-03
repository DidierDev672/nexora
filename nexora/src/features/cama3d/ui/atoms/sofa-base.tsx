import { COLORES } from '../lib/colores'

export interface SofaBaseProps {
  length: number
}

export function SofaBase({ length }: SofaBaseProps) {
  return (
    <mesh position={[0, 0.22, -0.04]} castShadow receiveShadow>
      <boxGeometry args={[length, 0.14, 0.84]} />
      <meshStandardMaterial color={COLORES.madera} roughness={0.75} />
    </mesh>
  )
}