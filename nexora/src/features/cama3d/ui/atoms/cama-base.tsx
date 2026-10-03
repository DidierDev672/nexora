import { COLORES } from '../lib/colores'

export function CamaBase() {
  return (
    <mesh position={[0, 0.72, 0]} castShadow receiveShadow>
      <boxGeometry args={[1.4, 0.16, 2.0]} />
      <meshStandardMaterial color={COLORES.madera} roughness={0.75} />
    </mesh>
  )
}