/**
 * =============================================================================
 *  CATALOGUE PRODUITS — WickedCorporation V2
 * =============================================================================
 *
 *  AJOUTER UN PRODUIT :
 *   1. Pousser un objet dans CATALOGUE.
 *   2. Déposer les GLB dans public/models/<cat-en-min>/<id-produit>/<id-variante>.glb
 *
 *  RETIRER UN PRODUIT :
 *   1. Supprimer son entrée de CATALOGUE.
 *   2. (Optionnel) Supprimer son dossier sous public/models/.
 *
 *  AJOUTER UNE CATÉGORIE :
 *   - L'ajouter dans CATEGORIES.
 *   - Ajouter le slot dans EMPLACEMENTS_3D.
 *   - Définir la position dans src/three/SLOTS.js.
 *   - Définir la forme placeholder dans src/three/CATEGORY_SHAPES.js.
 *   - Créer public/models/<cat-en-min>/.
 *
 *  Tous les chemins GLB sont AUTO-DÉRIVÉS depuis (categorie, produit.id,
 *  variante.id) — voir buildGlbPath() + post-process en bas de ce fichier.
 * =============================================================================
 */

export const CATEGORIES = [
  'Hoodie',
  'Tee',
  'Pants',
  'Belt',
  'Necklace',
  'Bracelet',
  'Ring',
  'Glasses',
  'Cap',
  'Patch',
]

/** Libellés affichés à l'utilisateur (français). Les IDs internes restent en
    anglais pour la stabilité (refs partout dans le code). */
export const CATEGORY_LABELS = {
  Hoodie:   'Hoodie',
  Tee:      'T-shirt',
  Pants:    'Pantalon',
  Belt:     'Ceinture',
  Necklace: 'Collier',
  Bracelet: 'Bracelet',
  Ring:     'Bague',
  Glasses:  'Lunettes',
  Cap:      'Casquette',
  Patch:    'Pièces cousues',
}

export const EMPLACEMENTS_3D = [
  'torse',
  'jambes',
  'taille',
  'cou',
  'poignet',
  'doigt',
  'visage',
  'tete',
  'patch',
]

/** Convention : /models/<categorie>/<produit-id>/<variante-id>.glb */
function buildGlbPath(categorie, produitId, varianteId) {
  return `/models/${categorie.toLowerCase()}/${produitId}/${varianteId}.glb`
}

/** Chemin du modèle GLB du personnage (chargé par Character.jsx plus tard). */
export const CHARACTER_GLB_PATH = '/models/character.glb'

/** @type {Produit[]} */
export const CATALOGUE = [
  // ----------------------------- HOODIE --------------------------------------
  {
    id: 'hoodie-001',
    nom: 'Hoodie Oversize Brut',
    categorie: 'Hoodie',
    prix: 8900,
    variantes: [
      { id: 'noir', couleur: { nom: 'Noir charbon', hex: '#1a1a1a' } },
      { id: 'ecru', couleur: { nom: 'Écru',         hex: '#e8dfcf' } },
      { id: 'kaki', couleur: { nom: 'Kaki délavé',  hex: '#6b7a4a' } },
    ],
    tailles: ['S', 'M', 'L', 'XL'],
    unique: false,
    stock: 24,
    emplacement3D: 'torse',
  },
  {
    id: 'hoodie-002',
    nom: 'Hoodie Patchwork 1/1',
    categorie: 'Hoodie',
    prix: 18000,
    variantes: [
      { id: 'mix', couleur: { nom: 'Patchwork bleu/rouille', hex: '#3a4a6a' } },
    ],
    tailles: ['M'],
    unique: true,
    stock: 1,
    emplacement3D: 'torse',
  },

  // ----------------------------- TEE -----------------------------------------
  {
    id: 'tee-001',
    nom: 'Tee Heavy Cotton',
    categorie: 'Tee',
    prix: 3500,
    variantes: [
      { id: 'blanc',   couleur: { nom: 'Blanc cassé', hex: '#f3efe8' } },
      { id: 'noir',    couleur: { nom: 'Noir',        hex: '#101010' } },
      { id: 'lavande', couleur: { nom: 'Lavande',     hex: '#b3a3d9' } },
    ],
    tailles: ['S', 'M', 'L'],
    unique: false,
    stock: 42,
    emplacement3D: 'torse',
  },
  {
    id: 'tee-002',
    nom: 'Tee Crop Recyclé',
    categorie: 'Tee',
    prix: 4200,
    variantes: [
      { id: 'gris',  couleur: { nom: 'Gris béton',   hex: '#7d7d7d' } },
      { id: 'rouge', couleur: { nom: 'Rouge brique', hex: '#9a3b2a' } },
    ],
    tailles: ['XS', 'S', 'M'],
    unique: false,
    stock: 18,
    emplacement3D: 'torse',
  },

  // ----------------------------- PANTS ---------------------------------------
  {
    id: 'pants-001',
    nom: 'Pantalon Cargo Wide',
    categorie: 'Pants',
    prix: 11000,
    variantes: [
      { id: 'noir',  couleur: { nom: 'Noir',        hex: '#0c0c0c' } },
      { id: 'sable', couleur: { nom: 'Sable',       hex: '#c9b48a' } },
      { id: 'kaki',  couleur: { nom: 'Kaki sombre', hex: '#4d5a35' } },
    ],
    tailles: ['28', '30', '32', '34', '36'],
    unique: false,
    stock: 15,
    emplacement3D: 'jambes',
  },
  {
    id: 'pants-002',
    nom: 'Pantalon Patché Atelier 1/1',
    categorie: 'Pants',
    prix: 22000,
    variantes: [
      { id: 'unique', couleur: { nom: 'Denim + toile crue', hex: '#3a4d6b' } },
    ],
    tailles: ['32'],
    unique: true,
    stock: 1,
    emplacement3D: 'jambes',
  },

  // ----------------------------- BELT ----------------------------------------
  {
    id: 'belt-001',
    nom: 'Ceinture Cuir Récupéré',
    categorie: 'Belt',
    prix: 5500,
    variantes: [
      { id: 'cognac', couleur: { nom: 'Cognac', hex: '#8a4a1f' } },
      { id: 'noir',   couleur: { nom: 'Noir',   hex: '#1c1c1c' } },
    ],
    tailles: [],
    unique: false,
    stock: 12,
    emplacement3D: 'taille',
  },
  {
    id: 'belt-002',
    nom: 'Ceinture Toile Militaire',
    categorie: 'Belt',
    prix: 3800,
    variantes: [
      { id: 'olive', couleur: { nom: 'Olive',       hex: '#586540' } },
      { id: 'creme', couleur: { nom: 'Crème',       hex: '#d8cfb6' } },
      { id: 'navy',  couleur: { nom: 'Bleu marine', hex: '#1f2a44' } },
    ],
    tailles: [],
    unique: false,
    stock: 28,
    emplacement3D: 'taille',
  },

  // ----------------------------- NECKLACE ------------------------------------
  {
    id: 'necklace-001',
    nom: 'Collier Chaîne Acier',
    categorie: 'Necklace',
    prix: 4500,
    variantes: [
      { id: 'silver', couleur: { nom: 'Argent brossé', hex: '#c8c8cc' } },
      { id: 'gold',   couleur: { nom: 'Doré',         hex: '#caa24f' } },
    ],
    tailles: [],
    unique: false,
    stock: 9,
    emplacement3D: 'cou',
  },
  {
    id: 'necklace-002',
    nom: 'Pendentif Verre Soufflé 1/1',
    categorie: 'Necklace',
    prix: 9800,
    variantes: [
      { id: 'piece', couleur: { nom: 'Verre bleu nuit', hex: '#1c2a55' } },
    ],
    tailles: [],
    unique: true,
    stock: 1,
    emplacement3D: 'cou',
  },

  // ----------------------------- BRACELET ------------------------------------
  {
    id: 'bracelet-001',
    nom: 'Bracelet Corde Tressée',
    categorie: 'Bracelet',
    prix: 1900,
    variantes: [
      { id: 'noir',  couleur: { nom: 'Noir',  hex: '#161616' } },
      { id: 'beige', couleur: { nom: 'Beige', hex: '#c8b596' } },
      { id: 'rouge', couleur: { nom: 'Rouge', hex: '#a52a2a' } },
    ],
    tailles: [],
    unique: false,
    stock: 35,
    emplacement3D: 'poignet',
  },
  {
    id: 'bracelet-002',
    nom: 'Manchette Cuir Clouté',
    categorie: 'Bracelet',
    prix: 6800,
    variantes: [
      { id: 'noir',   couleur: { nom: 'Noir',   hex: '#0e0e0e' } },
      { id: 'cognac', couleur: { nom: 'Cognac', hex: '#7d4a1c' } },
    ],
    tailles: [],
    unique: false,
    stock: 14,
    emplacement3D: 'poignet',
  },

  // ----------------------------- RING ----------------------------------------
  {
    id: 'ring-001',
    nom: 'Bague Signet Acier',
    categorie: 'Ring',
    prix: 3900,
    variantes: [
      { id: 'silver', couleur: { nom: 'Argent brossé', hex: '#c8c8cc' } },
      { id: 'gold',   couleur: { nom: 'Doré',         hex: '#caa24f' } },
      { id: 'noir',   couleur: { nom: 'Acier noirci', hex: '#1a1a1a' } },
    ],
    tailles: ['50', '52', '54', '56', '58', '60'],
    unique: false,
    stock: 22,
    emplacement3D: 'doigt',
  },
  {
    id: 'ring-002',
    nom: 'Bague Sertie Pierre Brute 1/1',
    categorie: 'Ring',
    prix: 14500,
    variantes: [
      { id: 'piece', couleur: { nom: 'Pierre lunaire / argent', hex: '#9aa6c0' } },
    ],
    tailles: ['54'],
    unique: true,
    stock: 1,
    emplacement3D: 'doigt',
  },

  // ----------------------------- GLASSES -------------------------------------
  {
    id: 'glasses-001',
    nom: 'Lunettes Upcyclées Carrées',
    categorie: 'Glasses',
    prix: 12000,
    variantes: [
      { id: 'noir',    couleur: { nom: 'Acétate noir', hex: '#111111' } },
      { id: 'ecaille', couleur: { nom: 'Écaille',     hex: '#6b3a1b' } },
      { id: 'cristal', couleur: { nom: 'Cristal fumé', hex: '#a8a8b0' } },
    ],
    tailles: [],
    unique: false,
    stock: 11,
    emplacement3D: 'visage',
  },
  {
    id: 'glasses-002',
    nom: 'Lunettes Pilote 1/1',
    categorie: 'Glasses',
    prix: 18500,
    variantes: [
      { id: 'or', couleur: { nom: 'Métal doré, verres ambre', hex: '#caa24f' } },
    ],
    tailles: [],
    unique: true,
    stock: 1,
    emplacement3D: 'visage',
  },

  // ----------------------------- CAP -----------------------------------------
  {
    id: 'cap-001',
    nom: 'Casquette Trucker Brodée',
    categorie: 'Cap',
    prix: 4200,
    variantes: [
      { id: 'noir',     couleur: { nom: 'Noir',         hex: '#0e0e0e' } },
      { id: 'kaki',     couleur: { nom: 'Kaki',         hex: '#5b6a3e' } },
      { id: 'blanc',    couleur: { nom: 'Blanc cassé',  hex: '#ece6d8' } },
      { id: 'bordeaux', couleur: { nom: 'Bordeaux',     hex: '#6b1f2c' } },
    ],
    tailles: [],
    unique: false,
    stock: 20,
    emplacement3D: 'tete',
  },
  {
    id: 'cap-002',
    nom: 'Casquette 5-Panel Patchée 1/1',
    categorie: 'Cap',
    prix: 8900,
    variantes: [
      { id: 'piece', couleur: { nom: 'Toile mix vintage', hex: '#7a5a3a' } },
    ],
    tailles: [],
    unique: true,
    stock: 1,
    emplacement3D: 'tete',
  },

  // ----------------------------- PATCH (pièces cousues) ---------------------
  {
    id: 'patch-001',
    nom: 'Patch Brodé Wicked',
    categorie: 'Patch',
    prix: 1500,
    variantes: [
      { id: 'rouge', couleur: { nom: 'Rouge',  hex: '#a52a2a' } },
      { id: 'noir',  couleur: { nom: 'Noir',   hex: '#0a0a0a' } },
      { id: 'creme', couleur: { nom: 'Crème',  hex: '#dbcfb1' } },
    ],
    tailles: [],
    unique: false,
    stock: 50,
    emplacement3D: 'patch',
  },
  {
    id: 'patch-002',
    nom: 'Pièce Brodée Main 1/1',
    categorie: 'Patch',
    prix: 6800,
    variantes: [
      { id: 'unique', couleur: { nom: 'Fil or sur toile sombre', hex: '#caa24f' } },
    ],
    tailles: [],
    unique: true,
    stock: 1,
    emplacement3D: 'patch',
  },
]

// Auto-injection des chemins GLB depuis la convention buildGlbPath.
// Auto-injection d'un tableau "photos" vide par défaut (à remplir manuellement
// par variante avec des URLs absolues vers les vraies photos produit).
//   Convention recommandée : /photos/<categorie>/<produit-id>/<variante-id>/01.jpg
for (const produit of CATALOGUE) {
  for (const variante of produit.variantes) {
    if (!variante.fichierGLB) {
      variante.fichierGLB = buildGlbPath(produit.categorie, produit.id, variante.id)
    }
    if (!Array.isArray(variante.photos)) {
      variante.photos = []
    }
  }
}

export function produitsParCategorie(categorie) {
  return CATALOGUE.filter((p) => p.categorie === categorie)
}

export function produitParId(id) {
  return CATALOGUE.find((p) => p.id === id)
}

/**
 * @typedef {Object} Couleur
 * @property {string} nom
 * @property {string} hex
 */
/**
 * @typedef {Object} Variante
 * @property {string}  id
 * @property {Couleur} couleur
 * @property {string}  [fichierGLB]
 */
/**
 * @typedef {Object} Produit
 * @property {string}     id
 * @property {string}     nom
 * @property {('Hoodie'|'Tee'|'Pants'|'Belt'|'Necklace'|'Bracelet'|'Ring'|'Glasses')} categorie
 * @property {number}     prix
 * @property {Variante[]} variantes
 * @property {string[]}   tailles
 * @property {boolean}    unique
 * @property {number}     stock
 * @property {('torse'|'jambes'|'taille'|'cou'|'poignet'|'doigt'|'visage')} emplacement3D
 */
