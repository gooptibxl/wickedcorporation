import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import Character from './Character.jsx'
import CharacterRig from './CharacterRig.jsx'
import Equipment from './Equipment.jsx'
import styles from './Scene.module.css'

/** Pas de rotation par clic sur les flèches. PI/4 = 45°. */
const ROTATION_STEP = Math.PI / 4
/** Limite haute/basse de la rotation X du perso pour ne pas le voir cul par-dessus tête. */
const ROTATION_X_LIMIT = Math.PI / 3 // ±60°

/**
 * Drag souris = PAN (translation X/Y, pas de rotation orbitale).
 * Rotation du perso uniquement via les 4 boutons : ‹ › (Y) et ⌃ ⌄ (X).
 * Zoom inchangé (molette / pinch), centré sur le curseur.
 */
export default function Scene() {
  const [rotationY, setRotationY] = useState(0)
  const [rotationX, setRotationX] = useState(0)

  const tournerGauche = () => setRotationY((r) => r - ROTATION_STEP)
  const tournerDroite = () => setRotationY((r) => r + ROTATION_STEP)
  // X : on clamp pour ne pas faire de loopings.
  const tournerHaut = () =>
    setRotationX((r) => Math.max(-ROTATION_X_LIMIT, r - ROTATION_STEP))
  const tournerBas = () =>
    setRotationX((r) => Math.min(ROTATION_X_LIMIT, r + ROTATION_STEP))

  return (
    <div className={styles.wrapper}>
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 1.4, 4], fov: 35, near: 0.1, far: 50 }}
        style={{ display: 'block', width: '100%', height: '100%' }}
      >
        <color attach="background" args={['#a8a4e8']} />
        <fog attach="fog" args={['#a8a4e8', 14, 40]} />

        <ambientLight intensity={0.55} />
        <directionalLight
          castShadow
          position={[4, 6, 3]}
          intensity={1.45}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-left={-3}
          shadow-camera-right={3}
          shadow-camera-top={3}
          shadow-camera-bottom={-3}
          shadow-camera-near={0.5}
          shadow-camera-far={20}
          shadow-bias={-0.0005}
        />

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <circleGeometry args={[20, 64]} />
          <meshStandardMaterial color="#5a3082" />
        </mesh>

        <group name="podium" position={[0, 0, 0]}>
          <mesh position={[0, 0.003, 0]} receiveShadow>
            <cylinderGeometry args={[1.0, 1.05, 0.006, 64]} />
            <meshStandardMaterial
              color="#3a1f55"
              metalness={0.5}
              roughness={0.4}
            />
          </mesh>
          <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.98, 1.02, 96]} />
            <meshBasicMaterial color="#d97aff" toneMapped={false} />
          </mesh>
        </group>

        <pointLight
          position={[0, 0.2, 0]}
          intensity={1.6}
          distance={4}
          decay={2}
          color="#d97aff"
        />

        <CharacterRig
          targetRotationY={rotationY}
          targetRotationX={rotationX}
        >
          <Character />
          <Equipment />
        </CharacterRig>

        <OrbitControls
          target={[0, 1, 0]}
          // ── ROTATION ORBITALE DÉSACTIVÉE ──
          // Le drag souris ne fait PLUS tourner la caméra autour du perso.
          // On veut un comportement "pan fixe" : la vue se translate
          // verticalement/horizontalement sans changer d'angle.
          enableRotate={false}
          // ── PAN ACTIVÉ ──
          enablePan={true}
          // Pan en "screen space" : on déplace dans le plan de la caméra,
          // pas dans le plan du monde → comportement naturel sur tous les
          // angles. Sans ce flag, le pan vertical bouge sur l'axe Z aussi.
          screenSpacePanning={true}
          panSpeed={1.2}
          // Clic gauche → pan (par défaut c'est rotate). Du coup tout drag
          // souris = pan, sans avoir besoin du clic droit ou de Cmd+clic.
          mouseButtons={{
            LEFT: THREE.MOUSE.PAN,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.PAN,
          }}
          // Un doigt sur mobile/trackpad → pan ; deux doigts → zoom.
          touches={{
            ONE: THREE.TOUCH.PAN,
            TWO: THREE.TOUCH.DOLLY_PAN,
          }}
          // Zoom inchangé.
          enableZoom={true}
          minDistance={0.3}
          maxDistance={12}
          zoomToCursor
          zoomSpeed={1.2}
          enableDamping
          dampingFactor={0.08}
        />
      </Canvas>

      <div className={styles.hologramScan} aria-hidden="true" />
      <div className={styles.hologramGrain} aria-hidden="true" />

      {/* Flèches rotation horizontale (axe Y du perso) */}
      <button
        type="button"
        className={`${styles.spinBtn} ${styles.spinLeft}`}
        onClick={tournerGauche}
        aria-label="Tourner le personnage à gauche"
        title="Tourner à gauche (45°)"
      >
        ‹
      </button>
      <button
        type="button"
        className={`${styles.spinBtn} ${styles.spinRight}`}
        onClick={tournerDroite}
        aria-label="Tourner le personnage à droite"
        title="Tourner à droite (45°)"
      >
        ›
      </button>

      {/* Flèches rotation verticale (axe X du perso) */}
      <button
        type="button"
        className={`${styles.spinBtn} ${styles.spinUp}`}
        onClick={tournerHaut}
        aria-label="Basculer le personnage vers le haut"
        title="Basculer vers le haut (45°)"
      >
        ⌃
      </button>
      <button
        type="button"
        className={`${styles.spinBtn} ${styles.spinDown}`}
        onClick={tournerBas}
        aria-label="Basculer le personnage vers le bas"
        title="Basculer vers le bas (45°)"
      >
        ⌄
      </button>
    </div>
  )
}
