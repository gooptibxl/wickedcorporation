import { Component, Suspense } from 'react'
import GLBModel from './GLBModel.jsx'

/**
 * SafeGLB — charge un .glb via useGLTF, avec deux filets de sécurité :
 *  - <Suspense fallback> : pendant le chargement, on rend le fallback.
 *  - ErrorBoundary : si le fichier est introuvable (404) ou corrompu,
 *    on rend AUSSI le fallback, en silence (warning console en dev).
 *
 *  IMPORTANT — la boundary est **keyée par url** pour qu'elle se ré-instancie
 *  à chaque changement de variante. Sans ce key, l'état `failed: true` d'un
 *  GLB absent restait collé : après être passé sur un GLB manquant, le
 *  composant continuait d'afficher le fallback même en revenant sur un GLB
 *  qui existait. Le key=url force un mount propre par URL.
 *
 *  Si `fallback` n'est pas fourni (ou est null), absolument rien ne s'affiche
 *  en cas de load échoué — c'est ce qu'on veut quand on ne veut PAS de
 *  placeholder procédural fantôme.
 */

class GLBErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(err) {
    if (import.meta.env?.DEV) {
      // eslint-disable-next-line no-console
      console.warn('[SafeGLB] GLB indisponible :', err?.message ?? err)
    }
  }
  render() {
    if (this.state.failed) return this.props.fallback ?? null
    return this.props.children
  }
}

/**
 * @param {object} props
 * @param {string} props.url            URL du .glb
 * @param {React.ReactNode} [props.fallback]  Optionnel. Si non fourni → rien
 *                                            ne s'affiche en cas d'erreur ou
 *                                            pendant le chargement.
 * @param {number} [props.scale]        Échelle locale appliquée au modèle GLB.
 */
export default function SafeGLB({ url, fallback = null, scale = 1 }) {
  return (
    // key=url indispensable : reset propre du boundary à chaque changement
    // de variante (sinon état d'échec collant, cf. doc en tête de fichier).
    <GLBErrorBoundary key={url} fallback={fallback}>
      <Suspense fallback={fallback}>
        <GLBModel url={url} scale={scale} />
      </Suspense>
    </GLBErrorBoundary>
  )
}
