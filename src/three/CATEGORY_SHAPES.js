/* =============================================================================
 *  CATEGORY_SHAPES — primitives placeholder par catégorie (avant les vrais GLB)
 * ============================================================================ */

const HALF_PI = Math.PI / 2

export const CATEGORY_SHAPES = {
  Hoodie:   { type: 'box',      args: [0.66, 0.74, 0.36],     localPos: [0, 0, 0],     localRot: [0, 0, 0] },
  Tee:      { type: 'box',      args: [0.6, 0.58, 0.32],      localPos: [0, -0.05, 0], localRot: [0, 0, 0] },
  Pants:    { type: 'box',      args: [0.42, 0.94, 0.34],     localPos: [0, 0, 0],     localRot: [0, 0, 0] },
  Belt:     { type: 'torus',    args: [0.3, 0.045, 8, 28],    localPos: [0, 0, 0],     localRot: [-HALF_PI, 0, 0] },
  Necklace: { type: 'torus',    args: [0.18, 0.02, 8, 32],    localPos: [0, 0, 0],     localRot: [-HALF_PI, 0, 0] },
  Bracelet: { type: 'torus',    args: [0.05, 0.014, 8, 24],   localPos: [0, 0, 0],     localRot: [0, HALF_PI, 0] },
  Ring:     { type: 'torus',    args: [0.011, 0.003, 8, 20],  localPos: [0, 0, 0],     localRot: [0, HALF_PI, 0] },
  Glasses:  { type: 'box',      args: [0.36, 0.08, 0.03],     localPos: [0, 0, 0],     localRot: [0, 0, 0] },
  // Casquette : crown approximée par une boîte plate.
  Cap:      { type: 'box',      args: [0.42, 0.17, 0.42],     localPos: [0, 0, 0],     localRot: [0, 0, 0] },
  // Pièce cousue : petite plaque carrée sur la poitrine.
  Patch:    { type: 'box',      args: [0.14, 0.14, 0.012],    localPos: [0, 0, 0],     localRot: [0, 0, 0] },
}
