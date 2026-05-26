/* =============================================================================
 *  sizeMultiplier — facteur d'échelle 3D selon la taille sélectionnée.
 * =============================================================================
 *  Une taille L doit faire un tee VISIBLEMENT plus grand qu'une S sur le perso
 *  et dans la preview. On applique un multiplicateur SUBTIL (±5-10 %) en plus
 *  de l'échelle naturelle/auto-fit du modèle.
 *
 *  Conventions :
 *   - Tailles "lettres" (XS, S, M, L, XL) → map fixe.
 *   - Tailles numériques (Ring 50-60, Pants 28-36, …) → interpolation linéaire
 *     autour de la MÉDIANE des tailles disponibles du produit. La médiane
 *     correspond au scale 1.0, chaque pas s'éloigne de ±0.012.
 *
 *   `produit` est nécessaire pour les tailles numériques car la médiane dépend
 *   du produit (ex. Ring 50-60 → médiane 55, Pants 28-36 → médiane 32).
 * ============================================================================ */

/** Map fixe pour les tailles "lettres" — incréments ~5 %. */
const LETTER_SCALE = {
  XS: 0.92,
  S: 0.96,
  M: 1.0,
  L: 1.05,
  XL: 1.1,
  XXL: 1.15,
}

/** Variation par pas de taille numérique. 0.012 → ±6 % sur une plage de 10 unités. */
const NUMERIC_STEP = 0.012

/**
 * @param {{ tailles: string[] }} produit
 * @param {string|null|undefined} taille
 * @returns {number} multiplicateur (1.0 si pas de taille / pas applicable)
 */
export function sizeMultiplier(produit, taille) {
  if (!taille || !produit) return 1

  // Cas 1 : taille lettre (XS, S, M, L, XL)
  if (Object.prototype.hasOwnProperty.call(LETTER_SCALE, taille)) {
    return LETTER_SCALE[taille]
  }

  // Cas 2 : taille numérique → interpolation autour de la médiane des tailles
  // disponibles du produit.
  const nums = (produit.tailles || [])
    .map((t) => Number(t))
    .filter((n) => Number.isFinite(n))
  if (nums.length < 2) return 1

  const target = Number(taille)
  if (!Number.isFinite(target)) return 1

  const median = nums.reduce((a, b) => a + b, 0) / nums.length
  return 1 + (target - median) * NUMERIC_STEP
}
