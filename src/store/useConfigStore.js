import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { SLOTS } from '../three/SLOTS.js'

/* =============================================================================
 *  useConfigStore — paramètres ajustables en live depuis le panneau ADMIN.
 *  PERSISTÉ dans localStorage ("wicked-config-v1") → tes réglages survivent
 *  au refresh. Reset → restaure les défauts ET vide la persistance.
 * ============================================================================ */

const DEFAULT_CHARACTER_SCALE = 3
const DEFAULT_CHARACTER_POSITION = [0, 0, 0]

function buildDefaultSlotConfig() {
  const out = {}
  for (const [name, cfg] of Object.entries(SLOTS)) {
    out[name] = {
      position: [...cfg.position],
      rotation: [...(cfg.rotation ?? [0, 0, 0])], // radians
      scale: cfg.scale,
    }
  }
  return out
}

const DEFAULT_ITEM_SCALES = {
  Hoodie: 1, Tee: 1, Pants: 1, Belt: 1, Necklace: 1,
  Bracelet: 1, Ring: 1, Glasses: 1, Cap: 1, Patch: 1,
}

export const useConfigStore = create(
  persist(
    (set) => ({
      characterScale: DEFAULT_CHARACTER_SCALE,
      characterPosition: [...DEFAULT_CHARACTER_POSITION],
      slotOverrides: buildDefaultSlotConfig(),
      itemScales: { ...DEFAULT_ITEM_SCALES },

      setCharacterScale(value) {
        const v = Math.max(0.01, Math.min(20, Number(value) || 1))
        set({ characterScale: v })
      },

      setCharacterPosition(axisIndex, value) {
        const v = Number(value)
        if (Number.isNaN(v)) return
        set((state) => {
          const next = [...state.characterPosition]
          next[axisIndex] = v
          return { characterPosition: next }
        })
      },

      setSlotPosition(slot, axisIndex, value) {
        const v = Number(value)
        if (Number.isNaN(v)) return
        set((state) => {
          const current = state.slotOverrides[slot]
          if (!current) return state
          const nextPos = [...current.position]
          nextPos[axisIndex] = v
          return {
            slotOverrides: {
              ...state.slotOverrides,
              [slot]: { ...current, position: nextPos },
            },
          }
        })
      },

      /** Met à jour une rotation (axe X/Y/Z, en radians) d'un slot. */
      setSlotRotation(slot, axisIndex, value) {
        const v = Number(value)
        if (Number.isNaN(v)) return
        set((state) => {
          const current = state.slotOverrides[slot]
          if (!current) return state
          const nextRot = [...(current.rotation ?? [0, 0, 0])]
          nextRot[axisIndex] = v
          return {
            slotOverrides: {
              ...state.slotOverrides,
              [slot]: { ...current, rotation: nextRot },
            },
          }
        })
      },

      setSlotScale(slot, value) {
        const v = Math.max(0.01, Math.min(20, Number(value) || 1))
        set((state) => {
          const current = state.slotOverrides[slot]
          if (!current) return state
          return {
            slotOverrides: {
              ...state.slotOverrides,
              [slot]: { ...current, scale: v },
            },
          }
        })
      },

      setItemScale(categorie, value) {
        const v = Math.max(0.01, Math.min(20, Number(value) || 1))
        set((state) => ({
          itemScales: { ...state.itemScales, [categorie]: v },
        }))
      },

      /**
       * Sérialise les réglages Admin en JSON (string) pour export.
       * Inclut characterScale, characterPosition, slotOverrides, itemScales.
       * N'inclut PAS les cards du panier (qui sont dans l'autre store).
       */
      exportConfig() {
        const s = get()
        return JSON.stringify(
          {
            characterScale: s.characterScale,
            characterPosition: s.characterPosition,
            slotOverrides: s.slotOverrides,
            itemScales: s.itemScales,
          },
          null,
          2,
        )
      },

      /**
       * Applique une config sérialisée. Accepte un objet ou une string JSON.
       * Merge proprement avec l'état actuel (les slots non fournis gardent
       * leur valeur, les nouveaux écrasent).
       * @returns {{ok: boolean, error?: string}}
       */
      importConfig(jsonOrObj) {
        try {
          const obj =
            typeof jsonOrObj === 'string' ? JSON.parse(jsonOrObj) : jsonOrObj
          if (!obj || typeof obj !== 'object') {
            return { ok: false, error: 'Pas un objet valide' }
          }
          set((state) => ({
            characterScale:
              typeof obj.characterScale === 'number'
                ? obj.characterScale
                : state.characterScale,
            characterPosition: Array.isArray(obj.characterPosition)
              ? obj.characterPosition
              : state.characterPosition,
            slotOverrides: obj.slotOverrides
              ? { ...state.slotOverrides, ...obj.slotOverrides }
              : state.slotOverrides,
            itemScales: obj.itemScales
              ? { ...state.itemScales, ...obj.itemScales }
              : state.itemScales,
          }))
          return { ok: true }
        } catch (e) {
          return { ok: false, error: e?.message ?? String(e) }
        }
      },

      resetConfig() {
        set({
          characterScale: DEFAULT_CHARACTER_SCALE,
          characterPosition: [...DEFAULT_CHARACTER_POSITION],
          slotOverrides: buildDefaultSlotConfig(),
          itemScales: { ...DEFAULT_ITEM_SCALES },
        })
      },
    }),
    {
      name: 'wicked-config-v1',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        characterScale: state.characterScale,
        characterPosition: state.characterPosition,
        slotOverrides: state.slotOverrides,
        itemScales: state.itemScales,
      }),
    },
  ),
)

if (import.meta.env?.DEV && typeof window !== 'undefined') {
  window.__config__ = useConfigStore
}
