import { useStore } from '../store/useStore.js'
import { buildCart, checkout } from '../services/checkout.js'
import { formatPrix } from '../utils/format.js'
import styles from './CartFooter.module.css'

export default function CartFooter() {
  const cards = useStore((s) => s.cards)
  const cart = buildCart(cards)
  const isEmpty = cart.items.length === 0

  const handleBuy = () => {
    if (isEmpty) return
    checkout(cart).catch((err) => {
      // eslint-disable-next-line no-console
      console.error('[CartFooter] checkout error:', err)
    })
  }

  const articlesLabel = isEmpty
    ? ''
    : `${cart.items.length} article${cart.items.length > 1 ? 's' : ''} · ` +
      `${cart.qtyTotal} pièce${cart.qtyTotal > 1 ? 's' : ''}`

  return (
    <footer className={styles.footer} aria-label="Total et paiement">
      <div className={styles.summary}>
        <div className={styles.summaryLeft}>
          <span className={styles.totalLabel}>Total</span>
          <span className={styles.total} aria-live="polite">
            {formatPrix(cart.total)}
          </span>
        </div>
        <div className={styles.count}>
          {isEmpty ? <span className={styles.empty}>Panier vide</span> : articlesLabel}
        </div>
      </div>

      <button
        type="button"
        className={styles.btn}
        onClick={handleBuy}
        disabled={isEmpty}
        aria-label={
          isEmpty
            ? 'Panier vide, achat indisponible'
            : `Acheter tout le contenu du panier (${formatPrix(cart.total)})`
        }
      >
        <span>Buy Everything</span>
        <span className={styles.arrow} aria-hidden="true">→</span>
      </button>
    </footer>
  )
}
