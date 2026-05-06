import { useState } from 'react'
import { useStore, TIPOS_INGRESO } from '../store'
import { C, Card, SectionLabel, Tag, Btn, Input, Select, BottomSheet, EmptyState, fmt, fmtK } from '../components/ui'

const PERIODICIDADES = [
  { value: 'mensual', label: 'Mensual' },
  { value: 'quincenal', label: 'Quincenal' },
  { value: 'semanal', label: 'Semanal' },
]

const TIPO_OPTIONS = [
  { value: 'empleado', label: '🏢 Empleado' },
  { value: 'independiente', label: '💼 Independiente / Freelance' },
  { value: 'renta', label: '🏠 Renta / Arriendo recibido' },
  { value: 'otro', label: '📌 Otro' },
]

function FormFuente({ inicial, onSave, onClose }) {
  const [nombre, setNombre] = useState(inicial?.nombre || '')
  const [tipo, setTipo] = useState(inicial?.tipo || 'empleado')
  const [monto, setMonto] = useState(inicial ? String(inicial.monto / 1000) : '')
  const [periodicidad, setPeriodicidad] = useState(inicial?.periodicidad || 'mensual')
  const [probabilidad, setProbabilidad] = useState(inicial?.probabilidad ?? 80)
  const [fechaFin, setFechaFin] = useState(inicial?.fechaFin || '')
  const [renovable, setRenovable] = useState(inicial?.renovable ?? false)

  const esIndependiente = tipo === 'independiente'
  const montoMensual = parseFloat(monto) * 1000 * (periodicidad === 'quincenal' ? 2 : periodicidad === 'semanal' ? 4 : 1)

  function guardar() {
    if (!nombre || !monto) return
    onSave({
      nombre, tipo,
      monto: parseFloat(monto) * 1000,
      periodicidad,
      probabilidad: esIndependiente ? probabilidad : tipo === 'empleado' ? 95 : 70,
      fechaFin: fechaFin || null,
      renovable,
      activo: true,
    })
  }

  return (
    <>
      <Input label="Nombre" value={nombre} onChange={setNombre} placeholder="Ej: Salario Uniandes" />
      <Select label="Tipo" value={tipo} onChange={setTipo} options={TIPO_OPTIONS} />
      <Input label="Monto" value={monto} onChange={setMonto} type="number" placeholder="3500" suffix="miles COP" hint={monto ? `≈ ${fmtK(montoMensual)} al mes` : ''} />
      <Select label="Periodicidad del pago" value={periodicidad} onChange={setPeriodicidad} options={PERIODICIDADES} />

      {esIndependiente && (
        <div style={{ marginBottom: 14 }}>
          <p style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>Probabilidad de renovación mensual</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input type="range" min={10} max={100} step={5} value={probabilidad} onChange={e => setProbabilidad(Number(e.target.value))} style={{ flex: 1 }} />
            <span style={{ fontSize: 16, fontWeight: 700, color: C.accent, minWidth: 40 }}>{probabilidad}%</span>
          </div>
          <p style={{ fontSize: 11, color: C.hint, marginTop: 3 }}>
            {probabilidad >= 80 ? 'Alta certeza' : probabilidad >= 50 ? 'Probabilidad media' : 'Incierto — considera un escenario pesimista'}
          </p>
        </div>
      )}

      <Input label="Fecha de fin (opcional)" value={fechaFin} onChange={setFechaFin} type="month" hint="Si el contrato o ingreso tiene fecha de vencimiento" />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, padding: '10px 0', borderTop: `1px solid ${C.border}` }}>
        <p style={{ fontSize: 13, color: C.text }}>¿Hay posibilidad de renovación?</p>
        <button onClick={() => setRenovable(r => !r)}
          style={{ width: 44, height: 24, borderRadius: 12, border: 'none', background: renovable ? C.accent : C.border, cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
          <div style={{ position: 'absolute', top: 3, left: renovable ? 22 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <Btn variant="ghost" onClick={onClose} style={{ flex: 1 }}>Cancelar</Btn>
        <Btn variant="primary" onClick={guardar} disabled={!nombre || !monto} style={{ flex: 1 }}>
          {inicial ? 'Guardar' : 'Agregar'}
        </Btn>
      </div>
    </>
  )
}

export default function Ingresos() {
  const { fuentes, addFuente, updateFuente, deleteFuente, getIngresoMensual } = useStore()
  const [sheet, setSheet] = useState(null) // null | 'nuevo' | fuente
  const ingresoTotal = getIngresoMensual()

  function handleSave(data) {
    if (sheet?.id) updateFuente(sheet.id, data)
    else addFuente(data)
    setSheet(null)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: C.text }}>Ingresos</h2>
          <p style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Total mensual: <strong style={{ color: C.green }}>{fmtK(ingresoTotal)}</strong></p>
        </div>
        <Btn variant="primary" onClick={() => setSheet('nuevo')} style={{ padding: '8px 14px' }}>+ Agregar</Btn>
      </div>

      {fuentes.length === 0 ? (
        <EmptyState icon="💰" title="Sin ingresos registrados" desc="Agrega tus fuentes de ingreso para calcular tu flujo mensual y runway." action={<Btn variant="primary" onClick={() => setSheet('nuevo')}>Agregar ingreso</Btn>} />
      ) : (
        fuentes.map(f => {
          const montoMensual = f.monto * (f.periodicidad === 'quincenal' ? 2 : f.periodicidad === 'semanal' ? 4 : 1)
          const colorProb = f.probabilidad >= 80 ? C.green : f.probabilidad >= 50 ? C.amber : C.red
          return (
            <Card key={f.id} onClick={() => setSheet(f)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <p style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{f.nombre}</p>
                    {!f.activo && <Tag color={C.muted}>inactivo</Tag>}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <Tag color={C.blue}>{TIPO_OPTIONS.find(t => t.value === f.tipo)?.label?.split(' ')[1] || f.tipo}</Tag>
                    <Tag color={C.muted}>{f.periodicidad}</Tag>
                    {f.tipo !== 'empleado' && <Tag color={colorProb}>{f.probabilidad}% prob.</Tag>}
                    {f.fechaFin && <Tag color={C.amber}>hasta {f.fechaFin}</Tag>}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800, color: C.green }}>{fmtK(montoMensual)}</p>
                  <p style={{ fontSize: 10, color: C.hint }}>/ mes</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <Btn variant="ghost" onClick={e => { e.stopPropagation(); updateFuente(f.id, { activo: !f.activo }) }} style={{ flex: 1, padding: '6px', fontSize: 12 }}>
                  {f.activo ? 'Pausar' : 'Activar'}
                </Btn>
                <Btn variant="danger" onClick={e => { e.stopPropagation(); deleteFuente(f.id) }} style={{ padding: '6px 12px', fontSize: 12 }}>
                  Eliminar
                </Btn>
              </div>
            </Card>
          )
        })
      )}

      <BottomSheet open={!!sheet} onClose={() => setSheet(null)} title={sheet?.id ? 'Editar ingreso' : 'Nuevo ingreso'}>
        <FormFuente inicial={sheet?.id ? sheet : null} onSave={handleSave} onClose={() => setSheet(null)} />
      </BottomSheet>

      <div style={{ height: 20 }} />
    </div>
  )
}
