import { create } from 'zustand'

/* =============================================================================
 *  useFocusStore — état du mode "focus item".
 *  Quand l'utilisateur clique sur un item équipé sur le perso, on stocke ici
 *  l'id de la carte. La caméra zoome dessus et le suit (voir CameraFocus.jsx).
 *  Pan / drag → clearFocus → la caméra revient à sa pose initiale.
 * ============================================================================ */

export const useFocusStore = create((set) => ({
  focusedCardId: null,
  focus: (cardId) => set({ focusedCardId: cardId }),
  clearFocus: () => set({ focusedCardId: null }),
}))

if (import.meta.env?.DEV && typeof window !== 'undefined') {
  window.__focus__ = useFocusStore
}
