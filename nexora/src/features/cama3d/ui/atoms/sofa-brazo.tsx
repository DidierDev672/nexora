import { COLORES } from '../lib/colores'

export interface SofaBrazoProps {
  position: [number, number, number]
}

export function SofaBrazo({ position }: SofaBrazoProps) {
  return (
    <mesh position={position} castShadow>
      <boxGeometry args={[0.18, 0.55, 0.84]} />
      <meshStandardMaterial color={COLORES.cobija} roughness={0.9} />
    </mesh>
  )
}