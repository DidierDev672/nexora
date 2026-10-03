import { RoundedBox } from '@react-three/drei'
import { COLORES } from '../lib/colores'

export function Cobija() {
  return (
    <RoundedBox
      args={[1.3, 0.2, 1.2]}
      radius={0.09}
      smoothness={8}
      position={[0, 1.14, 0.42]}
      rotation={[0.05, 0, 0]}
      castShadow
    >
      <meshStandardMaterial color={COLORES.cobija} roughness={1} />
    </RoundedBox>
  )
}