import { useState } from 'react'
import { useStore } from '../store'
import { C, Btn, Input } from '../components/ui'

const SITUACIONES = [
  { id: 'empleado', label: 'Empleado', desc: 'Salario fijo, contrato laboral', icon: '🏢' },
  { id: 'independiente', label: 'Independiente', desc: 'Contratos, freelance, honorarios', icon: '💼' },
  { id: 'mixto', label: 'Mixto', desc: 'Combino empleo y trabajo independiente', icon: '⚡' },
]

export default function Onboarding() {
  const completarOnboarding = useStore(s => s.completarOnboarding)
  const addFuente = useStore(s => s.addFuente)
  const addCategoria = useStore(s => s.addCategoria)
  const addCompromiso = useStore(s => s.addCompromiso)

  const [paso, setPaso] = useState(0)
  const [nombre, setNombre] = useState('')
  const [situacion, setSituacion] = useState(null)
  const [ingresoMonto, setIngresoMonto] = useState('')
  const [ingresoProbabilidad, setIngresoProbabilidad] = useState(80)

  function finalizar() {
    completarOnboarding({ nombre, situacion, moneda: 'COP' })

    // Fuente de ingreso inicial
    if (ingresoMonto) {
      addFuente({
        nombre: situacion === 'empleado' ? 'Salario' : 'Ingreso principal',
        tipo: situacion,
        monto: parseFloat(ingresoMonto) * 1000,
        periodicidad: 'mensual',
        probabilidad: situacion === 'empleado' ? 95 : ingresoProbabilidad,
        renovable: situacion === 'empleado',
        activo: true,
      })
    }

    // Categorías de gasto base
    const cats = [
      { nombre: 'Alimentación', presupuesto: 800000, esencial: true, icon: '🍽️' },
      { nombre: 'Transporte', presupuesto: 300000, esencial: true, icon: '🚌' },
      { nombre: 'Salud', presupuesto: 200000, esencial: true, icon: '💊' },
      { nombre: 'Entretenimiento', presupuesto: 200000, esencial: false, icon: '🎬' },
      { nombre: 'Ropa', presupuesto: 150000, esencial: false, icon: '👕' },
    ]
    cats.forEach(c => addCategoria(c))

    // Compromisos base
    addCompromiso({ nombre: 'Arriendo', tipo: 'arriendo', cuota: 0, monto: 0, saldo: 0, activo: true })
  }

  const pasos = [
    // Paso 0: bienvenida
    <div key={0} style={{ textAlign: 'center', padding: '20px 0' }}>
      <div style={{ fontSize: 72, marginBottom: 16, filter: 'drop-shadow(0 0 20px #F5A62344)' }}>🐷</div>
      <h1 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 32, fontWeight: 800, color: C.text, marginBottom: 8 }}>Marranito</h1>
      <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.7, marginBottom: 32 }}>Tu alcancía inteligente.<br />Control de finanzas personales.</p>
      <Input label="¿Cómo te llamas?" value={nombre} onChange={setNombre} placeholder="Tu nombre" />
      <Btn variant="primary" onClick={() => nombre.trim() && setPaso(1)} disabled={!nombre.trim()} style={{ width: '100%', marginTop: 8, padding: '14px' }}>
        Empezar →
      </Btn>
    </div>,

    // Paso 1: situación laboral
    <div key={1}>
      <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 4 }}>Hola, {nombre} 👋</p>
      <p style={{ fontSize: 14, color: C.muted, marginBottom: 24 }}>¿Cuál es tu situación laboral actual?</p>
      {SITUACIONES.map(s => (
        <div key={s.id} onClick={() => setSituacion(s.id)}
          style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 14, border: `1px solid ${situacion === s.id ? C.accent : C.border}`, background: situacion === s.id ? C.accentDim : C.surface, marginBottom: 10, cursor: 'pointer', transition: 'all 0.2s' }}>
          <span style={{ fontSize: 28 }}>{s.icon}</span>
          <div>
            <p style={{ fontSize: 15, fontWeight: 600, color: situacion === s.id ? C.accentText : C.text }}>{s.label}</p>
            <p style={{ fontSize: 12, color: C.muted }}>{s.desc}</p>
          </div>
        </div>
      ))}
      <Btn variant="primary" onClick={() => situacion && setPaso(2)} disabled={!situacion} style={{ width: '100%', marginTop: 16, padding: '14px' }}>
        Continuar →
      </Btn>
    </div>,

    // Paso 2: ingreso principal
    <div key={2}>
      <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 4 }}>Tu ingreso principal</p>
      <p style={{ fontSize: 14, color: C.muted, marginBottom: 24 }}>
        {situacion === 'empleado' ? 'Tu salario mensual neto (lo que te llega después de deducciones).' : 'El ingreso mensual que recibes regularmente. Puedes ajustarlo después.'}
      </p>
      <Input
        label="Monto mensual"
        value={ingresoMonto}
        onChange={setIngresoMonto}
        type="number"
        placeholder="2500"
        suffix="miles COP"
        hint="Ejemplo: escribe 2500 para $2.500.000"
      />
      {situacion === 'independiente' && (
        <div style={{ marginBottom: 14 }}>
          <p style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>¿Qué tan probable es que este ingreso continúe el mes siguiente?</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input type="range" min={10} max={100} step={5} value={ingresoProbabilidad} onChange={e => setIngresoProbabilidad(Number(e.target.value))} style={{ flex: 1 }} />
            <span style={{ fontSize: 16, fontWeight: 700, color: C.accent, minWidth: 40 }}>{ingresoProbabilidad}%</span>
          </div>
          <p style={{ fontSize: 11, color: C.hint, marginTop: 4 }}>
            {ingresoProbabilidad >= 80 ? 'Alta certeza' : ingresoProbabilidad >= 50 ? 'Probabilidad media' : 'Incierto'}
          </p>
        </div>
      )}
      <Btn variant="primary" onClick={finalizar} style={{ width: '100%', marginTop: 8, padding: '14px' }}>
        {ingresoMonto ? 'Ir a Marranito →' : 'Saltar por ahora →'}
      </Btn>
    </div>,
  ]

  return (
    <div style={{ background: C.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '32px 24px', maxWidth: 430, margin: '0 auto' }}>
      {paso > 0 && (
        <button onClick={() => setPaso(p => p - 1)} style={{ background: 'none', border: 'none', color: C.muted, fontSize: 13, cursor: 'pointer', marginBottom: 24, textAlign: 'left', padding: 0 }}>
          ← Volver
        </button>
      )}
      <div style={{ display: 'flex', gap: 6, marginBottom: 32 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ height: 3, flex: 1, borderRadius: 99, background: i <= paso ? C.accent : C.border, transition: 'background 0.3s' }} />
        ))}
      </div>
      {pasos[paso]}
    </div>
  )
}
