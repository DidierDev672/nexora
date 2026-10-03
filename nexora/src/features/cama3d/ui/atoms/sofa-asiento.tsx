import { RoundedBox } from '@react-three/drei'
import { COLORES } from '../lib/colores'

export interface SofaAsientoProps {
  position: [number, number, number]
}

export function SofaAsiento({ position }: SofaAsientoProps) {
  return (
    <RoundedBox
      args={[0.48, 0.16, 0.52]}
      radius={0.05}
      smoothness={6}
      position={position}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial color={COLORES.tela} roughness={0.95} />
    </RoundedBox>
  )
}