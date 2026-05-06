import { useState } from 'react'
import { useStore } from '../store'
import { C, Card, SectionLabel, Btn, Input, BottomSheet, EmptyState, Bar, Tag, fmt, fmtK } from '../components/ui'

function RunwayCard({ escenario, resultado, onEdit }) {
  if (!resultado) return null
  const { meses, flujo, gastoTotal, ingresoMensual } = resultado
  const infinito = meses === Infinity || meses > 120
  const color = infinito ? C.green : meses >= 6 ? C.green : meses >= 3 ? C.amber : C.red
  const label = infinito ? '∞' : meses.toFixed(1)
  const descripcion = infinito ? 'Ingresos cubren todos los gastos'
    : meses >= 6 ? 'Colchón sólido'
    : meses >= 3 ? 'Margen ajustado'
    : 'Riesgo alto — considera ajustar gastos'

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <p style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 3 }}>{escenario.nombre}</p>
          <p style={{ fontSize: 12, color: C.muted }}>{escenario.desc}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 36, fontWeight: 800, color, lineHeight: 1 }}>{label}</p>
          <p style={{ fontSize: 10, color: C.hint }}>meses</p>
        </div>
      </div>
      {!infinito && <Bar value={Math.min(meses, 12)} total={12} color={color} height={6} />}
      <p style={{ fontSize: 11, color, marginTop: 6, fontWeight: 600 }}>{descripcion}</p>
      {!infinito && gastoTotal && (
        <div style={{ marginTop: 10, padding: '8px 10px', background: C.surfaceHi, borderRadius: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
            <span style={{ color: C.muted }}>Ingresos en escenario</span>
            <span style={{ color: C.green }}>{fmt(ingresoMensual)}/mes</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginTop: 3 }}>
            <span style={{ color: C.muted }}>Gasto mínimo</span>
            <span style={{ color: C.red }}>{fmt(gastoTotal)}/mes</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginTop: 3 }}>
            <span style={{ color: C.muted }}>Déficit mensual</span>
            <span style={{ color: C.red }}>{fmt(Math.abs(flujo))}/mes</span>
          </div>
        </div>
      )}
      <Btn variant="ghost" onClick={onEdit} style={{ width: '100%', marginTop: 10, padding: '7px', fontSize: 12 }}>
        Editar escenario
      </Btn>
    </Card>
  )
}

function FormEscenario({ inicial, onSave, onClose }) {
  const [nombre, setNombre] = useState(inicial?.nombre || '')
  const [desc, setDesc] = useState(inicial?.desc || '')
  const [tipo, setTipo] = useState(
    inicial?.multiplicador === 0 ? 'pesimista'
      : inicial?.multiplicador === 1 ? 'optimista'
      : inicial?.multiplicador === null ? 'probable'
      : 'personalizado'
  )
  const [multiplicador, setMultiplicador] = useState(inicial?.multiplicador ?? 0.5)

  function guardar() {
    if (!nombre) return
    const mult = tipo === 'pesimista' ? 0
      : tipo === 'optimista' ? 1
      : tipo === 'probable' ? null
      : multiplicador
    onSave({ nombre, desc, multiplicador: mult, activo: true })
  }

  return (
    <>
      <Input label="Nombre del escenario" value={nombre} onChange={setNombre} placeholder="Ej: Contrato renovado a 70%" />
      <Input label="Descripción" value={desc} onChange={setDesc} placeholder="Explica brevemente este escenario" />
      <div style={{ marginBottom: 14 }}>
        <p style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>Tipo de escenario</p>
        {[
          { id: 'pesimista', label: 'Pesimista', sub: 'Cero ingresos' },
          { id: 'probable', label: 'Probable', sub: 'Solo fuentes con >50% prob.' },
          { id: 'optimista', label: 'Optimista', sub: 'Todos los ingresos' },
          { id: 'personalizado', label: 'Personalizado', sub: 'Define el % de ingresos' },
        ].map(t => (
          <div key={t.id} onClick={() => setTipo(t.id)}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: 10, border: `1px solid ${tipo === t.id ? C.accent : C.border}`, background: tipo === t.id ? C.accentDim : C.surfaceHi, marginBottom: 6, cursor: 'pointer' }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: tipo === t.id ? C.accentText : C.text }}>{t.label}</p>
              <p style={{ fontSize: 11, color: C.muted }}>{t.sub}</p>
            </div>
            <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${tipo === t.id ? C.accent : C.border}`, background: tipo === t.id ? C.accent : 'none' }} />
          </div>
        ))}
      </div>
      {tipo === 'personalizado' && (
        <div style={{ marginBottom: 14 }}>
          <p style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>% de ingresos que se mantienen</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input type="range" min={0} max={100} step={5} value={Math.round(multiplicador * 100)} onChange={e => setMultiplicador(Number(e.target.value) / 100)} style={{ flex: 1 }} />
            <span style={{ fontSize: 16, fontWeight: 700, color: C.accent, minWidth: 42 }}>{Math.round(multiplicador * 100)}%</span>
          </div>
        </div>
      )}
      <div style={{ display: 'flex', gap: 8 }}>
        <Btn variant="ghost" onClick={onClose} style={{ flex: 1 }}>Cancelar</Btn>
        <Btn variant="primary" onClick={guardar} disabled={!nombre} style={{ flex: 1 }}>{inicial ? 'Guardar' : 'Agregar'}</Btn>
      </div>
    </>
  )
}

export default function Runway() {
  const { escenarios, addEscenario, updateEscenario, deleteEscenario, calcularRunway, reservas, addReserva, updateReserva, deleteReserva } = useStore()
  const [sheet, setSheet] = useState(null)
  const [sheetReserva, setSheetReserva] = useState(null)
  const [nombreReserva, setNombreReserva] = useState('')
  const [montoReserva, setMontoReserva] = useState('')
  const [disponibleReserva, setDisponibleReserva] = useState(true)

  const totalReservas = reservas.filter(r => r.disponible).reduce((s, r) => s + r.monto, 0)

  function handleSaveEsc(data) {
    if (sheet?.id) updateEscenario(sheet.id, data)
    else addEscenario(data)
    setSheet(null)
  }

  function handleSaveReserva() {
    const monto = parseFloat(montoReserva) * 1000
    if (!nombreReserva || isNaN(monto)) return
    if (sheetReserva?.id) updateReserva(sheetReserva.id, { nombre: nombreReserva, monto, disponible: disponibleReserva })
    else addReserva({ nombre: nombreReserva, monto, disponible: disponibleReserva })
    setSheetReserva(null)
    setNombreReserva(''); setMontoReserva('')
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 22, fontWeight: 800, color: C.text }}>Runway</h2>
          <p style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>¿Cuánto tiempo aguantas?</p>
        </div>
        <Btn variant="primary" onClick={() => setSheet('nuevo')} style={{ padding: '8px 14px' }}>+ Escenario</Btn>
      </div>

      {/* Reservas */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <SectionLabel>Reservas disponibles</SectionLabel>
          <Btn variant="ghost" onClick={() => setSheetReserva('nuevo')} style={{ padding: '4px 10px', fontSize: 11 }}>+ Agregar</Btn>
        </div>
        {reservas.length === 0 ? (
          <p style={{ fontSize: 13, color: C.hint, textAlign: 'center', padding: '12px 0' }}>Agrega ahorros, cesantías u otras reservas</p>
        ) : (
          reservas.map((r, i) => (
            <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < reservas.length - 1 ? `1px solid ${C.border}` : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16 }}>{r.disponible ? '✅' : '🔒'}</span>
                <div>
                  <p style={{ fontSize: 13, color: C.text }}>{r.nombre}</p>
                  {!r.disponible && <p style={{ fontSize: 10, color: C.hint }}>No disponible de inmediato</p>}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: r.disponible ? C.green : C.muted }}>{fmtK(r.monto)}</p>
                <button onClick={() => deleteReserva(r.id)} style={{ background: 'none', border: 'none', color: C.hint, fontSize: 16, cursor: 'pointer' }}>×</button>
              </div>
            </div>
          ))
        )}
        {reservas.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0', marginTop: 4, borderTop: `1px solid ${C.borderHi}` }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Total disponible</p>
            <p style={{ fontSize: 14, fontWeight: 800, color: C.green, fontFamily: "'Nunito', sans-serif" }}>{fmtK(totalReservas)}</p>
          </div>
        )}
      </Card>

      {/* Escenarios */}
      {escenarios.length === 0 ? (
        <EmptyState icon="📡" title="Sin escenarios" desc="Crea escenarios para calcular cuánto tiempo aguantas con diferentes niveles de ingresos."
          action={<Btn variant="primary" onClick={() => setSheet('nuevo')}>Crear escenario</Btn>} />
      ) : (
        escenarios.filter(e => e.activo).map(e => (
          <RunwayCard key={e.id} escenario={e} resultado={calcularRunway(e.id)} onEdit={() => setSheet(e)} />
        ))
      )}

      {/* Sheet escenario */}
      <BottomSheet open={!!sheet} onClose={() => setSheet(null)} title={sheet?.id ? 'Editar escenario' : 'Nuevo escenario'}>
        <FormEscenario inicial={sheet?.id ? sheet : null} onSave={handleSaveEsc} onClose={() => setSheet(null)} />
        {sheet?.id && (
          <Btn variant="danger" onClick={() => { deleteEscenario(sheet.id); setSheet(null) }} style={{ width: '100%', marginTop: 8 }}>
            Eliminar escenario
          </Btn>
        )}
      </BottomSheet>

      {/* Sheet reserva */}
      <BottomSheet open={!!sheetReserva} onClose={() => setSheetReserva(null)} title="Agregar reserva">
        <Input label="Nombre" value={nombreReserva} onChange={setNombreReserva} placeholder="Ej: Cajita Nu, Cesantías..." />
        <Input label="Monto" value={montoReserva} onChange={setMontoReserva} type="number" placeholder="3000" suffix="miles COP" />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <p style={{ fontSize: 13, color: C.text }}>¿Disponible de inmediato?</p>
            <p style={{ fontSize: 11, color: C.hint }}>Desactiva si requiere trámite (ej: cesantías)</p>
          </div>
          <button onClick={() => setDisponibleReserva(d => !d)}
            style={{ width: 44, height: 24, borderRadius: 12, border: 'none', background: disponibleReserva ? C.accent : C.border, cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
            <div style={{ position: 'absolute', top: 3, left: disponibleReserva ? 22 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
          </button>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn variant="ghost" onClick={() => setSheetReserva(null)} style={{ flex: 1 }}>Cancelar</Btn>
          <Btn variant="primary" onClick={handleSaveReserva} style={{ flex: 1 }}>Agregar</Btn>
        </div>
      </BottomSheet>

      <div style={{ height: 20 }} />
    </div>
  )
}
