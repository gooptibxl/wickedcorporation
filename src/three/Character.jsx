import SafeGLB from './SafeGLB.jsx'
import { CHARACTER_GLB_PATH } from '../data/catalogue.js'
import { useConfigStore } from '../store/useConfigStore.js'

/**
 * Personnage : essaie de charger /models/character.glb.
 * Si absent ou erreur → fallback sur le placeholder géométrique.
 *
 * Conventions du .glb attendu :
 *   - 1 unité = 1 mètre
 *   - hauteur ~1.80 m
 *   - pieds à Y=0
 *   - regard vers +Z
 */

const LEG_HEIGHT = 0.9
const LEG_RADIUS = 0.11
const LEG_GAP = 0.16
const TORSO_WIDTH = 0.55
const TORSO_HEIGHT = 0.65
const TORSO_DEPTH = 0.3
const HEAD_RADIUS = 0.18
const SKIN = '#c9a17a'

function PlaceholderBody() {
  return (
    <group name="character-placeholder">
      <mesh castShadow position={[-LEG_GAP, LEG_HEIGHT / 2, 0]}>
        <cylinderGeometry args={[LEG_RADIUS, LEG_RADIUS, LEG_HEIGHT, 16]} />
        <meshStandardMaterial color={SKIN} />
      </mesh>
      <mesh castShadow position={[LEG_GAP, LEG_HEIGHT / 2, 0]}>
        <cylinderGeometry args={[LEG_RADIUS, LEG_RADIUS, LEG_HEIGHT, 16]} />
        <meshStandardMaterial color={SKIN} />
      </mesh>
      <mesh castShadow position={[0, LEG_HEIGHT + TORSO_HEIGHT / 2, 0]}>
        <boxGeometry args={[TORSO_WIDTH, TORSO_HEIGHT, TORSO_DEPTH]} />
        <meshStandardMaterial color={SKIN} />
      </mesh>
      <mesh castShadow position={[0, LEG_HEIGHT + TORSO_HEIGHT + HEAD_RADIUS + 0.05, 0]}>
        <sphereGeometry args={[HEAD_RADIUS, 32, 32]} />
        <meshStandardMaterial color={SKIN} />
      </mesh>
    </group>
  )
}

export default function Character() {
  // Scale et position ajustables EN LIVE depuis le panneau ADMIN.
  const scale = useConfigStore((s) => s.characterScale)
  const position = useConfigStore((s) => s.characterPosition)
  return (
    <group position={position}>
      <SafeGLB
        url={CHARACTER_GLB_PATH}
        scale={scale}
        fallback={<PlaceholderBody />}
      />
    </group>
  )
}
