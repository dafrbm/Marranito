import { useStore } from './store'
import Onboarding from './screens/Onboarding'
import Resumen from './screens/Resumen'
import Ingresos from './screens/Ingresos'
import Compromisos from './screens/Compromisos'
import Gastos from './screens/Gastos'
import Deudas from './screens/Deudas'
import Runway from './screens/Runway'
import Ajustes from './screens/Ajustes'
import { C } from './components/ui'
import { Analytics } from '@vercel/analytics/react'

const TABS = [
  { id: 'resumen',     label: 'Inicio',     icon: '◈' },
  { id: 'ingresos',    label: 'Ingresos',   icon: '↑' },
  { id: 'compromisos', label: 'Compromisos',icon: '◆' },
  { id: 'gastos',      label: 'Gastos',     icon: '◎' },
  { id: 'deudas',      label: 'Deudas',     icon: '⟳' },
  { id: 'runway',      label: 'Runway',     icon: '◉' },
  { id: 'ajustes',     label: 'Ajustes',    icon: '⚙' },
]

const SCREENS = {
  resumen: Resumen,
  ingresos: Ingresos,
  compromisos: Compromisos,
  gastos: Gastos,
  deudas: Deudas,
  runway: Runway,
  ajustes: Ajustes,
}

export default function App() {
  const { onboardingDone, tab, setTab } = useStore()

  if (!onboardingDone) return <Onboarding />

  const Screen = SCREENS[tab] || Resumen

  return (
    <div style={{
      background: C.bg, minHeight: '100vh', maxWidth: 430,
      margin: '0 auto', position: 'relative',
      fontFamily: "'DM Sans', system-ui, sans-serif", color: C.text,
    }}>
      <div style={{
        position: 'fixed', top: 12, left: '50%', transform: 'translateX(-50%)',
        fontSize: 11, color: C.hint, fontFamily: "'Nunito', sans-serif",
        fontWeight: 700, letterSpacing: '0.15em', zIndex: 10,
        display: 'flex', alignItems: 'center', gap: 5,
      }}>
        <span>🐷</span> MARRANITO
      </div>

      <div style={{ padding: '44px 16px 96px' }}>
        <Screen />
      </div>

      <nav style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 430, background: C.surface,
        borderTop: `1px solid ${C.border}`, display: 'flex', zIndex: 50,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{
              flex: 1, padding: '10px 2px 12px', border: 'none',
              background: 'none', cursor: 'pointer', display: 'flex',
              flexDirection: 'column', alignItems: 'center', gap: 2, position: 'relative',
            }}>
            {tab === t.id && (
              <div style={{
                position: 'absolute', top: 0, left: '20%', right: '20%',
                height: 2, background: C.accent, borderRadius: '0 0 2px 2px',
              }} />
            )}
            <span style={{ fontSize: 13, color: tab === t.id ? C.accent : C.hint, transition: 'color 0.2s' }}>
              {t.icon}
            </span>
            <span style={{
              fontSize: 8, fontWeight: tab === t.id ? 700 : 400,
              color: tab === t.id ? C.accent : C.hint,
              letterSpacing: '0.05em', transition: 'color 0.2s',
            }}>
              {t.label.toUpperCase()}
            </span>
          </button>
        ))}
      </nav>
      <Analytics />
    </div>
  )
}
