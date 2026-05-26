import { useStore, RING_MAX } from '../store/useStore.js'
import { CATEGORIES } from '../data/catalogue.js'
import ProductCard from './ProductCard.jsx'
import CategoryPicker from './CategoryPicker.jsx'
import CartFooter from './CartFooter.jsx'
import styles from './Panel.module.css'

export default function Panel() {
  const cards = useStore((s) => s.cards)

  // Pour la majorité des catégories : si elle est déjà dans le panneau,
  // on la cache du picker. EXCEPTION pour Ring : on permet jusqu'à
  // RING_MAX (3) bagues simultanées → on n'enlève Ring du picker que
  // quand on a atteint la limite.
  const ringCount = cards.filter((c) => c.categorie === 'Ring').length
  const categoriesActivesSet = new Set(
    cards.map((c) => c.categorie).filter((cat) => cat !== 'Ring'),
  )
  if (ringCount >= RING_MAX) categoriesActivesSet.add('Ring')

  const categoriesDisponibles = CATEGORIES.filter(
    (c) => !categoriesActivesSet.has(c),
  )

  return (
    <div className={styles.panel} aria-label="Configurateur">
      <div className={styles.scroll}>
        <div className={styles.list}>
          {cards.map((card) => (
            <ProductCard key={card.id} card={card} />
          ))}
          <CategoryPicker available={categoriesDisponibles} />
        </div>
      </div>
      <CartFooter />
    </div>
  )
}
