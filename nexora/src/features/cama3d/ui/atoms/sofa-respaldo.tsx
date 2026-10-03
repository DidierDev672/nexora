import { COLORES } from '../lib/colores'

export interface SofaRespaldoProps {
  length: number
}

export function SofaRespaldo({ length }: SofaRespaldoProps) {
  return (
    <mesh position={[0, 0.5, -0.35]} castShadow receiveShadow>
      <boxGeometry args={[length, 0.52, 0.14]} />
      <meshStandardMaterial color={COLORES.tela} roughness={0.95} />
    </mesh>
  )
}