import { useStore } from '../store/useStore.js'
import {
  produitParId,
  produitsParCategorie,
  CATEGORY_LABELS,
} from '../data/catalogue.js'
import { formatPrix } from '../utils/format.js'
import { sizeMultiplier } from '../utils/size.js'
import CardPreview3D from './CardPreview3D.jsx'
import styles from './ProductCard.module.css'

export default function ProductCard({ card }) {
  const retirerCarte = useStore((s) => s.retirerCarte)
  const setProduit = useStore((s) => s.setProduit)
  const setVariante = useStore((s) => s.setVariante)
  const setTaille = useStore((s) => s.setTaille)
  const setQuantite = useStore((s) => s.setQuantite)
  const toggleDesactiveeCarte = useStore((s) => s.toggleDesactiveeCarte)
  const isDisabled = card.desactivee === true

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

  // Fond du preview = neutre, plus de variant color. Le GLB rotatif suffit
  // à identifier visuellement la couleur (texture du modèle).
  const isUnique = produit?.unique === true
  const ligneTotal = produit ? produit.prix * card.quantite : 0

  const categorieLabel = CATEGORY_LABELS[card.categorie] ?? card.categorie

  return (
    <article
      className={`${styles.card} ${isDisabled ? styles.disabled : ''}`}
      aria-disabled={isDisabled}
    >
      <div className={styles.preview}>
        {/* Mini scène 3D rotative : charge le GLB de la variante avec
            auto-fit + multiplicateur de taille (XS plus petit, XL plus grand).
            Le fond du .preview est neutre maintenant (plus de variant color). */}
        {variante && (
          <CardPreview3D
            url={variante.fichierGLB}
            sizeMult={sizeMultiplier(produit, card.taille)}
          />
        )}

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
        <span className={styles.previewLabel} aria-hidden="true">Aperçu</span>
      </div>

      <div className={styles.body}>
        <header className={styles.head}>
          <span className={styles.categorie}>{categorieLabel}</span>
          <div className={styles.headActions}>
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

            <div className={styles.qty} aria-label="Quantité">
              <button
                type="button"
                className={styles.qtyBtn}
                onClick={() => setQuantite(card.id, card.quantite - 1)}
                disabled={isUnique || card.quantite <= 1}
                aria-label="Diminuer la quantité"
                title={isUnique ? 'Pièce unique : quantité fixée à 1' : 'Diminuer'}
              >
                −
              </button>
              <span className={styles.qtyValue} aria-live="polite">{card.quantite}</span>
              <button
                type="button"
                className={styles.qtyBtn}
                onClick={() => setQuantite(card.id, card.quantite + 1)}
                disabled={isUnique}
                aria-label="Augmenter la quantité"
                title={isUnique ? 'Pièce unique : quantité fixée à 1' : 'Augmenter'}
              >
                +
              </button>
            </div>

            <div className={styles.prixBlock}>
              <p className={styles.prix}>{formatPrix(ligneTotal)}</p>
              {card.quantite > 1 && (
                <p className={styles.prixDetail}>
                  {card.quantite} × {formatPrix(produit.prix)}
                </p>
              )}
            </div>
          </>
        ) : (
          <p className={styles.vide}>Aucun produit sélectionné</p>
        )}
      </div>
    </article>
  )
}
