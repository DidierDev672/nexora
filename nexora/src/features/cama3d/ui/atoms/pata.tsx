import { COLORES } from '../lib/colores'

const ALTURA = 0.7
const RADIO = 0.07

export interface PataProps {
  position: [number, number, number]
}

export function Pata({ position }: PataProps) {
  return (
    <mesh position={position} castShadow>
      <cylinderGeometry args={[RADIO * 0.8, RADIO, ALTURA, 18]} />
      <meshStandardMaterial color={COLORES.madera} roughness={0.8} />
    </mesh>
  )
}