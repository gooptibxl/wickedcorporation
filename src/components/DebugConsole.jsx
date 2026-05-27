import { useState } from 'react'
import { useStore, selectTotal, selectEquipement } from '../store/useStore.js'
import { useConfigStore } from '../store/useConfigStore.js'
import { buildCart } from '../services/checkout.js'
import { formatPrix } from '../utils/format.js'
import { CATEGORIES, CATEGORY_LABELS } from '../data/catalogue.js'
import styles from './DebugConsole.module.css'

/**
 * Console de debug — toggleable via bouton flottant en bas à droite.
 *
 * Deux onglets :
 *   - STATE  : résumé live + cartes + équipement 3D + payload Stripe.
 *   - ADMIN  : sliders/inputs pour tuner le scale du perso, position+scale
 *              de chaque slot, scale par catégorie d'item. Tous les
 *              changements sont appliqués EN LIVE (lecture du config store
 *              par Character.jsx + EquippedItem.jsx).
 *
 * Utile pour ajuster un GLB qui sort trop gros/trop petit/mal positionné
 * SANS ré-exporter depuis Meshy.
 */

const TABS = [
  { id: 'state', label: 'State' },
  { id: 'admin', label: 'Admin' },
]

export default function DebugConsole() {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState('state')

  return (
    <>
      <button
        type="button"
        className={styles.toggle}
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Fermer la console debug' : 'Ouvrir la console debug'}
        title="Console debug"
      >
        {open ? '×' : '⌥'}
        <span className={styles.toggleLabel}>{open ? 'CLOSE' : 'DEBUG'}</span>
      </button>

      {open && (
        <aside className={styles.panel} aria-label="Console debug">
          <header className={styles.head}>
            <span className={styles.title}>— DEBUG</span>
            <nav className={styles.tabs} role="tablist">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.id}
                  className={`${styles.tab} ${tab === t.id ? styles.tabActive : ''}`}
                  onClick={() => setTab(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </nav>
            <button
              type="button"
              className={styles.close}
              onClick={() => setOpen(false)}
              aria-label="Fermer"
            >
              ×
            </button>
          </header>

          {tab === 'state' && <StateTab />}
          {tab === 'admin' && <AdminTab />}
        </aside>
      )}
    </>
  )
}

/* ============================================================================
 *  ONGLET STATE — lecture live de l'état Zustand
 * ============================================================================ */
function StateTab() {
  const cards = useStore((s) => s.cards)
  const total = selectTotal({ cards })
  const equipement = selectEquipement({ cards })
  const cart = buildCart(cards)

  return (
    <>
      <section className={styles.section}>
        <h3 className={styles.h3}>Resume</h3>
        <ul className={styles.kv}>
          <li><span className={styles.k}>cartes</span><span className={styles.v}>{cards.length}</span></li>
          <li><span className={styles.k}>desactivees</span><span className={styles.v}>{cards.filter((c) => c.desactivee).length}</span></li>
          <li><span className={styles.k}>equipement (3D)</span><span className={styles.v}>{equipement.length}</span></li>
          <li><span className={styles.k}>pieces (panier)</span><span className={styles.v}>{cart.qtyTotal}</span></li>
          <li><span className={styles.k}>total</span><span className={`${styles.v} ${styles.totalV}`}>{formatPrix(total)}</span></li>
        </ul>
      </section>

      <section className={styles.section}>
        <h3 className={styles.h3}>Cartes ({cards.length})</h3>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr><th>id</th><th>cat</th><th>produit</th><th>var.</th><th>tail.</th><th>qty</th><th>off</th></tr>
            </thead>
            <tbody>
              {cards.map((c) => (
                <tr key={c.id} className={c.desactivee ? styles.rowOff : undefined}>
                  <td>{c.id}</td>
                  <td>{c.categorie}</td>
                  <td>{c.produitId ?? '—'}</td>
                  <td>{c.varianteId ?? '—'}</td>
                  <td>{c.taille ?? '—'}</td>
                  <td>{c.quantite}</td>
                  <td>{c.desactivee ? '●' : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.h3}>Equipement 3D ({equipement.length})</h3>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr><th>slot</th><th>produit</th><th>couleur</th><th>fichier</th></tr>
            </thead>
            <tbody>
              {equipement.length === 0 && (
                <tr><td colSpan={4} className={styles.empty}>- rien d'equipe -</td></tr>
              )}
              {equipement.map((it) => (
                <tr key={it.cardId}>
                  <td>{it.slot}</td>
                  <td>{it.produit.nom}</td>
                  <td>
                    <span className={styles.swatchInline} style={{ backgroundColor: it.variante.couleur.hex }} aria-hidden="true" />
                    {it.variante.couleur.nom}
                  </td>
                  <td className={styles.path}>{it.variante.fichierGLB}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.h3}>Payload Stripe ({cart.items.length} ligne{cart.items.length > 1 ? 's' : ''})</h3>
        <pre className={styles.pre}>{JSON.stringify(cart, null, 2)}</pre>
      </section>
    </>
  )
}

/* ============================================================================
 *  ONGLET ADMIN — sliders/inputs pour tuner la 3D EN LIVE
 * ============================================================================ */
function AdminTab() {
  const characterScale = useConfigStore((s) => s.characterScale)
  const setCharacterScale = useConfigStore((s) => s.setCharacterScale)
  const characterPosition = useConfigStore((s) => s.characterPosition)
  const setCharacterPosition = useConfigStore((s) => s.setCharacterPosition)
  const slotOverrides = useConfigStore((s) => s.slotOverrides)
  const setSlotPosition = useConfigStore((s) => s.setSlotPosition)
  const setSlotRotation = useConfigStore((s) => s.setSlotRotation)
  const setSlotScale = useConfigStore((s) => s.setSlotScale)
  const itemScales = useConfigStore((s) => s.itemScales)
  const setItemScale = useConfigStore((s) => s.setItemScale)
  const resetConfig = useConfigStore((s) => s.resetConfig)
  const exportConfig = useConfigStore((s) => s.exportConfig)
  const importConfig = useConfigStore((s) => s.importConfig)

  // Copie la config dans le presse-papier sous forme de JSON formaté.
  const handleCopy = async () => {
    const json = exportConfig()
    try {
      await navigator.clipboard.writeText(json)
      // eslint-disable-next-line no-alert
      alert('Config copiée dans le presse-papier ✓')
    } catch {
      // Fallback : ouvre un prompt pour copier manuellement
      // eslint-disable-next-line no-alert
      window.prompt('Copie ce JSON :', json)
    }
  }

  // Télécharge un .json local de la config (utile pour la sauvegarder
  // en dehors du navigateur, par ex. pour le push dans le repo).
  const handleDownload = () => {
    const blob = new Blob([exportConfig()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
    a.href = url
    a.download = `wicked-admin-config-${stamp}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  // Prompt pour coller un JSON et l'appliquer.
  const handlePaste = () => {
    // eslint-disable-next-line no-alert
    const raw = window.prompt('Colle le JSON de config ici :')
    if (!raw) return
    const res = importConfig(raw)
    // eslint-disable-next-line no-alert
    alert(res.ok ? 'Config importée ✓' : 'Erreur : ' + res.error)
  }

  return (
    <>
      <section className={styles.section}>
        <header className={styles.adminHead}>
          <h3 className={styles.h3}>Personnage</h3>
          <div className={styles.adminTools}>
            <button type="button" className={styles.resetBtn} onClick={handleCopy} title="Copier la config dans le presse-papier (JSON)">
              ⧉ Copier
            </button>
            <button type="button" className={styles.resetBtn} onClick={handleDownload} title="Télécharger la config en fichier .json">
              ⬇ Telecharger
            </button>
            <button type="button" className={styles.resetBtn} onClick={handlePaste} title="Coller un JSON pour importer une config">
              ⧈ Importer
            </button>
            <button type="button" className={styles.resetBtn} onClick={resetConfig} title="Réinitialiser tous les overrides">
              ↻ Reset
            </button>
          </div>
        </header>
        <RangeRow
          label="Scale"
          value={characterScale}
          min={0.1}
          max={10}
          step={0.05}
          onChange={setCharacterScale}
        />
        {['x', 'y', 'z'].map((axis, i) => (
          <RangeRow
            key={`char-${axis}`}
            label={axis.toUpperCase()}
            value={characterPosition[i]}
            min={-3}
            max={3}
            step={0.01}
            onChange={(v) => setCharacterPosition(i, v)}
          />
        ))}
      </section>

      <section className={styles.section}>
        <h3 className={styles.h3}>Slots 3D - position, rotation & scale</h3>
        <p className={styles.hint}>
          POS x/y/z (gauche-droite / bas-haut / arriere-avant, en unites) ·
          ROT x/y/z (en degres, -180 a +180 = full pivot 360°) · scale.
          Utile par ex. pour orienter une bague autour du doigt.
        </p>
        {Object.keys(slotOverrides).map((slot) => (
          <SlotEditor
            key={slot}
            name={slot}
            data={slotOverrides[slot]}
            onPos={(axis, v) => setSlotPosition(slot, axis, v)}
            onRot={(axis, v) => setSlotRotation(slot, axis, v)}
            onScale={(v) => setSlotScale(slot, v)}
          />
        ))}
      </section>

      <section className={styles.section}>
        <h3 className={styles.h3}>Scale par categorie d'objet</h3>
        <p className={styles.hint}>
          Multiplicateur applique a TOUS les items d'une categorie.
        </p>
        {CATEGORIES.map((cat) => (
          <RangeRow
            key={cat}
            label={CATEGORY_LABELS[cat] ?? cat}
            value={itemScales[cat] ?? 1}
            min={0.05}
            max={5}
            step={0.05}
            onChange={(v) => setItemScale(cat, v)}
          />
        ))}
      </section>
    </>
  )
}

/* -------- Petits sous-composants admin -------- */

function RangeRow({ label, value, min, max, step, onChange }) {
  return (
    <div className={styles.row}>
      <span className={styles.rowLabel}>{label}</span>
      <input
        type="range"
        className={styles.range}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
      <input
        type="number"
        className={styles.numInput}
        min={min}
        max={max}
        step={step}
        value={value.toFixed(2)}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </div>
  )
}

/** Conversion radians ↔ degrés pour les inputs UI. */
const RAD_TO_DEG = 180 / Math.PI
const DEG_TO_RAD = Math.PI / 180

function SlotEditor({ name, data, onPos, onRot, onScale }) {
  const rotation = data.rotation ?? [0, 0, 0]
  return (
    <div className={styles.slotBlock}>
      <header className={styles.slotHead}>{name}</header>

      {/* Position X / Y / Z */}
      {['x', 'y', 'z'].map((axis, i) => (
        <RangeRow
          key={`pos-${axis}`}
          label={`pos ${axis.toUpperCase()}`}
          value={data.position[i]}
          min={-3}
          max={3}
          step={0.01}
          onChange={(v) => onPos(i, v)}
        />
      ))}

      {/* Rotation X / Y / Z — stockée en radians dans le store, mais saisie
          en DEGRÉS dans l'UI (plus intuitif : 90° plutôt que 1.5708 rad). */}
      {['x', 'y', 'z'].map((axis, i) => (
        <RangeRow
          key={`rot-${axis}`}
          label={`rot ${axis.toUpperCase()}`}
          value={rotation[i] * RAD_TO_DEG}
          min={-180}
          max={180}
          step={1}
          onChange={(deg) => onRot(i, deg * DEG_TO_RAD)}
        />
      ))}

      <RangeRow
        label="scale"
        value={data.scale}
        min={0.05}
        max={5}
        step={0.05}
        onChange={onScale}
      />
    </div>
  )
}
