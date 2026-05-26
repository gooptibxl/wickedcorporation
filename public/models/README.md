# Modèles 3D — convention de stockage

Tous les fichiers `.glb` du configurateur vivent ici. Le code
(`src/data/catalogue.js`) dérive **automatiquement** le chemin de chaque modèle
depuis cette convention. Tu ne tapes aucun chemin — juste dépose le `.glb` au
bon endroit avec le bon nom.

## Convention

```
public/models/
├── character.glb                          ← le personnage (un seul fichier)
└── <categorie-en-minuscules>/
    └── <produit-id>/
        └── <variante-id>.glb
```

### Exemples

| Produit              | Variante  | Fichier attendu                                   |
|----------------------|-----------|---------------------------------------------------|
| `hoodie-001`         | `noir`    | `public/models/hoodie/hoodie-001/noir.glb`        |
| `hoodie-001`         | `ecru`    | `public/models/hoodie/hoodie-001/ecru.glb`        |
| `hoodie-002` (1/1)   | `mix`     | `public/models/hoodie/hoodie-002/mix.glb`         |
| `ring-001`           | `silver`  | `public/models/ring/ring-001/silver.glb`          |
| `glasses-002` (1/1)  | `or`      | `public/models/glasses/glasses-002/or.glb`        |

## Ajouter / retirer un produit

**Ajout** : pousse un nouvel objet dans `CATALOGUE` (`src/data/catalogue.js`),
puis dépose les `.glb` correspondants dans
`public/models/<cat>/<id>/<variante-id>.glb`.

**Retrait** : supprime l'entrée de `CATALOGUE`. *(Optionnel)* Supprime le
dossier `public/models/<cat>/<id>/`.

## Conventions générales

- Format : **`.glb`** (binaire, un seul fichier).
- Échelle : **1 unité = 1 mètre**.
- Axes : **Y up**, **Z forward**.
- Origine : au **point d'attache naturel** du slot.

## Le personnage

`public/models/character.glb` — hauteur ~1.80 m, pieds à Y=0, regard +Z.

## Liste complète attendue (29 GLB produits + 1 perso = 30)

```
character.glb

hoodie/hoodie-001/   noir.glb, ecru.glb, kaki.glb
hoodie/hoodie-002/   mix.glb

tee/tee-001/         blanc.glb, noir.glb, lavande.glb
tee/tee-002/         gris.glb, rouge.glb

pants/pants-001/     noir.glb, sable.glb, kaki.glb
pants/pants-002/     unique.glb

belt/belt-001/       cognac.glb, noir.glb
belt/belt-002/       olive.glb, creme.glb, navy.glb

necklace/necklace-001/   silver.glb, gold.glb
necklace/necklace-002/   piece.glb

bracelet/bracelet-001/   noir.glb, beige.glb, rouge.glb
bracelet/bracelet-002/   noir.glb, cognac.glb

ring/ring-001/       silver.glb, gold.glb, noir.glb
ring/ring-002/       piece.glb

glasses/glasses-001/   noir.glb, ecaille.glb, cristal.glb
glasses/glasses-002/   or.glb
```

Tant qu'un fichier n'est pas présent, le placeholder procédural défini dans
`src/three/CATEGORY_SHAPES.js` s'affiche à sa place (le branchement final
`useGLTF` est documenté dans `src/three/EquippedItem.jsx` sous "TODO GLB").
