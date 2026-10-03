import { ContactShadows, OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { escalaCama, esTipoSofa } from '../../domain/tipo-cama'
import { Cama } from '../molecules/cama'
import { Sofa } from '../molecules/sofa'

export interface EscenaTipoCamaProps {
  name: string
  capacity: number
  staticModel?: boolean
  className?: string
}

export function EscenaTipoCama({
  name,
  capacity,
  staticModel = false,
  className,
}: EscenaTipoCamaProps) {
  const sofa = esTipoSofa(name)

  return (
    <div
      className={
        className ??
        'relative h-52 w-full overflow-hidden border-b border-line bg-linear-to-b from-canvas to-panel'
      }
    >
      <Canvas dpr={[1, 1.5]} shadows camera={{ position: [3.2, 2.4, 4.2], fov: 42 }}>
        <ambientLight intensity={0.65} />
        <directionalLight
          position={[4, 6, 3]}
          intensity={1.6}
          castShadow
          shadow-mapSize-width={512}
          shadow-mapSize-height={512}
        />
        <directionalLight position={[-4, 2, -2]} intensity={0.4} color="#ffe6c2" />
        {sofa ? (
          <Sofa capacity={capacity} scale={escalaCama(capacity) * 0.85} />
        ) : (
          <Cama capacity={capacity} scale={escalaCama(capacity)} />
        )}
        <ContactShadows
          position={[0, 0.001, 0]}
          opacity={0.4}
          scale={6}
          blur={2.2}
          far={3}
          color="#1a110b"
        />
        {!staticModel ? (
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            minDistance={2.6}
            maxDistance={5}
            maxPolarAngle={Math.PI / 2.15}
            autoRotate
            autoRotateSpeed={0.8}
          />
        ) : null}
      </Canvas>
    </div>
  )
}