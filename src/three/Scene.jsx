import { useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import Character from './Character.jsx'
import CharacterRig from './CharacterRig.jsx'
import Equipment from './Equipment.jsx'
import styles from './Scene.module.css'

/* =============================================================================
 *  ROTATION CAMÉRA (orbit autour du perso). Le perso lui-même ne tourne pas.
 * =========================================================================== */

/** Horizontal : 16 positions sur 360° → 22.5° / clic (boucle naturelle). */
const AZIMUTH_STEP = (Math.PI * 2) / 16
/** Vertical : 16 positions sur 180° → 11.25° / clic. */
const POLAR_STEP = Math.PI / 16

/**
 * Drag souris = PAN (translation X/Y, pas de rotation orbitale).
 * Les 4 boutons ‹ › ⌃ ⌄ font tourner LA CAMÉRA autour du perso :
 *   - ‹ ›  → azimuthal (Y mondial), 22.5° par clic, illimité (boucle 360°)
 *   - ⌃ ⌄  → polar (haut-bas), 11.25° par clic, clampé [0, 180°]
 * Zoom inchangé (molette / pinch), centré sur le curseur.
 */
export default function Scene() {
  const controlsRef = useRef(null)

  const tournerGauche = () => {
    const c = controlsRef.current
    if (!c) return
    c.setAzimuthalAngle(c.getAzimuthalAngle() - AZIMUTH_STEP)
    c.update()
  }
  const tournerDroite = () => {
    const c = controlsRef.current
    if (!c) return
    c.setAzimuthalAngle(c.getAzimuthalAngle() + AZIMUTH_STEP)
    c.update()
  }
  const tournerHaut = () => {
    const c = controlsRef.current
    if (!c) return
    const next = Math.max(0, c.getPolarAngle() - POLAR_STEP)
    c.setPolarAngle(next)
    c.update()
  }
  const tournerBas = () => {
    const c = controlsRef.current
    if (!c) return
    const next = Math.min(Math.PI, c.getPolarAngle() + POLAR_STEP)
    c.setPolarAngle(next)
    c.update()
  }

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

        <CharacterRig>
          <Character />
          <Equipment />
        </CharacterRig>

        <OrbitControls
          ref={controlsRef}
          target={[0, 1, 0]}
          // ── ROTATION ORBITALE DÉSACTIVÉE AU DRAG ──
          // Le drag souris ne fait PLUS tourner la caméra. La rotation passe
          // uniquement par les 4 boutons (azimuth + polar).
          enableRotate={false}
          // ── PAN ACTIVÉ ──
          enablePan={true}
          screenSpacePanning={true}
          panSpeed={1.2}
          mouseButtons={{
            LEFT: THREE.MOUSE.PAN,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.PAN,
          }}
          touches={{
            ONE: THREE.TOUCH.PAN,
            TWO: THREE.TOUCH.DOLLY_PAN,
          }}
          // Polar full range [0, π] = 180° (vue du dessus → vue du dessous).
          minPolarAngle={0}
          maxPolarAngle={Math.PI}
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

      {/* Rotation caméra horizontale (azimuthal, 22.5° / clic) */}
      <button
        type="button"
        className={`${styles.spinBtn} ${styles.spinLeft}`}
        onClick={tournerGauche}
        aria-label="Tourner la caméra à gauche"
        title="Tourner la caméra à gauche (22.5°)"
      >
        ‹
      </button>
      <button
        type="button"
        className={`${styles.spinBtn} ${styles.spinRight}`}
        onClick={tournerDroite}
        aria-label="Tourner la caméra à droite"
        title="Tourner la caméra à droite (22.5°)"
      >
        ›
      </button>

      {/* Rotation caméra verticale (polar, 11.25° / clic) */}
      <button
        type="button"
        className={`${styles.spinBtn} ${styles.spinUp}`}
        onClick={tournerHaut}
        aria-label="Caméra vers le haut"
        title="Caméra vers le haut (11.25°)"
      >
        ⌃
      </button>
      <button
        type="button"
        className={`${styles.spinBtn} ${styles.spinDown}`}
        onClick={tournerBas}
        aria-label="Caméra vers le bas"
        title="Caméra vers le bas (11.25°)"
      >
        ⌄
      </button>
    </div>
  )
}
