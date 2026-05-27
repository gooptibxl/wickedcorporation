import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useFocusStore } from '../store/useFocusStore.js'

/* =============================================================================
 *  CameraFocus — gère l'animation et le suivi caméra en mode "focus item".
 *
 *  Trois phases pilotées par stateRef.mode :
 *    - entering : lerp camera.position vers `itemPos + dirCourante * FOCUS_DISTANCE`
 *                 et controls.target vers itemPos. Garde l'angle de vue actuel,
 *                 réduit juste la distance.
 *    - tracking : chaque frame, recalcule la position monde de l'item (qui
 *                 oscille avec la lévitation du perso). Ajoute le delta à
 *                 camera.position ET controls.target → la vue reste verrouillée.
 *                 Les boutons ‹›⌃⌄ (setAzimuth/PolarAngle) marchent toujours
 *                 car ils tournent autour du target = itemPos.
 *    - exiting  : lerp retour vers la pose sauvegardée à l'entrée. À la fin,
 *                 réactive le pan.
 *
 *  Sortie : pointer-drag détecté au niveau canvas (>6px de mouvement) →
 *  clearFocus(). Le clic court (sans drag) ne sort PAS (sinon impossible de
 *  recliquer sur le même item).
 * =========================================================================== */

const FOCUS_DISTANCE = 0.45
const TRANSITION_LERP = 5
const ARRIVAL_EPSILON = 0.02
const DRAG_THRESHOLD_PX = 6

const _v = new THREE.Vector3()
const _dir = new THREE.Vector3()

function findByCardId(root, cardId) {
  let found = null
  root.traverse((obj) => {
    if (obj.userData && obj.userData.cardId === cardId) found = obj
  })
  return found
}

/** Pose caméra initiale (doit matcher celle du <Canvas camera={…}> + target
 *  des <OrbitControls>). Utilisée par le bouton reset. */
const INITIAL_CAM_POS = new THREE.Vector3(0, 1.4, 4)
const INITIAL_TARGET = new THREE.Vector3(0, 1, 0)

export default function CameraFocus({ controlsRef }) {
  const focusedCardId = useFocusStore((s) => s.focusedCardId)
  const clearFocus = useFocusStore((s) => s.clearFocus)
  const resetSig = useFocusStore((s) => s.resetSig)
  const { camera, scene, gl } = useThree()

  const stateRef = useRef({
    mode: 'idle', // 'idle' | 'entering' | 'tracking' | 'exiting'
    savedCamPos: new THREE.Vector3(),
    savedTarget: new THREE.Vector3(),
    prevItemWorld: new THREE.Vector3(),
    desiredCamPos: new THREE.Vector3(),
  })

  // Transition d'état quand focusedCardId change.
  useEffect(() => {
    const controls = controlsRef.current
    if (!controls) return
    const s = stateRef.current

    if (focusedCardId) {
      // On ne sauvegarde la pose initiale qu'à la PREMIÈRE entrée (depuis idle).
      // Si on passe d'un item à un autre, on garde l'original comme cible de
      // retour pour l'exit final.
      if (s.mode === 'idle') {
        s.savedCamPos.copy(camera.position)
        s.savedTarget.copy(controls.target)
      }
      s.mode = 'entering'
      controls.enablePan = false
    } else if (s.mode !== 'idle') {
      s.mode = 'exiting'
    }
  }, [focusedCardId, camera, controlsRef])

  // Bouton reset : ré-utilise la logique "exiting" en forçant la cible vers
  // la pose initiale (au lieu de la pose sauvegardée à l'entrée).
  useEffect(() => {
    if (resetSig === 0) return
    const controls = controlsRef.current
    if (!controls) return
    const s = stateRef.current
    s.savedCamPos.copy(INITIAL_CAM_POS)
    s.savedTarget.copy(INITIAL_TARGET)
    s.mode = 'exiting'
    controls.enablePan = false
  }, [resetSig, controlsRef])

  // Détection du drag pour sortir du focus. Listener au niveau du canvas
  // (pas via OrbitControls 'start' pour ne pas se déclencher au clic court).
  useEffect(() => {
    if (!focusedCardId) return
    const canvas = gl.domElement
    let startX = 0
    let startY = 0
    let isDown = false

    const onDown = (e) => {
      isDown = true
      startX = e.clientX
      startY = e.clientY
    }
    const onMove = (e) => {
      if (!isDown) return
      const dx = e.clientX - startX
      const dy = e.clientY - startY
      if (Math.hypot(dx, dy) > DRAG_THRESHOLD_PX) {
        isDown = false
        clearFocus()
      }
    }
    const onUp = () => {
      isDown = false
    }

    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerup', onUp)
    canvas.addEventListener('pointercancel', onUp)
    return () => {
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerup', onUp)
      canvas.removeEventListener('pointercancel', onUp)
    }
  }, [focusedCardId, gl, clearFocus])

  useFrame((_, delta) => {
    const controls = controlsRef.current
    if (!controls) return
    const s = stateRef.current
    if (s.mode === 'idle') return

    const k = 1 - Math.exp(-TRANSITION_LERP * delta)

    if (s.mode === 'entering') {
      const obj = findByCardId(scene, focusedCardId)
      if (!obj) return
      obj.getWorldPosition(_v)

      // Direction de vue actuelle (camera→target) → on l'inverse pour avoir
      // un vecteur target→camera, le long duquel on positionne la caméra à
      // FOCUS_DISTANCE de l'item.
      _dir.subVectors(camera.position, controls.target).normalize()
      s.desiredCamPos.copy(_v).addScaledVector(_dir, FOCUS_DISTANCE)

      camera.position.lerp(s.desiredCamPos, k)
      controls.target.lerp(_v, k)
      controls.update()

      if (camera.position.distanceTo(s.desiredCamPos) < ARRIVAL_EPSILON) {
        s.prevItemWorld.copy(_v)
        s.mode = 'tracking'
      }
    } else if (s.mode === 'tracking') {
      const obj = findByCardId(scene, focusedCardId)
      if (!obj) {
        // Item disparu (carte supprimée) → exit
        s.mode = 'exiting'
        return
      }
      obj.getWorldPosition(_v)
      const dx = _v.x - s.prevItemWorld.x
      const dy = _v.y - s.prevItemWorld.y
      const dz = _v.z - s.prevItemWorld.z
      camera.position.x += dx
      camera.position.y += dy
      camera.position.z += dz
      controls.target.x += dx
      controls.target.y += dy
      controls.target.z += dz
      controls.update()
      s.prevItemWorld.copy(_v)
    } else if (s.mode === 'exiting') {
      camera.position.lerp(s.savedCamPos, k)
      controls.target.lerp(s.savedTarget, k)
      controls.update()

      if (camera.position.distanceTo(s.savedCamPos) < ARRIVAL_EPSILON) {
        camera.position.copy(s.savedCamPos)
        controls.target.copy(s.savedTarget)
        controls.update()
        controls.enablePan = true
        s.mode = 'idle'
      }
    }
  })

  return null
}
