/* =============================================================================
 *  SLOTS — points d'ancrage 3D sur le personnage (origine = pieds, +Y up, +Z front)
 * ============================================================================ */

export const SLOTS = {
  // Centre du torse (entre y=0.9 et y=1.55)
  torse:   { position: [0, 1.225, 0], rotation: [0, 0, 0], scale: 1 },
  // Milieu des jambes
  jambes:  { position: [0, 0.45, 0],  rotation: [0, 0, 0], scale: 1 },
  // Jonction torse/jambes (ceinture)
  taille:  { position: [0, 0.9, 0],   rotation: [0, 0, 0], scale: 1 },
  // Interstice cou
  cou:     { position: [0, 1.57, 0],  rotation: [0, 0, 0], scale: 1 },
  // Pas de bras → côté droit du torse à mi-hauteur
  poignet: { position: [0.34, 1.1, 0], rotation: [0, 0, 0], scale: 1 },
  // Trois positions de doigt → le client peut porter jusqu'à 3 bagues
  // simultanément. Offsets symboliques (le perso n'a pas de vrais doigts).
  doigt:     { position: [0.40, 0.95, 0.00], rotation: [0, 0, 0], scale: 1 },
  'doigt-2': { position: [0.45, 0.93, 0.05], rotation: [0, 0, 0], scale: 1 },
  'doigt-3': { position: [0.50, 0.91, 0.10], rotation: [0, 0, 0], scale: 1 },
  // Devant le visage (tête sphère y≈1.78 r=0.18 → z=0.18 = surface avant)
  visage:  { position: [0, 1.78, 0.18], rotation: [0, 0, 0], scale: 1 },
  // Au-dessus de la tête (top tête y≈1.96, on pose la casquette juste dessus)
  tete:    { position: [0, 2.03, 0],   rotation: [0, 0, 0], scale: 1 },
  // Sur le devant du torse, partie haute (poitrine), pour les pièces cousues
  patch:   { position: [0, 1.35, 0.17], rotation: [0, 0, 0], scale: 1 },
}
