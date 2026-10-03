import { COLORES } from '../lib/colores'

export interface SofaPataProps {
  position: [number, number, number]
}

export function SofaPata({ position }: SofaPataProps) {
  return (
    <mesh position={position} castShadow>
      <cylinderGeometry args={[0.04, 0.05, 0.16, 12]} />
      <meshStandardMaterial color={COLORES.madera} roughness={0.8} />
    </mesh>
  )
}