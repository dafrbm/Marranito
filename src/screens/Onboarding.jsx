import { useState } from 'react'
import { useStore } from '../store'
import { C, Btn, Input, Select } from '../components/ui'

const SITUACIONES = [
  { id: 'empleado',      label: 'Empleado',       desc: 'Salario fijo, contrato laboral',          icon: '🏢' },
  { id: 'independiente', label: 'Independiente',  desc: 'Contratos, freelance, honorarios',         icon: '💼' },
  { id: 'mixto',         label: 'Mixto',           desc: 'Combino empleo y trabajo independiente',  icon: '⚡' },
]

const PERIODICIDADES = [
  { value: 'mensual',   label: 'Mensual'   },
  { value: 'quincenal', label: 'Quincenal' },
  { value: 'semanal',   label: 'Semanal'   },
]

const TIPOS_TASA_OPT = [
  { value: 'usura', label: 'Tasa usura'           },
  { value: 'alta',  label: 'Alta (>2% mensual)'   },
  { value: 'media', label: 'Media (1-2% mensual)' },
  { value: 'baja',  label: 'Baja (<1% mensual)'   },
  { value: 'cero',  label: '0% interés'            },
]

const CATS_BASE = [
  { nombre: 'Alimentación',    presupuesto: 800000,  esencial: true,  icon: '🍽️' },
  { nombre: 'Transporte',      presupuesto: 300000,  esencial: true,  icon: '🚌' },
  { nombre: 'Salud',           presupuesto: 200000,  esencial: true,  icon: '💊' },
  { nombre: 'Entretenimiento', presupuesto: 200000,  esencial: false, icon: '🎬' },
  { nombre: 'Ropa',            presupuesto: 150000,  esencial: false, icon: '👕' },
]

const fmt = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n || 0)

function ProgressBar({ paso, total }) {
  return (
    <div style={{ display: 'flex', gap: 5, marginBottom: 28 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ height: 3, flex: 1, borderRadius: 99, background: i <= paso ? C.accent : C.border, transition: 'background 0.3s' }} />
      ))}
    </div>
  )
}

function ItemRow({ label, sub, onRemove }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
      <div>
        <p style={{ fontSize: 13, color: C.text }}>{label}</p>
        {sub && <p style={{ fontSize: 11, color: C.hint }}>{sub}</p>}
      </div>
      <button onClick={onRemove} style={{ background: 'none', border: 'none', color: C.hint, fontSize: 18, cursor: 'pointer', padding: '0 4px' }}>×</button>
    </div>
  )
}

export default function Onboarding() {
  const { completarOnboarding, addFuente, addCategoria, addCompromiso, addReserva } = useStore()

  const TOTAL_PASOS = 7
  const [paso, setPaso] = useState(0)

  const [nombre, setNombre] = useState('')
  const [situacion, setSituacion] = useState(null)

  const [fuentes, setFuentes] = useState([])
  const [fNombre, setFNombre] = useState('')
  const [fMonto, setFMonto] = useState('')
  const [fPeriodicidad, setFPeriodicidad] = useState('mensual')
  const [fProbabilidad, setFProbabilidad] = useState(80)

  const [fijos, setFijos] = useState([])
  const [fiNombre, setFiNombre] = useState('')
  const [fiMonto, setFiMonto] = useState('')
  const [fiTipo, setFiTipo] = useState('arriendo')

  const [deudas, setDeudas] = useState([])
  const [dNombre, setDNombre] = useState('')
  const [dSaldo, setDSaldo] = useState('')
  const [dCuotaMin, setDCuotaMin] = useState('')
  const [dTasa, setDTasa] = useState('media')

  const [cats, setCats] = useState(CATS_BASE.map(c => ({ ...c })))

  const [reservas, setReservas] = useState([])
  const [rNombre, setRNombre] = useState('')
  const [rMonto, setRMonto] = useState('')
  const [rDisponible, setRDisponible] = useState(true)

  function addFuenteLocal() {
    if (!fNombre || !fMonto) return
    setFuentes(p => [...p, { nombre: fNombre, monto: parseFloat(fMonto), periodicidad: fPeriodicidad, probabilidad: fProbabilidad }])
    setFNombre(''); setFMonto('')
  }

  function addFijoLocal() {
    if (!fiNombre || !fiMonto) return
    setFijos(p => [...p, { nombre: fiNombre, monto: parseFloat(fiMonto), tipo: fiTipo }])
    setFiNombre(''); setFiMonto('')
  }

  function addDeudaLocal() {
    if (!dNombre || !dSaldo) return
    setDeudas(p => [...p, { nombre: dNombre, saldo: parseFloat(dSaldo), cuotaMinima: parseFloat(dCuotaMin) || 0, tasaTipo: dTasa }])
    setDNombre(''); setDSaldo(''); setDCuotaMin('')
  }

  function addReservaLocal() {
    if (!rNombre || !rMonto) return
    setReservas(p => [...p, { nombre: rNombre, monto: parseFloat(rMonto), disponible: rDisponible }])
    setRNombre(''); setRMonto('')
  }

  function finalizar() {
    completarOnboarding({ nombre, situacion, moneda: 'COP' })
    fuentes.forEach(f => addFuente({ nombre: f.nombre, tipo: situacion || 'otro', monto: f.monto, periodicidad: f.periodicidad, probabilidad: situacion === 'empleado' ? 95 : f.probabilidad, renovable: situacion === 'empleado', activo: true }))
    fijos.forEach(f => addCompromiso({ nombre: f.nombre, tipo: f.tipo, cuota: f.monto, saldo: 0, activo: true }))
    deudas.forEach(d => addCompromiso({ nombre: d.nombre, tipo: 'tarjeta', saldo: d.saldo, cuota: d.cuotaMinima, cuotaMinima: d.cuotaMinima, tasaTipo: d.tasaTipo, activo: true }))
    cats.forEach(c => addCategoria(c))
    reservas.forEach(r => addReserva({ nombre: r.nombre, monto: r.monto, disponible: r.disponible }))
  }

  const ingresoTotal = fuentes.reduce((s, f) => {
    const base = f.periodicidad === 'quincenal' ? f.monto * 2 : f.periodicidad === 'semanal' ? f.monto * 4 : f.monto
    return s + base
  }, 0)
  const egresoTotal = fijos.reduce((s, f) => s + f.monto, 0) + deudas.reduce((s, d) => s + d.cuotaMinima, 0) + cats.reduce((s, c) => s + c.presupuesto, 0)
  const flujo = ingresoTotal - egresoTotal

  const pasos = [
    <div key={0} style={{ textAlign: 'center', padding: '20px 0' }}>
      <div style={{ fontSize: 72, marginBottom: 16, filter: 'drop-shadow(0 0 20px #F5A62344)' }}>🐷</div>
      <h1 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 32, fontWeight: 800, color: C.text, marginBottom: 8 }}>Marranito</h1>
      <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.7, marginBottom: 32 }}>Tu alcancía inteligente.<br />Vamos a configurar tu perfil financiero paso a paso.</p>
      <Input label="¿Cómo te llamas?" value={nombre} onChange={setNombre} placeholder="Tu nombre" />
      <Btn variant="primary" onClick={() => nombre.trim() && setPaso(1)} disabled={!nombre.trim()} style={{ width: '100%', marginTop: 8, padding: '14px' }}>Empezar →</Btn>
    </div>,

    <div key={1}>
      <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 4 }}>Hola, {nombre} 👋</p>
      <p style={{ fontSize: 14, color: C.muted, marginBottom: 24 }}>¿Cuál es tu situación laboral?</p>
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
      <Btn variant="primary" onClick={() => situacion && setPaso(2)} disabled={!situacion} style={{ width: '100%', marginTop: 16, padding: '14px' }}>Continuar →</Btn>
    </div>,

    <div key={2}>
      <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 4 }}>Ingresos</p>
      <p style={{ fontSize: 14, color: C.muted, marginBottom: 20 }}>Agrega todas tus fuentes de ingreso.</p>
      {fuentes.length > 0 && <div style={{ marginBottom: 16 }}>{fuentes.map((f, i) => <ItemRow key={i} label={f.nombre} sub={`${fmt(f.monto)} · ${f.periodicidad}`} onRemove={() => setFuentes(p => p.filter((_, j) => j !== i))} />)}</div>}
      <div style={{ background: C.surfaceHi, borderRadius: 12, padding: '14px', marginBottom: 16 }}>
        <Input label="Nombre" value={fNombre} onChange={setFNombre} placeholder="Ej: Salario, Proyecto X" />
        <Input label="Monto" value={fMonto} onChange={setFMonto} type="number" placeholder="3.500.000" suffix="COP" />
        <Select label="Periodicidad" value={fPeriodicidad} onChange={setFPeriodicidad} options={PERIODICIDADES} />
        {situacion === 'independiente' && (
          <div style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>Probabilidad de que continúe</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input type="range" min={10} max={100} step={5} value={fProbabilidad} onChange={e => setFProbabilidad(Number(e.target.value))} style={{ flex: 1 }} />
              <span style={{ fontSize: 15, fontWeight: 700, color: C.accent, minWidth: 36 }}>{fProbabilidad}%</span>
            </div>
          </div>
        )}
        <Btn variant="secondary" onClick={addFuenteLocal} disabled={!fNombre || !fMonto} style={{ width: '100%' }}>+ Agregar ingreso</Btn>
      </div>
      <Btn variant="primary" onClick={() => setPaso(3)} style={{ width: '100%', padding: '14px' }}>{fuentes.length > 0 ? 'Continuar →' : 'Saltar por ahora →'}</Btn>
    </div>,

    <div key={3}>
      <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 4 }}>Gastos fijos</p>
      <p style={{ fontSize: 14, color: C.muted, marginBottom: 20 }}>Arriendo, servicios, suscripciones — lo que pagas mes a mes sin falta.</p>
      {fijos.length > 0 && <div style={{ marginBottom: 16 }}>{fijos.map((f, i) => <ItemRow key={i} label={f.nombre} sub={fmt(f.monto)} onRemove={() => setFijos(p => p.filter((_, j) => j !== i))} />)}</div>}
      <div style={{ background: C.surfaceHi, borderRadius: 12, padding: '14px', marginBottom: 16 }}>
        <Input label="Nombre" value={fiNombre} onChange={setFiNombre} placeholder="Ej: Arriendo, Netflix, Gym" />
        <Select label="Tipo" value={fiTipo} onChange={setFiTipo} options={[
          { value: 'arriendo',    label: '🏠 Arriendo'   },
          { value: 'servicio',    label: '💡 Servicio'    },
          { value: 'suscripcion', label: '📱 Suscripción' },
          { value: 'otro',        label: '📌 Otro'        },
        ]} />
        <Input label="Valor mensual" value={fiMonto} onChange={setFiMonto} type="number" placeholder="900.000" suffix="COP" />
        <Btn variant="secondary" onClick={addFijoLocal} disabled={!fiNombre || !fiMonto} style={{ width: '100%' }}>+ Agregar gasto fijo</Btn>
      </div>
      <Btn variant="primary" onClick={() => setPaso(4)} style={{ width: '100%', padding: '14px' }}>{fijos.length > 0 ? 'Continuar →' : 'Saltar por ahora →'}</Btn>
    </div>,

    <div key={4}>
      <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 4 }}>Deudas</p>
      <p style={{ fontSize: 14, color: C.muted, marginBottom: 20 }}>Tarjetas, préstamos, libranzas. Incluye la cuota mínima obligatoria.</p>
      {deudas.length > 0 && <div style={{ marginBottom: 16 }}>{deudas.map((d, i) => <ItemRow key={i} label={d.nombre} sub={`Saldo: ${fmt(d.saldo)} · Cuota mín: ${fmt(d.cuotaMinima)}`} onRemove={() => setDeudas(p => p.filter((_, j) => j !== i))} />)}</div>}
      <div style={{ background: C.surfaceHi, borderRadius: 12, padding: '14px', marginBottom: 16 }}>
        <Input label="Nombre" value={dNombre} onChange={setDNombre} placeholder="Ej: Visa Bancolombia" />
        <Input label="Saldo pendiente" value={dSaldo} onChange={setDSaldo} type="number" placeholder="5.000.000" suffix="COP" />
        <Input label="Cuota mínima mensual" value={dCuotaMin} onChange={setDCuotaMin} type="number" placeholder="300.000" suffix="COP" hint="Lo que el banco te exige pagar como mínimo" />
        <Select label="Nivel de tasa" value={dTasa} onChange={setDTasa} options={TIPOS_TASA_OPT} />
        <Btn variant="secondary" onClick={addDeudaLocal} disabled={!dNombre || !dSaldo} style={{ width: '100%' }}>+ Agregar deuda</Btn>
      </div>
      <Btn variant="primary" onClick={() => setPaso(5)} style={{ width: '100%', padding: '14px' }}>{deudas.length > 0 ? 'Continuar →' : 'Saltar por ahora →'}</Btn>
    </div>,

    <div key={5}>
      <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 4 }}>Presupuesto variable</p>
      <p style={{ fontSize: 14, color: C.muted, marginBottom: 20 }}>Ajusta los presupuestos base. Los puedes cambiar después.</p>
      {cats.map((cat, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>{cat.icon}</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, color: C.text, marginBottom: 4 }}>{cat.nombre}</p>
            <input type="number" value={cat.presupuesto}
              onChange={e => setCats(p => p.map((c, j) => j === i ? { ...c, presupuesto: parseFloat(e.target.value) || 0 } : c))}
              style={{ width: '100%', background: C.surfaceHi, border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 10px', fontSize: 13, color: C.text, outline: 'none' }} />
          </div>
          <span style={{ fontSize: 11, color: C.muted, flexShrink: 0 }}>COP</span>
        </div>
      ))}
      <Btn variant="primary" onClick={() => setPaso(6)} style={{ width: '100%', padding: '14px', marginTop: 20 }}>Continuar →</Btn>
    </div>,

    <div key={6}>
      <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 4 }}>Reservas</p>
      <p style={{ fontSize: 14, color: C.muted, marginBottom: 20 }}>Ahorros, cesantías, CDTs — tu colchón financiero.</p>
      {reservas.length > 0 && <div style={{ marginBottom: 16 }}>{reservas.map((r, i) => <ItemRow key={i} label={r.nombre} sub={`${fmt(r.monto)} · ${r.disponible ? 'Disponible' : 'No inmediato'}`} onRemove={() => setReservas(p => p.filter((_, j) => j !== i))} />)}</div>}
      <div style={{ background: C.surfaceHi, borderRadius: 12, padding: '14px', marginBottom: 16 }}>
        <Input label="Nombre" value={rNombre} onChange={setRNombre} placeholder="Ej: Cajita Nu, Cesantías" />
        <Input label="Monto" value={rMonto} onChange={setRMonto} type="number" placeholder="3.000.000" suffix="COP" />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <p style={{ fontSize: 13, color: C.text }}>¿Disponible de inmediato?</p>
            <p style={{ fontSize: 11, color: C.hint }}>Desactiva si requiere trámite (ej: cesantías)</p>
          </div>
          <button onClick={() => setRDisponible(d => !d)}
            style={{ width: 44, height: 24, borderRadius: 12, border: 'none', background: rDisponible ? C.accent : C.border, cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
            <div style={{ position: 'absolute', top: 3, left: rDisponible ? 22 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
          </button>
        </div>
        <Btn variant="secondary" onClick={addReservaLocal} disabled={!rNombre || !rMonto} style={{ width: '100%' }}>+ Agregar reserva</Btn>
      </div>
      <div style={{ background: C.surfaceHi, borderRadius: 12, padding: '16px', marginBottom: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 10 }}>Resumen de tu configuración</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
          <span style={{ color: C.muted }}>Ingresos mensuales</span>
          <span style={{ color: C.green, fontWeight: 600 }}>{fmt(ingresoTotal)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
          <span style={{ color: C.muted }}>Egresos estimados</span>
          <span style={{ color: C.red, fontWeight: 600 }}>{fmt(egresoTotal)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
          <span style={{ color: C.text, fontWeight: 700 }}>Flujo neto</span>
          <span style={{ color: flujo >= 0 ? C.green : C.red, fontWeight: 800, fontFamily: "'Nunito', sans-serif" }}>{fmt(flujo)}</span>
        </div>
      </div>
      <Btn variant="primary" onClick={finalizar} style={{ width: '100%', padding: '14px' }}>Entrar a Marranito 🐷</Btn>
    </div>,
  ]

  return (
    <div style={{ background: C.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '32px 24px', maxWidth: 430, margin: '0 auto' }}>
      {paso > 0 && (
        <button onClick={() => setPaso(p => p - 1)} style={{ background: 'none', border: 'none', color: C.muted, fontSize: 13, cursor: 'pointer', marginBottom: 20, textAlign: 'left', padding: 0 }}>
          ← Volver
        </button>
      )}
      <ProgressBar paso={paso} total={TOTAL_PASOS} />
      {pasos[paso]}
    </div>
  )
}
