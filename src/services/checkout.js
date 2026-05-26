import { produitParId } from '../data/catalogue.js'

/**
 * Construit la vue de panier résolue. Stable, sérialisable, prête à envoyer
 * à un backend (Kirby → Stripe Checkout).
 */
export function buildCart(cards) {
  const items = []
  for (const c of cards) {
    if (c.desactivee) continue // les cartes désactivées ne partent pas au panier
    const produit = produitParId(c.produitId)
    if (!produit) continue
    const variante = produit.variantes.find((v) => v.id === c.varianteId)
    if (!variante) continue
    const prixUnitaire = produit.prix
    const ligneTotal = prixUnitaire * c.quantite
    items.push({
      cardId: c.id,
      produitId: produit.id,
      nom: produit.nom,
      categorie: produit.categorie,
      varianteId: variante.id,
      couleur: variante.couleur.nom,
      hex: variante.couleur.hex,
      taille: c.taille,
      quantite: c.quantite,
      unique: produit.unique,
      prixUnitaire,
      ligneTotal,
      fichierGLB: variante.fichierGLB,
      // slot 3D effectif (utile pour les Rings qui peuvent être sur
      // doigt / doigt-2 / doigt-3 ; null sinon).
      slot: c.slotOverride ?? produit.emplacement3D,
    })
  }
  const total = items.reduce((s, i) => s + i.ligneTotal, 0)
  const qtyTotal = items.reduce((s, i) => s + i.quantite, 0)
  return { items, total, qtyTotal, currency: 'EUR' }
}

/**
 * Lance le checkout.
 * Prompt 11 : log dans la console.
 * Prompt 13 : remplacer par POST /api/checkout vers Kirby → Stripe.
 */
export async function checkout(cart) {
  /* eslint-disable no-console */
  console.groupCollapsed(
    '%c[checkout] payload prêt à envoyer à Stripe',
    'color:#c252ff;font-weight:600',
  )
  console.log('Payload complet :', cart)
  console.table(
    cart.items.map((i) => ({
      produit: i.nom,
      catégorie: i.categorie,
      couleur: i.couleur,
      taille: i.taille ?? '—',
      qty: i.quantite,
      'prix u.': (i.prixUnitaire / 100).toFixed(2) + ' €',
      ligne: (i.ligneTotal / 100).toFixed(2) + ' €',
      unique: i.unique ? '1/1' : '',
    })),
  )
  console.log(
    `Total : ${(cart.total / 100).toFixed(2)} ${cart.currency} ` +
      `(${cart.qtyTotal} pièce${cart.qtyTotal > 1 ? 's' : ''})`,
  )
  console.groupEnd()
  /* eslint-enable no-console */

  return { ok: true, cart }
}
