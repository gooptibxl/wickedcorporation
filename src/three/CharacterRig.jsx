import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

/**
 * Wrapper PUR : anime uniquement la lévitation EN BLOC du perso.
 * La rotation est maintenant gérée côté CAMÉRA (OrbitControls dans Scene.jsx)
 * → on tourne la vue autour du perso, le perso lui-même reste fixe.
 */

const FLOAT_AMPLITUDE = 0.07
const FLOAT_SPEED = 1.2

export default function CharacterRig({ children, baseY = 0 }) {
  const groupRef = useRef(null)

  useFrame((state) => {
    const group = groupRef.current
    if (!group) return
    const t = state.clock.getElapsedTime()
    group.position.y = baseY + Math.sin(t * FLOAT_SPEED) * FLOAT_AMPLITUDE
  })

  return <group ref={groupRef}>{children}</group>
}
