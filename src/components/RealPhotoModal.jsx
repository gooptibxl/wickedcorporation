import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import styles from './RealPhotoModal.module.css'

/* =============================================================================
 *  RealPhotoModal — popup carrousel des photos réelles d'un produit.
 *  - Backdrop fullscreen avec blur (les items 3D continuent à tourner derrière).
 *  - Panel centré ~60vw × 70vh.
 *  - Carrousel ‹ › + flèches clavier ←/→.
 *  - Zoom molette + boutons +/- + drag-pan quand zoomé.
 *  - Fermeture : × / ESC / clic sur le backdrop.
 * =========================================================================== */

const MIN_ZOOM = 1
const MAX_ZOOM = 4
const ZOOM_STEP = 0.25

export default function RealPhotoModal({ photos = [], titre = '', onClose }) {
  const [index, setIndex] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const dragRef = useRef({ active: false, sx: 0, sy: 0, ox: 0, oy: 0 })

  const has = photos.length > 0
  const cur = has ? photos[index % photos.length] : null

  const prev = () =>
    setIndex((i) => (i - 1 + photos.length) % photos.length)
  const next = () => setIndex((i) => (i + 1) % photos.length)
  const zoomIn = () => setZoom((z) => Math.min(MAX_ZOOM, +(z + ZOOM_STEP).toFixed(2)))
  const zoomOut = () =>
    setZoom((z) => Math.max(MIN_ZOOM, +(z - ZOOM_STEP).toFixed(2)))

  // Reset zoom/pan quand on change de photo.
  useEffect(() => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }, [index])

  // Clavier : ESC pour fermer, ← / → pour naviguer, + / - pour zoomer.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      else if (has && e.key === 'ArrowLeft') prev()
      else if (has && e.key === 'ArrowRight') next()
      else if (has && (e.key === '+' || e.key === '=')) zoomIn()
      else if (has && (e.key === '-' || e.key === '_')) zoomOut()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photos.length, has])

  const onWheel = (e) => {
    if (!has) return
    e.preventDefault()
    setZoom((z) =>
      Math.max(
        MIN_ZOOM,
        Math.min(MAX_ZOOM, +(z - Math.sign(e.deltaY) * ZOOM_STEP).toFixed(2)),
      ),
    )
  }

  const onMouseDown = (e) => {
    if (zoom <= 1) return
    dragRef.current = {
      active: true,
      sx: e.clientX,
      sy: e.clientY,
      ox: pan.x,
      oy: pan.y,
    }
  }
  const onMouseMove = (e) => {
    if (!dragRef.current.active) return
    setPan({
      x: dragRef.current.ox + (e.clientX - dragRef.current.sx),
      y: dragRef.current.oy + (e.clientY - dragRef.current.sy),
    })
  }
  const onMouseUp = () => {
    dragRef.current.active = false
  }

  const onBackdropClick = (e) => {
    // Ne ferme que si on clique vraiment sur le fond, pas sur le panel.
    if (e.target === e.currentTarget) onClose()
  }

  return createPortal(
    <div
      className={styles.backdrop}
      onClick={onBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={`Photos réelles ${titre}`}
    >
      <div className={styles.panel}>
        <header className={styles.header}>
          <span className={styles.title}>
            {titre ? `${titre} - ` : ''}Photos reelles
          </span>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Fermer"
            title="Fermer (ESC)"
          >
            ×
          </button>
        </header>

        <div
          className={styles.stage}
          onWheel={onWheel}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          {has ? (
            <img
              src={cur}
              alt={`Photo ${index + 1} sur ${photos.length}`}
              className={styles.img}
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                cursor: zoom > 1 ? (dragRef.current.active ? 'grabbing' : 'grab') : 'default',
              }}
              draggable={false}
            />
          ) : (
            <p className={styles.empty}>
              Aucune photo reelle disponible pour cet article.
            </p>
          )}

          {has && photos.length > 1 && (
            <>
              <button
                type="button"
                className={`${styles.navBtn} ${styles.navPrev}`}
                onClick={prev}
                aria-label="Photo précédente"
                title="Précédente (←)"
              >
                ‹
              </button>
              <button
                type="button"
                className={`${styles.navBtn} ${styles.navNext}`}
                onClick={next}
                aria-label="Photo suivante"
                title="Suivante (→)"
              >
                ›
              </button>
            </>
          )}
        </div>

        {has && (
          <footer className={styles.footer}>
            <div className={styles.zoomGroup}>
              <button
                type="button"
                className={styles.zoomBtn}
                onClick={zoomOut}
                disabled={zoom <= MIN_ZOOM}
                aria-label="Dézoomer"
                title="Dézoomer (-)"
              >
                −
              </button>
              <span className={styles.zoomValue}>{Math.round(zoom * 100)}%</span>
              <button
                type="button"
                className={styles.zoomBtn}
                onClick={zoomIn}
                disabled={zoom >= MAX_ZOOM}
                aria-label="Zoomer"
                title="Zoomer (+)"
              >
                +
              </button>
            </div>
            <span className={styles.count}>
              {index + 1} / {photos.length}
            </span>
          </footer>
        )}
      </div>
    </div>,
    document.body,
  )
}
