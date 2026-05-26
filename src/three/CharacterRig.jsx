import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

/**
 * Wrapper PUR : anime la lévitation EN BLOC + applique une rotation Y cible
 * interpolée en douceur. Tout ce qui est dans children hérite des deux.
 */

const FLOAT_AMPLITUDE = 0.07
const FLOAT_SPEED = 1.2
const ENABLE_AUTO_ROTATION = false
const AUTO_ROTATION_SPEED = 0.15
const ROTATION_LERP_SPEED = 8

export default function CharacterRig({ children, baseY = 0, targetRotationY = 0 }) {
  const groupRef = useRef(null)

  useFrame((state, delta) => {
    const group = groupRef.current
    if (!group) return
    const t = state.clock.getElapsedTime()

    group.position.y = baseY + Math.sin(t * FLOAT_SPEED) * FLOAT_AMPLITUDE

    if (ENABLE_AUTO_ROTATION) {
      group.rotation.y = t * AUTO_ROTATION_SPEED
    } else {
      const k = 1 - Math.exp(-ROTATION_LERP_SPEED * delta)
      group.rotation.y += (targetRotationY - group.rotation.y) * k
    }
  })

  return <group ref={groupRef}>{children}</group>
}
