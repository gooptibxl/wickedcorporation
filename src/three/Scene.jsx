import { useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import Character from './Character.jsx'
import CharacterRig from './CharacterRig.jsx'
import Equipment from './Equipment.jsx'
import CameraFocus from './CameraFocus.jsx'
import { useFocusStore } from '../store/useFocusStore.js'
import styles from './Scene.module.css'

/* =============================================================================
 *  ROTATION + ZOOM CAMÉRA (orbit autour du perso). Le perso lui-même ne tourne pas.
 * =========================================================================== */

/** Horizontal : 12 positions sur 360° → 30° / clic (boucle naturelle). */
const AZIMUTH_STEP = (Math.PI * 2) / 12
/** Vertical : 12 positions sur 180° → 15° / clic. */
const POLAR_STEP = Math.PI / 12
/** Facteur multiplicatif appliqué à la distance caméra-target à chaque clic
 *  zoom +/- (0.85 = on se rapproche de 15 %, 1/0.85 ≈ 1.176 = on s'éloigne). */
const ZOOM_STEP = 0.85
const ZOOM_MIN_DISTANCE = 0.3
const ZOOM_MAX_DISTANCE = 12

/**
 * Drag souris = PAN (translation X/Y, pas de rotation orbitale).
 * Les 4 boutons ‹ › ⌃ ⌄ font tourner LA CAMÉRA autour du perso :
 *   - ‹ ›  → azimuthal (Y mondial), 30° par clic, illimité (boucle 360°)
 *   - ⌃ ⌄  → polar (haut-bas), 15° par clic, clampé [0, 180°]
 * Zoom inchangé (molette / pinch), centré sur le curseur.
 */
export default function Scene() {
  const controlsRef = useRef(null)
  const resetCamera = useFocusStore((s) => s.resetCamera)

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

  // Zoom = on déplace la caméra le long du vecteur target→camera. Plus court
  // = plus proche. On clamp à [minDistance, maxDistance] des OrbitControls.
  const zoomIn = () => {
    const c = controlsRef.current
    if (!c) return
    const cam = c.object
    const offset = cam.position.clone().sub(c.target)
    const next = Math.max(ZOOM_MIN_DISTANCE, offset.length() * ZOOM_STEP)
    offset.setLength(next)
    cam.position.copy(c.target).add(offset)
    c.update()
  }
  const zoomOut = () => {
    const c = controlsRef.current
    if (!c) return
    const cam = c.object
    const offset = cam.position.clone().sub(c.target)
    const next = Math.min(ZOOM_MAX_DISTANCE, offset.length() / ZOOM_STEP)
    offset.setLength(next)
    cam.position.copy(c.target).add(offset)
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

        <CameraFocus controlsRef={controlsRef} />

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
        title="Tourner la caméra à gauche (30°)"
      >
        ‹
      </button>
      <button
        type="button"
        className={`${styles.spinBtn} ${styles.spinRight}`}
        onClick={tournerDroite}
        aria-label="Tourner la caméra à droite"
        title="Tourner la caméra à droite (30°)"
      >
        ›
      </button>

      {/* Rotation caméra verticale (polar, 11.25° / clic) */}
      <button
        type="button"
        className={`${styles.spinBtn} ${styles.spinUp}`}
        onClick={tournerHaut}
        aria-label="Caméra vers le haut"
        title="Caméra vers le haut (15°)"
      >
        ⌃
      </button>
      <button
        type="button"
        className={`${styles.spinBtn} ${styles.spinDown}`}
        onClick={tournerBas}
        aria-label="Caméra vers le bas"
        title="Caméra vers le bas (15°)"
      >
        ⌄
      </button>

      {/* Bloc zoom + reset, en haut à droite de la zone 3D. */}
      <div className={styles.zoomCluster}>
        <button
          type="button"
          className={styles.zoomBtn}
          onClick={zoomIn}
          aria-label="Zoomer"
          title="Zoomer"
        >
          +
        </button>
        <button
          type="button"
          className={styles.zoomBtn}
          onClick={zoomOut}
          aria-label="Dézoomer"
          title="Dézoomer"
        >
          −
        </button>
        <button
          type="button"
          className={`${styles.zoomBtn} ${styles.resetBtn}`}
          onClick={resetCamera}
          aria-label="Revenir à la vue initiale"
          title="Vue initiale"
        >
          ⊕
        </button>
      </div>
    </div>
  )
}
