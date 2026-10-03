import { SofaAsiento } from '../atoms/sofa-asiento'
import { SofaBase } from '../atoms/sofa-base'
import { SofaBrazo } from '../atoms/sofa-brazo'
import { SofaPata } from '../atoms/sofa-pata'
import { SofaRespaldo } from '../atoms/sofa-respaldo'

const ANCHO_ASIENTO = 0.48
const ANCHO_BRAZO = 0.18
const GAP_ASIENTOS = 0.02
const ALTURA_ASIENTO = 0.3

export interface SofaProps {
  capacity?: number
  scale?: number
}

function crearPosicionesAsientos(cantidad: number, ancho: number): Array<[number, number, number]> {
  const inicioX = -ancho / 2 + ANCHO_BRAZO + ANCHO_ASIENTO / 2
  return Array.from({ length: cantidad }, (_, index) => [
    inicioX + index * (ANCHO_ASIENTO + GAP_ASIENTOS),
    ALTURA_ASIENTO,
    -0.06,
  ])
}

export function Sofa({ capacity = 2, scale = 1 }: SofaProps) {
  const asientos = Math.min(Math.max(capacity, 1), 4)
  const ancho = asientos * ANCHO_ASIENTO + 2 * ANCHO_BRAZO + (asientos - 1) * GAP_ASIENTOS

  const posicionesBrazos: Array<[number, number, number]> = [
    [-ancho / 2 + ANCHO_BRAZO / 2, 0.33, -0.04],
    [ancho / 2 - ANCHO_BRAZO / 2, 0.33, -0.04],
  ]

  const posicionesPatas: Array<[number, number, number]> = [
    [-ancho / 2 + 0.12, 0.08, -0.3],
    [ancho / 2 - 0.12, 0.08, -0.3],
    [-ancho / 2 + 0.12, 0.08, 0.22],
    [ancho / 2 - 0.12, 0.08, 0.22],
  ]

  return (
    <group scale={scale}>
      {posicionesPatas.map((position) => (
        <SofaPata key={`pata-${position.join(',')}`} position={position} />
      ))}
      <SofaBase length={ancho - 0.02} />
      <SofaRespaldo length={ancho - 0.02} />
      {posicionesBrazos.map((position) => (
        <SofaBrazo key={`brazo-${position.join(',')}`} position={position} />
      ))}
      {crearPosicionesAsientos(asientos, ancho).map((position) => (
        <SofaAsiento key={`asiento-${position.join(',')}`} position={position} />
      ))}
    </group>
  )
}