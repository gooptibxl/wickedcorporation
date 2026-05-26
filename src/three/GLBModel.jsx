import { useGLTF } from '@react-three/drei'

/**
 * Wrapper minimal autour de useGLTF — prêt pour les vrais .glb dans /models/.
 * Pour l'instant non utilisé par EquippedItem (qui rend des primitives).
 * Voir le bloc TODO GLB dans EquippedItem.jsx pour le branchement final.
 */
export default function GLBModel({ url, colorHex, scale = 1 }) {
  const { scene } = useGLTF(url)
  if (colorHex) {
    scene.traverse((obj) => {
      if (obj.isMesh && obj.material && 'color' in obj.material) {
        obj.material.color.set(colorHex)
      }
    })
  }
  return <primitive object={scene} scale={scale} />
}
