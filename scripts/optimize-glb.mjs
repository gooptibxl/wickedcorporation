/* =============================================================================
 *  optimize-glb.mjs — compression agressive via @gltf-transform/cli.
 * =============================================================================
 *  Lance :  node scripts/optimize-glb.mjs
 *
 *  Pipeline appliqué à chaque .glb :
 *   - flatten + join + weld + prune + sparse  (nettoyage / dédup)
 *   - simplify                                 (réduction LOD légère)
 *   - texture-compress → WebP                  (textures bcp + légères)
 *   - meshopt                                  (compression géométrie)
 *
 *  drei's useGLTF charge auto Draco ET Meshopt → aucun changement de code.
 * ============================================================================ */

import { execSync } from 'node:child_process'
import {
  readdirSync,
  statSync,
  copyFileSync,
  unlinkSync,
} from 'node:fs'
import { join } from 'node:path'

const MODELS_DIR = '/Users/admin/Desktop/wickedcorporation/public/models'

function walk(dir) {
  const out = []
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) out.push(...walk(full))
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
  const before = statSync(file).size
  totalBefore += before
  const tmp = file.replace(/\.glb$/, '.tmp.glb')
  try {
    execSync(
      `npx --no-install gltf-transform optimize "${file}" "${tmp}" --texture-compress webp`,
      { stdio: 'pipe' },
    )
    const after = statSync(tmp).size
    copyFileSync(tmp, file)
    unlinkSync(tmp)
    totalAfter += after
    const pct = ((1 - after / before) * 100).toFixed(1)
    const rel = file.replace(MODELS_DIR, '')
    console.log(
      `-${pct.padStart(5)}%  ${(before / 1e6).toFixed(1).padStart(6)} → ${(after / 1e6).toFixed(2).padStart(6)} MB  ${rel}`,
    )
  } catch (e) {
    failed++
    totalAfter += before
    console.warn(`FAILED ${file.replace(MODELS_DIR, '')}: ${e.message?.split('\n')[0]}`)
    try { unlinkSync(tmp) } catch {}
  }
}

const totalPct = ((1 - totalAfter / totalBefore) * 100).toFixed(1)
console.log(
  `\n──────────────────────────────────────────────────────────────`,
)
console.log(
  `Total: ${(totalBefore / 1e6).toFixed(1)} MB → ${(totalAfter / 1e6).toFixed(1)} MB  (-${totalPct}%)  · ${failed} échec(s)`,
)
