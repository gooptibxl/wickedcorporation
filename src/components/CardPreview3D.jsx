import { Component, Suspense, useLayoutEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import styles from './CardPreview3D.module.css'

/* =============================================================================
 *  CardPreview3D — mini scène 3D rotative dans l'aperçu d'une ProductCard.
 * =============================================================================
 *  Architecture finale :
 *
 *    <Canvas>
 *      <Spinner>                      ← rotation Y continue
 *        <SizeScaler scale={sizeMult}> ← applique le multiplicateur de taille
 *          <ErrorBoundary>
 *            <Suspense>
 *              <AutoFit key={url}>    ← centre + normalise à 0.85 unité,
 *                                       MESURÉ UNE SEULE FOIS au mount
 *                <GLBScene url={url}/>
 *              </AutoFit>
 *            </Suspense>
 *          </ErrorBoundary>
 *        </SizeScaler>
 *      </Spinner>
 *    </Canvas>
 *
 *  BUGS QU'ON CORRIGE ICI :
 *   1. AutoFit lançait sa mesure à chaque re-render → comme le Spinner avait
 *      tourné, le bbox world-space différait → scale aléatoire. Visible avec
 *      "taille 52 c'est le plus grand" et "changer le tee affecte la bague".
 *      FIX : useLayoutEffect avec deps [] → mesure une seule fois par mount.
 *
 *   2. Le multiplicateur de taille (XS plus petit, XL plus gros) est appliqué
 *      sur un <group scale=...> ENVELOPPANT AutoFit, pas dans AutoFit lui-même.
 *      Comme ça l'AutoFit normalise toujours à 0.85 et le sizeMult vient
 *      moduler proprement après.
 * ============================================================================ */

class PreviewErrorBoundary extends Component {
  constructor(p) {
    super(p)
    this.state = { failed: false }
  }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch() {
    /* silent */
  }
  render() {
    if (this.state.failed) return this.props.fallback ?? null
    return this.props.children
  }
}

/** Mesure UNE SEULE FOIS (au mount) le bbox des enfants et applique
 *  un scale + recentrage pour qu'ils tiennent dans `target`. */
function AutoFit({ children, target = 0.85 }) {
  const group = useRef(null)
  useLayoutEffect(() => {
    const g = group.current
    if (!g) return
    // Reset avant mesure pour ne pas baser le bbox sur l'ancien scale.
    g.scale.set(1, 1, 1)
    g.position.set(0, 0, 0)
    const box = new THREE.Box3().setFromObject(g)
    const size = box.getSize(new THREE.Vector3())
    const max = Math.max(size.x, size.y, size.z) || 1
    const k = target / max
    g.scale.setScalar(k)
    const center = box.getCenter(new THREE.Vector3())
    g.position.set(-center.x * k, -center.y * k, -center.z * k)
    // PAS de deps : on mesure UNE FOIS. Si l'URL change, le parent change
    // la key et nous démonte → re-fit propre. Sinon, on reste figé.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return <group ref={group}>{children}</group>
}

function Spinner({ children, speed = 0.6 }) {
  const group = useRef(null)
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * speed
  })
  return <group ref={group}>{children}</group>
}

function GLBScene({ url }) {
  const { scene } = useGLTF(url)
  const cloned = useMemo(() => scene.clone(true), [scene])
  return <primitive object={cloned} />
}

/**
 * @param {{ url: string, sizeMult?: number }} props
 *   sizeMult : multiplicateur appliqué APRÈS l'AutoFit (par défaut 1).
 */
export default function CardPreview3D({ url, sizeMult = 1 }) {
  return (
    <Canvas
      className={styles.canvas}
      camera={{ position: [0, 0, 1.6], fov: 35, near: 0.01, far: 20 }}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true, preserveDrawingBuffer: false }}
    >
      <ambientLight intensity={0.75} />
      <directionalLight position={[2, 3, 4]} intensity={1.1} />
      <directionalLight position={[-2, -1, -2]} intensity={0.4} />

      <Spinner speed={0.5}>
        {/* SizeScaler externe : applique le mult après le fit, sans casser
            l'AutoFit interne. */}
        <group scale={sizeMult}>
          <PreviewErrorBoundary key={`eb-${url}`} fallback={null}>
            <Suspense fallback={null}>
              <AutoFit key={url}>
                <GLBScene url={url} />
              </AutoFit>
            </Suspense>
          </PreviewErrorBoundary>
        </group>
      </Spinner>
    </Canvas>
  )
}
