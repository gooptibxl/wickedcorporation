import { useStore } from '../store/useStore.js'
import { CATEGORY_LABELS } from '../data/catalogue.js'
import styles from './CategoryPicker.module.css'

/**
 * Bloc unique en bas de la grille du panneau : "Ajouter une catégorie".
 *  - Affiche toutes les catégories pas encore actives sous forme de chips.
 *  - Un clic ajoute la catégorie comme nouvelle carte (via store).
 *  - Quand toutes les catégories sont actives, le composant ne rend rien.
 *
 * @param {{ available: string[] }} props  Catégories disponibles (calculées par <Panel>)
 */
export default function CategoryPicker({ available }) {
  const ajouterCarte = useStore((s) => s.ajouterCarte)

  if (!available || available.length === 0) return null

  return (
    <section className={styles.picker} aria-label="Ajouter une catégorie">
      <header className={styles.head}>
        <span className={styles.title}>Ajouter</span>
        <span className={styles.tick} aria-hidden="true" />
      </header>

      <ul className={styles.list}>
        {available.map((cat) => (
          <li key={cat}>
            <button
              type="button"
              className={styles.chip}
              onClick={() => ajouterCarte(cat)}
              aria-label={`Ajouter la catégorie ${CATEGORY_LABELS[cat] ?? cat}`}
              title={`Ajouter ${CATEGORY_LABELS[cat] ?? cat}`}
            >
              <span className={styles.chipLabel}>{CATEGORY_LABELS[cat] ?? cat}</span>
              <span className={styles.chipPlus} aria-hidden="true">+</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
