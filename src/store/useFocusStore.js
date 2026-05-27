import { create } from 'zustand'

/* =============================================================================
 *  useFocusStore — état du mode "focus item".
 *  Quand l'utilisateur clique sur un item équipé sur le perso, on stocke ici
 *  l'id de la carte. La caméra zoome dessus et le suit (voir CameraFocus.jsx).
 *  Pan / drag → clearFocus → la caméra revient à sa pose initiale.
 * ============================================================================ */

export const useFocusStore = create((set) => ({
  focusedCardId: null,
  /** Compteur incrémenté à chaque demande de reset caméra. CameraFocus écoute
      cette valeur et anime le retour à la pose initiale. */
  resetSig: 0,
  focus: (cardId) => set({ focusedCardId: cardId }),
  clearFocus: () => set({ focusedCardId: null }),
  /** Demande le retour caméra à la pose initiale (vue d'accueil). */
  resetCamera: () =>
    set((s) => ({ focusedCardId: null, resetSig: s.resetSig + 1 })),
}))

if (import.meta.env?.DEV && typeof window !== 'undefined') {
  window.__focus__ = useFocusStore
}
