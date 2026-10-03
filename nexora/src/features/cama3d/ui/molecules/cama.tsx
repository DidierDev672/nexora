import { Almohada } from '../atoms/almohada'
import { Cabecero } from '../atoms/cabecero'
import { CamaBase } from '../atoms/cama-base'
import { Cobija } from '../atoms/cobija'
import { Colchon } from '../atoms/colchon'
import { Pata } from '../atoms/pata'

const PATAS: ReadonlyArray<[number, number, number]> = [
  [-0.58, 0.36, -0.85],
  [0.58, 0.36, -0.85],
  [-0.58, 0.36, 0.85],
  [0.58, 0.36, 0.85],
]

export interface CamaProps {
  scale?: number
  capacity?: number
}

export function Cama({ scale = 1, capacity = 1 }: CamaProps) {
  const dosAlmohadas = capacity > 1

  return (
    <group scale={scale}>
      <Cabecero />
      <CamaBase />
      {PATAS.map((position) => (
        <Pata key={position.join(',')} position={position} />
      ))}
      <Colchon />
      {dosAlmohadas ? (
        <>
          <Almohada position={[-0.19, 1.16, -0.66]} rotation={[0.12, 0, -0.05]} />
          <Almohada position={[0.19, 1.16, -0.66]} rotation={[0.12, 0, 0.05]} />
        </>
      ) : (
        <Almohada />
      )}
      <Cobija />
    </group>
  )
}