import { useState } from 'react'
import { useStore } from '../store/useStore.js'
import {
  produitParId,
  produitsParCategorie,
  CATEGORY_LABELS,
} from '../data/catalogue.js'
import { formatPrix } from '../utils/format.js'
import { sizeMultiplier } from '../utils/size.js'
import { buildCart, checkout } from '../services/checkout.js'
import CardPreview3D from './CardPreview3D.jsx'
import RealPhotoModal from './RealPhotoModal.jsx'
import styles from './ProductCard.module.css'

export default function ProductCard({ card }) {
  const retirerCarte = useStore((s) => s.retirerCarte)
  const setProduit = useStore((s) => s.setProduit)
  const setVariante = useStore((s) => s.setVariante)
  const setTaille = useStore((s) => s.setTaille)
  const setQuantite = useStore((s) => s.setQuantite)
  const toggleDesactiveeCarte = useStore((s) => s.toggleDesactiveeCarte)
  const isDisabled = card.desactivee === true

  const [showPhotos, setShowPhotos] = useState(false)

  const produit = produitParId(card.produitId)
  const variante =
    produit?.variantes.find((v) => v.id === card.varianteId) ??
    produit?.variantes[0]

  const produitsCat = produit ? produitsParCategorie(produit.categorie) : []
  const idx = produit ? produitsCat.findIndex((p) => p.id === produit.id) : -1
  const canNavigate = produitsCat.length > 1
  const goPrev = () => {
    if (!canNavigate) return
    const prev = produitsCat[(idx - 1 + produitsCat.length) % produitsCat.length]
    setProduit(card.id, prev.id)
  }
  const goNext = () => {
    if (!canNavigate) return
    const next = produitsCat[(idx + 1) % produitsCat.length]
    setProduit(card.id, next.id)
  }

  // Achat solo : checkout sur une carte unique (clone avec desactivee=false
  // pour que buildCart ne la skip pas même si l'utilisateur l'a désactivée
  // dans le bundle).
  const handleBuySolo = () => {
    if (!produit) return
    const synthetic = { ...card, desactivee: false }
    const cart = buildCart([synthetic])
    if (!cart.items.length) return
    checkout(cart).catch((err) => {
      // eslint-disable-next-line no-console
      console.error('[ProductCard] checkout solo error:', err)
    })
  }

  const isUnique = produit?.unique === true
  const ligneTotal = produit ? produit.prix * card.quantite : 0
  const categorieLabel = CATEGORY_LABELS[card.categorie] ?? card.categorie

  return (
    <article
      className={`${styles.card} ${isDisabled ? styles.disabled : ''}`}
      aria-disabled={isDisabled}
    >
      <div className={styles.preview}>
        {variante && (
          <CardPreview3D
            url={variante.fichierGLB}
            sizeMult={sizeMultiplier(produit, card.taille)}
          />
        )}

        {/* Badge "Image réelle" en haut à gauche → ouvre le carrousel photos. */}
        <button
          type="button"
          className={styles.realPhotoBtn}
          onClick={() => setShowPhotos(true)}
          aria-label={`Voir les photos réelles ${produit?.nom ?? ''}`}
          title="Voir les photos réelles du produit"
        >
          Voir image reelle
        </button>

        {canNavigate && (
          <>
            <button
              type="button"
              className={`${styles.navBtn} ${styles.navPrev}`}
              onClick={goPrev}
              aria-label="Produit précédent"
              title="Précédent"
            >
              ‹
            </button>
            <button
              type="button"
              className={`${styles.navBtn} ${styles.navNext}`}
              onClick={goNext}
              aria-label="Produit suivant"
              title="Suivant"
            >
              ›
            </button>
          </>
        )}
        <span className={styles.previewLabel} aria-hidden="true">
          Modele 3D
        </span>
      </div>

      <div className={styles.body}>
        <header className={styles.head}>
          <span className={styles.categorie}>{categorieLabel}</span>
          <div className={styles.headActions}>
            {produit && (
              <div className={styles.headQty} aria-label="Quantité">
                <button
                  type="button"
                  className={styles.headQtyBtn}
                  onClick={() => setQuantite(card.id, card.quantite - 1)}
                  disabled={isUnique || card.quantite <= 1}
                  aria-label="Diminuer la quantité"
                  title={isUnique ? 'Pièce unique : quantité fixée à 1' : 'Diminuer'}
                >
                  −
                </button>
                <span className={styles.headQtyValue} aria-live="polite">
                  {card.quantite}
                </span>
                <button
                  type="button"
                  className={styles.headQtyBtn}
                  onClick={() => setQuantite(card.id, card.quantite + 1)}
                  disabled={isUnique}
                  aria-label="Augmenter la quantité"
                  title={isUnique ? 'Pièce unique : quantité fixée à 1' : 'Augmenter'}
                >
                  +
                </button>
              </div>
            )}
            <button
              type="button"
              className={styles.toggleBtn}
              onClick={() => toggleDesactiveeCarte(card.id)}
              aria-label={
                isDisabled
                  ? `Réactiver ${categorieLabel}`
                  : `Désactiver ${categorieLabel} (exclu du total)`
              }
              title={
                isDisabled
                  ? 'Réactiver et inclure dans le total'
                  : 'Désactiver — exclure du total et masquer en 3D'
              }
            >
              {isDisabled ? '+' : '−'}
            </button>
            <button
              type="button"
              className={styles.close}
              onClick={() => retirerCarte(card.id)}
              aria-label={`Retirer la carte ${categorieLabel}`}
              title="Retirer cette catégorie"
            >
              ×
            </button>
          </div>
        </header>

        {produit ? (
          <>
            <p className={styles.nom}>{produit.nom}</p>
            {produit.unique && <span className={styles.badge}>One of One</span>}

            {produit.variantes.length > 1 && (
              <div className={styles.swatches} role="radiogroup" aria-label="Couleur">
                {produit.variantes.map((v) => {
                  const isActive = v.id === card.varianteId
                  return (
                    <button
                      key={v.id}
                      type="button"
                      role="radio"
                      aria-checked={isActive}
                      aria-label={v.couleur.nom}
                      title={v.couleur.nom}
                      className={`${styles.swatch} ${isActive ? styles.swatchActive : ''}`}
                      style={{ backgroundColor: v.couleur.hex }}
                      onClick={() => setVariante(card.id, v.id)}
                    />
                  )
                })}
              </div>
            )}

            {produit.tailles.length > 0 && (
              <div className={styles.sizes} role="radiogroup" aria-label="Taille">
                {produit.tailles.map((t) => {
                  const isActive = t === card.taille
                  return (
                    <button
                      key={t}
                      type="button"
                      role="radio"
                      aria-checked={isActive}
                      className={`${styles.size} ${isActive ? styles.sizeActive : ''}`}
                      onClick={() => setTaille(card.id, t)}
                    >
                      {t}
                    </button>
                  )
                })}
              </div>
            )}

            <div className={styles.prixBlock}>
              <div className={styles.prixRow}>
                <p className={styles.prix}>{formatPrix(ligneTotal)}</p>
                <button
                  type="button"
                  className={styles.buySoloBtn}
                  onClick={handleBuySolo}
                  aria-label={`Acheter uniquement : ${produit.nom}`}
                  title="Acheter cet article seul"
                >
                  <span>Acheter</span>
                  <span className={styles.buySoloArrow} aria-hidden="true">→</span>
                </button>
              </div>
              {card.quantite > 1 && (
                <p className={styles.prixDetail}>
                  {card.quantite} × {formatPrix(produit.prix)}
                </p>
              )}
            </div>
          </>
        ) : (
          <p className={styles.vide}>Aucun produit selectionne</p>
        )}
      </div>

      {showPhotos && (
        <RealPhotoModal
          photos={variante?.photos ?? []}
          titre={produit?.nom ?? categorieLabel}
          onClose={() => setShowPhotos(false)}
        />
      )}
    </article>
  )
}
