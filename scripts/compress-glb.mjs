/* =============================================================================
 *  compress-glb.mjs — compresse en Draco tous les .glb de public/models/.
 * =============================================================================
 *  Lance :  node scripts/compress-glb.mjs
 *
 *  - Walke récursivement public/models/, traite chaque .glb.
 *  - Compression Draco (geometry) → typiquement -50 à -70% de taille.
 *  - drei (useGLTF) charge automatiquement Draco depuis le CDN Google, donc
 *    aucune modif côté code.
 *  - Modifie les fichiers EN PLACE (écrasement). Les originaux non compressés
 *    restent disponibles dans fichier_glb/ si besoin de re-générer.
 * ============================================================================ */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import gltfPipeline from 'gltf-pipeline'

const MODELS_DIR = '/Users/admin/Desktop/wickedcorporation/public/models'

function walk(dir) {
  const out = []
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    const stat = statSync(full)
    if (stat.isDirectory()) out.push(...walk(full))
    else if (name.endsWith('.glb')) out.push(full)
  }
  return out
}

const files = walk(MODELS_DIR)
console.log(`Found ${files.length} .glb files\n`)

let totalBefore = 0
let totalAfter = 0
let failed = 0

for (const file of files) {
  const buf = readFileSync(file)
  const before = buf.length
  totalBefore += before
  try {
    const result = await gltfPipeline.processGlb(buf, {
      dracoOptions: {
        compressionLevel: 10,        // max
        quantizePositionBits: 14,
        quantizeNormalBits: 10,
        quantizeTexcoordBits: 12,
        quantizeColorBits: 8,
      },
    })
    const compressed = result.glb
    writeFileSync(file, compressed)
    totalAfter += compressed.length
    const pct = ((1 - compressed.length / before) * 100).toFixed(1)
    const rel = file.replace(MODELS_DIR, '')
    console.log(
      `-${pct.padStart(5)}%  ${(before / 1e6).toFixed(1).padStart(5)} → ${(compressed.length / 1e6).toFixed(1).padStart(5)} MB  ${rel}`,
    )
  } catch (e) {
    totalAfter += before
    failed++
    console.warn(
      `FAILED ${file.replace(MODELS_DIR, '')}: ${e.message ?? e}`,
    )
  }
}

const totalPct = ((1 - totalAfter / totalBefore) * 100).toFixed(1)
console.log(
  `\n──────────────────────────────────────────────────────────────`,
)
console.log(
  `Total: ${(totalBefore / 1e6).toFixed(1)} MB → ${(totalAfter / 1e6).toFixed(1)} MB  (-${totalPct}%)  · ${failed} échec(s)`,
)
