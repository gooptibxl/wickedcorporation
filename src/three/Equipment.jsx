import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useStore, selectEquipement } from '../store/useStore.js'
import EquippedItem from './EquippedItem.jsx'

/**
 * Orchestrateur d'équipement.
 *  - Lit cards du store, déduplique par slot (dernier gagnant).
 *  - Garde les items "exiting" dans un état local le temps que leur anim
 *    de sortie se termine, puis les retire vraiment.
 */
export default function Equipment() {
  const cards = useStore((s) => s.cards)

  const desired = useMemo(() => {
    const items = selectEquipement({ cards })
    const bySlot = new Map()
    for (const it of items) bySlot.set(it.slot, it)
    return [...bySlot.values()]
  }, [cards])

  const [tracked, setTracked] = useState(() =>
    desired.map((d) => ({ ...d, exiting: false })),
  )

  const sig = useMemo(
    () =>
      desired
        .map((d) => `${d.cardId}:${d.produit.id}:${d.variante.id}:${d.slot}`)
        .join('|'),
    [desired],
  )

  const desiredRef = useRef(desired)
  desiredRef.current = desired

  useEffect(() => {
    setTracked((prev) => {
      const d = desiredRef.current
      const desiredIds = new Set(d.map((x) => x.cardId))
      const prevIds = new Set(prev.map((x) => x.cardId))
      const next = []
      for (const t of prev) {
        if (desiredIds.has(t.cardId)) {
          const fresh = d.find((x) => x.cardId === t.cardId)
          next.push({ ...fresh, exiting: false })
        } else {
          next.push({ ...t, exiting: true })
        }
      }
      for (const item of d) {
        if (!prevIds.has(item.cardId)) {
          next.push({ ...item, exiting: false })
        }
      }
      return next
    })
  }, [sig])

  const handleExited = useCallback((cardId) => {
    setTracked((prev) => prev.filter((t) => t.cardId !== cardId))
  }, [])

  return (
    <group name="equipment">
      {tracked.map((it) => (
        <EquippedItem
          key={it.cardId}
          cardId={it.cardId}
          slot={it.slot}
          produit={it.produit}
          variante={it.variante}
          taille={it.taille}
          exiting={it.exiting}
          onExited={handleExited}
        />
      ))}
    </group>
  )
}
