import { RoundedBox } from '@react-three/drei'
import { COLORES } from '../lib/colores'

export function Colchon() {
  return (
    <RoundedBox
      args={[1.42, 0.28, 2.0]}
      radius={0.07}
      smoothness={8}
      position={[0, 0.94, 0]}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial color={COLORES.tela} roughness={0.9} />
    </RoundedBox>
  )
}