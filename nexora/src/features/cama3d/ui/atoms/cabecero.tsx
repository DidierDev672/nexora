import { COLORES } from '../lib/colores'

export function Cabecero() {
  return (
    <mesh position={[0, 1.12, -1.28]} castShadow>
      <boxGeometry args={[1.5, 0.9, 0.12]} />
      <meshStandardMaterial color={COLORES.madera} roughness={0.7} />
    </mesh>
  )
}