import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import {
  CATEGORIES,
  produitsParCategorie,
  produitParId,
} from '../data/catalogue.js'

/**
 * Store global Zustand. Source de vérité unique pour les cartes du
 * configurateur + actions + sélecteurs.
 *
 * PERSISTÉ dans localStorage (clé "wicked-cart-v1") → un refresh garde l'état
 * du panier exactement comme il était. Évite le flash "j'ai perdu mes choix".
 *
 * Le compteur _cardSeq est resynchronisé après hydratation pour ne pas
 * réassigner d'anciens ids (sinon collision card-1 / card-1).
 */

let _cardSeq = 0
const nextCardId = () => `card-${++_cardSeq}`

function nouvelleCarte(categorie) {
  const produits = produitsParCategorie(categorie)
  const produit = produits[0]
  const variante = produit?.variantes?.[0]
  const taille = produit?.tailles?.[0] ?? null
  return {
    id: nextCardId(),
    categorie,
    produitId: produit?.id ?? null,
    varianteId: variante?.id ?? null,
    taille,
    quantite: 1,
    desactivee: false,
    // Override de slot 3D au niveau carte. Sert pour les bagues quand on en
    // porte plusieurs simultanément (chacune sur un slot de doigt différent).
    // null = utiliser produit.emplacement3D normal.
    slotOverride: null,
  }
}

/** Slots de doigt disponibles, dans l'ordre où on les distribue aux Rings. */
const RING_SLOTS = ['doigt', 'doigt-2', 'doigt-3']
export const RING_MAX = RING_SLOTS.length

/** Trouve le 1er slot de doigt non encore utilisé par les cartes Ring existantes. */
function nextFreeRingSlot(cards) {
  const used = new Set(
    cards
      .filter((c) => c.categorie === 'Ring' && c.slotOverride)
      .map((c) => c.slotOverride),
  )
  return RING_SLOTS.find((s) => !used.has(s)) ?? null
}

// Catégories affichées au premier chargement (avant que l'utilisateur
// ajoute/retire). On choisit celles dont au moins une variante GLB est
// déjà déployée dans public/models/ pour que la démo Vercel soit immédiate-
// ment visuelle. À étendre quand de nouveaux GLB arrivent (ex. rebasculer
// sur ['Hoodie', 'Tee', 'Belt', 'Necklace'] une fois tous déployés).
const CATEGORIES_INITIALES = ['Cap', 'Glasses', 'Bracelet', 'Ring']

/** Met _cardSeq à la valeur max trouvée dans une liste de cartes, pour
 *  que les prochains nextCardId() ne créent pas de doublons. */
function syncCardSeqFrom(cards) {
  let max = 0
  for (const c of cards || []) {
    const m = typeof c?.id === 'string' && c.id.match(/^card-(\d+)$/)
    if (m) max = Math.max(max, parseInt(m[1], 10))
  }
  _cardSeq = max
}

export const useStore = create(
  persist(
    (set) => ({
      cards: CATEGORIES_INITIALES.map(nouvelleCarte),

      ajouterCarte(categorie) {
        if (!CATEGORIES.includes(categorie)) {
          console.warn(`[store] catégorie inconnue: ${categorie}`)
          return
        }
        set((state) => {
          const newCard = nouvelleCarte(categorie)
          // Cas spécial Ring : on peut en porter jusqu'à RING_MAX (3) en même
          // temps. On assigne automatiquement le 1er slot de doigt libre.
          // Si tous occupés → on n'ajoute rien.
          if (categorie === 'Ring') {
            const slot = nextFreeRingSlot(state.cards)
            if (!slot) return state
            newCard.slotOverride = slot
          }
          return { cards: [...state.cards, newCard] }
        })
      },

      retirerCarte(cardId) {
        set((state) => ({ cards: state.cards.filter((c) => c.id !== cardId) }))
      },

      setProduit(cardId, produitId) {
        set((state) => ({
          cards: state.cards.map((c) => {
            if (c.id !== cardId) return c
            const p = produitParId(produitId)
            if (!p) return c
            return {
              ...c,
              produitId: p.id,
              varianteId: p.variantes[0]?.id ?? null,
              taille: p.tailles[0] ?? null,
            }
          }),
        }))
      },

      setVariante(cardId, varianteId) {
        set((state) => ({
          cards: state.cards.map((c) =>
            c.id === cardId ? { ...c, varianteId } : c,
          ),
        }))
      },

      setTaille(cardId, taille) {
        set((state) => ({
          cards: state.cards.map((c) => (c.id === cardId ? { ...c, taille } : c)),
        }))
      },

      setQuantite(cardId, quantite) {
        const q = Math.max(1, Math.floor(Number(quantite) || 1))
        set((state) => ({
          cards: state.cards.map((c) =>
            c.id === cardId ? { ...c, quantite: q } : c,
          ),
        }))
      },

      toggleDesactiveeCarte(cardId) {
        set((state) => ({
          cards: state.cards.map((c) =>
            c.id === cardId ? { ...c, desactivee: !c.desactivee } : c,
          ),
        }))
      },

      reset() {
        _cardSeq = 0
        set({ cards: CATEGORIES_INITIALES.map(nouvelleCarte) })
      },
    }),
    {
      name: 'wicked-cart-v1',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // Ne persiste QUE les cards (pas les fonctions, évident, mais on cadre).
      partialize: (state) => ({ cards: state.cards }),
      onRehydrateStorage: () => (state) => {
        if (state?.cards?.length) syncCardSeqFrom(state.cards)
      },
    },
  ),
)

/** Total panier en centimes. Les cartes désactivées sont exclues. */
export function selectTotal(state) {
  return state.cards.reduce((sum, c) => {
    if (c.desactivee) return sum
    const p = produitParId(c.produitId)
    return sum + (p ? p.prix * c.quantite : 0)
  }, 0)
}

/** Liste des items équipés sur le perso (résolus). Les désactivés sont exclus. */
export function selectEquipement(state) {
  const items = []
  for (const c of state.cards) {
    if (c.desactivee) continue
    const produit = produitParId(c.produitId)
    if (!produit) continue
    const variante = produit.variantes.find((v) => v.id === c.varianteId)
    if (!variante) continue
    items.push({
      cardId: c.id,
      // slotOverride (ex. Ring sur doigt-2) prime sur l'emplacement par défaut
      slot: c.slotOverride ?? produit.emplacement3D,
      produit,
      variante,
      taille: c.taille,
      quantite: c.quantite,
    })
  }
  return items
}

// Dev inspection
if (import.meta.env?.DEV && typeof window !== 'undefined') {
  window.__store__ = useStore
  window.__selectTotal__ = selectTotal
  window.__selectEquipement__ = selectEquipement
  // eslint-disable-next-line no-console
  console.log(
    '%c[store] prêt — __store__.getState() / persist localStorage:wicked-cart-v1',
    'color:#c252ff; font-weight:600',
  )
}
