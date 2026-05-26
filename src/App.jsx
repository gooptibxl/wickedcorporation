import Layout from './components/Layout.jsx'
import Scene from './three/Scene.jsx'
import Panel from './components/Panel.jsx'
import DebugConsole from './components/DebugConsole.jsx'

export default function App() {
  return (
    <>
      <Layout children3d={<Scene />}>
        <Panel />
      </Layout>
      {/* Console de debug — toggleable via bouton flottant en bas à droite.
          Affiche cards, équipement 3D, total, payload Stripe en live. */}
      <DebugConsole />
    </>
  )
}
