import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { SLOTS } from './SLOTS.js'
import SafeGLB from './SafeGLB.jsx'
import { useConfigStore } from '../store/useConfigStore.js'
import { sizeMultiplier } from '../utils/size.js'

/**
 * Un objet équipé à son ancre (slot).
 *
 *  - Charge variante.fichierGLB via <SafeGLB>.
 *  - Si le fichier n'existe pas / load échoue → RIEN ne s'affiche
 *    (plus de primitive procédurale fantôme). Choix UX explicite : un slot
 *    vide est préférable à un cube/torus brut qui ne représente rien.
 *  - Position / scale du slot lus depuis useConfigStore → ajustables EN LIVE.
 *  - Anime la SCALE du group parent (entrée 0→1, sortie 1→0).
 */

const SCALE_LERP_SPEED = 12
const EXIT_DONE_THRESHOLD = 0.02

export default function EquippedItem({
  cardId,
  slot,
  produit,
  variante,
  taille,
  exiting,
  onExited,
}) {
  const slotOverride = useConfigStore((s) => s.slotOverrides[slot])
  const itemScale = useConfigStore((s) => s.itemScales[produit.categorie] ?? 1)
  // Multiplicateur d'échelle selon la taille sélectionnée (XS<S<M<L<XL,
  // 50<52<54…). Subtil mais visible (~±5-10 %).
  const sizeMult = sizeMultiplier(produit, taille)

  const slotStatic = SLOTS[slot]
  const slotConfig = slotOverride
    ? {
        position: slotOverride.position,
        // Si l'override contient une rotation custom (cas typique : les
        // bagues qu'on oriente sur le doigt via l'Admin), on l'utilise.
        // Sinon on retombe sur la rotation statique du slot.
        rotation: slotOverride.rotation ?? slotStatic?.rotation ?? [0, 0, 0],
        scale: slotOverride.scale,
      }
    : slotStatic

  const groupRef = useRef(null)
  const progressRef = useRef(0.0001)
  const exitedSignaled = useRef(false)

  useFrame((_state, delta) => {
    const group = groupRef.current
    if (!group) return

    const target = exiting ? 0 : 1
    const kScale = 1 - Math.exp(-SCALE_LERP_SPEED * delta)
    progressRef.current += (target - progressRef.current) * kScale
    const slotScale = slotConfig?.scale ?? 1
    group.scale.setScalar(progressRef.current * slotScale * itemScale * sizeMult)

    if (
      exiting &&
      !exitedSignaled.current &&
      progressRef.current < EXIT_DONE_THRESHOLD
    ) {
      exitedSignaled.current = true
      onExited?.(cardId)
    }
  })

  if (!slotConfig || !variante) return null

  return (
    <group
      ref={groupRef}
      position={slotConfig.position}
      rotation={slotConfig.rotation}
      scale={progressRef.current}
      name={`slot:${slot}`}
    >
      {/* fallback=null → si le .glb manque, l'emplacement reste vide.
          Plus de primitive procédurale visible sur le perso. */}
      <SafeGLB url={variante.fichierGLB} fallback={null} />
    </group>
  )
}
