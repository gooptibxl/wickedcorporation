import styles from './Layout.module.css'

/**
 * Layout principal : split screen responsive (3D + panneau).
 * Mobile column / desktop row à 900px.
 */
export default function Layout({ children3d, children }) {
  return (
    <div className={styles.layout}>
      <section className={`${styles.zone} ${styles.zone3d}`} aria-label="Zone 3D">
        {children3d ?? <h2 className={styles.zoneTitle}>ZONE 3D</h2>}
      </section>

      <section className={`${styles.zone} ${styles.panel}`} aria-label="Panneau de configuration">
        {children ?? <h2 className={styles.zoneTitle}>PANNEAU</h2>}
      </section>
    </div>
  )
}
