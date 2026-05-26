import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import Character from './Character.jsx'
import CharacterRig from './CharacterRig.jsx'
import Equipment from './Equipment.jsx'
import styles from './Scene.module.css'

/** Pas de rotation par clic. PI/4 = 45°. */
const ROTATION_STEP = Math.PI / 4

export default function Scene() {
  const [rotationY, setRotationY] = useState(0)
  const tournerGauche = () => setRotationY((r) => r - ROTATION_STEP)
  const tournerDroite = () => setRotationY((r) => r + ROTATION_STEP)

  return (
    <div className={styles.wrapper}>
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 1.4, 4], fov: 35, near: 0.1, far: 50 }}
        style={{ display: 'block', width: '100%', height: '100%' }}
      >
        {/* Fond WebGL bleu-mauve clair (style hologramme). Le grain animé
            est dessus côté HTML, voir .hologramGrain dans Scene.module.css. */}
        <color attach="background" args={['#a8a4e8']} />
        <fog attach="fog" args={['#a8a4e8', 14, 40]} />

        {/* Lumière ambiante un peu plus présente pour cohérence avec le bg clair. */}
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

        {/* Sol = grand disque mauve plus sombre que le bg pour le grounding. */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <circleGeometry args={[20, 64]} />
          <meshStandardMaterial color="#5a3082" />
        </mesh>

        {/* Podium : un disque rasant sous les pieds + un anneau émissif autour.
            Hauteur ~5 mm pour ne pas faire flotter le perso : l'anneau crée
            l'effet "spotlight" comme dans la référence sans surélever. */}
        <group name="podium" position={[0, 0, 0]}>
          <mesh position={[0, 0.003, 0]} receiveShadow>
            <cylinderGeometry args={[1.0, 1.05, 0.006, 64]} />
            <meshStandardMaterial
              color="#3a1f55"
              metalness={0.5}
              roughness={0.4}
            />
          </mesh>
          {/* Anneau émissif violet vif — fait le bord lumineux du podium */}
          <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.98, 1.02, 96]} />
            <meshBasicMaterial color="#d97aff" toneMapped={false} />
          </mesh>
        </group>

        {/* Petit halo lumineux émanant du sol (point light très bas, faible
            distance) pour renforcer l'effet "subject sous spot". */}
        <pointLight
          position={[0, 0.2, 0]}
          intensity={1.6}
          distance={4}
          decay={2}
          color="#d97aff"
        />

        <CharacterRig targetRotationY={rotationY}>
          <Character />
          <Equipment />
        </CharacterRig>

        <OrbitControls
          target={[0, 1, 0]}
          enablePan={false}
          // Zoom débridé : on peut s'approcher très près (0.3 = ~30 cm du
          // sujet, pour voir les détails brodés / textures) et reculer
          // jusqu'à 12 unités pour une vue d'ensemble large.
          minDistance={0.3}
          maxDistance={12}
          // Zoom centré sur le CURSEUR (pas sur le target fixe). Le target
          // se déplace pour garder le point sous la souris immobile à
          // l'écran → comportement Google Maps / Blender.
          zoomToCursor
          // Vitesse de zoom un poil boostée pour que les petits incréments
          // soient plus efficaces avec la dynamic range élargie.
          zoomSpeed={1.2}
          // Rotation verticale autorisée au drag (haut/bas) mais bornée pour
          // ne pas regarder le perso pile d'au-dessus ou pile d'en-dessous.
          // π/6 → 5π/6 = ±60° autour de l'horizontale. Largement assez pour
          // observer la casquette ou les chaussures.
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={(5 * Math.PI) / 6}
          enableDamping
          dampingFactor={0.08}
        />
      </Canvas>

      {/* Overlays HTML "hologramme" — au-dessus du canvas, pointer-events:none
          pour ne pas voler les clics du canvas / des flèches. */}
      <div className={styles.hologramScan} aria-hidden="true" />
      <div className={styles.hologramGrain} aria-hidden="true" />

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
    </div>
  )
}
