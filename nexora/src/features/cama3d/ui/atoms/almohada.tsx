import { RoundedBox } from '@react-three/drei'
import { COLORES } from '../lib/colores'

export interface AlmohadaProps {
  position?: [number, number, number]
  rotation?: [number, number, number]
}

export function Almohada({
  position = [0, 1.16, -0.66],
  rotation = [0.12, 0, 0],
}: AlmohadaProps) {
  return (
    <RoundedBox
      args={[0.78, 0.16, 0.46]}
      radius={0.06}
      smoothness={6}
      position={position}
      rotation={rotation}
      castShadow
    >
      <meshStandardMaterial color={COLORES.ropa} roughness={0.95} />
    </RoundedBox>
  )
}