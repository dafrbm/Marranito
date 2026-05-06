import { useState } from 'react'
import { useStore } from '../store'
import { C, Card, SectionLabel, Btn, Input, Select, BottomSheet, EmptyState, Bar, Tag, fmt, fmtK, pct } from '../components/ui'

const ICONS = ['🍽️','🚌','💊','🎬','👕','📱','🛒','☕','🐶','📚','🏋️','✈️','🎮','💄','🏥','⚽','🍺','🎁','🏠','⚡','🎵','📌']

function FormCategoria({ inicial, onSave, onClose }) {
  const [nombre, setNombre] = useState(inicial?.nombre || '')
  const [presupuesto, setPresupuesto] = useState(inicial ? String(inicial.presupuesto / 1000) : '')
  const [icon, setIcon] = useState(inicial?.icon || '📌')
  const [esencial, setEsencial] = useState(inicial?.esencial ?? false)

  return (
    <>
      <div style={{ marginBottom: 14 }}>
        <p style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>Ícono</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {ICONS.map(i => (
            <button key={i} onClick={() => setIcon(i)}
              style={{ fontSize: 22, width: 40, height: 40, borderRadius: 10, border: `1px solid ${icon === i ? C.accent : C.border}`, background: icon === i ? C.accentDim : C.surfaceHi, cursor: 'pointer' }}>
              {i}
            </button>
          ))}
        </div>
      </div>
      <Input label="Nombre" value={nombre} onChange={setNombre} placeholder="Ej: Alimentación" />
      <Input label="Presupuesto mensual" value={presupuesto} onChange={setPresupuesto} type="number" placeholder="500" suffix="miles COP" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <p style={{ fontSize: 13, color: C.text }}>¿Gasto esencial?</p>
          <p style={{ fontSize: 11, color: C.hint }}>Se incluye en el cálculo de runway mínimo</p>
        </div>
        <button onClick={() => setEsencial(e => !e)}
          style={{ width: 44, height: 24, borderRadius: 12, border: 'none', background: esencial ? C.accent : C.border, cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
          <div style={{ position: 'absolute', top: 3, left: esencial ? 22 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
        </button>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <Btn variant="ghost" onClick={onClose} style={{ flex: 1 }}>Cancelar</Btn>
        <Btn variant="primary" onClick={() => nombre && presupuesto && onSave({ nombre, presupuesto: parseFloat(presupuesto) * 1000, icon, esencial })} disabled={!nombre || !presupuesto} style={{ flex: 1 }}>
          {inicial ? 'Guardar' : 'Agregar'}
        </Btn>
      </div>
    </>
  )
}

export default function Gastos() {
  const { categorias, addCategoria, updateCategoria, deleteCategoria, mesActivo, añoActivo, getGastosDelMes, setGasto } = useStore()
  const [sheet, setSheet] = useState(null)
  const [editGasto, setEditGasto] = useState(null)
  const [valorGasto, setValorGasto] = useState('')

  const gastosDelMes = getGastosDelMes(mesActivo, añoActivo)
  const totalGastado = Object.values(gastosDelMes).reduce((s, v) => s + v, 0)
  const totalPresupuesto = categorias.reduce((s, c) => s + c.presupuesto, 0)

  function abrirGasto(cat) {
    setEditGasto(cat)
    setValorGasto(gastosDelMes[cat.id] ? String(gastosDelMes[cat.id] / 1000) : '')
  }

  function guardarGasto() {
    const v = parseFloat(valorGasto.replace(',', '.')) * 1000
    if (!isNaN(v) && v >= 0) setGasto(mesActivo, añoActivo, editGasto.id, Math.round(v))
    setEditGasto(null)
  }

  function handleSaveCat(data) {
    if (sheet?.id) updateCategoria(sheet.id, data)
    else addCategoria(data)
    setSheet(null)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 22, fontWeight: 800, color: C.text }}>Gastos</h2>
          <p style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{mesActivo} — {fmt(totalGastado)} de {fmt(totalPresupuesto)}</p>
        </div>
        <Btn variant="primary" onClick={() => setSheet('nuevo')} style={{ padding: '8px 14px' }}>+ Categoría</Btn>
      </div>

      {categorias.length > 0 && (
        <Card>
          <SectionLabel>Total del mes</SectionLabel>
          <Bar value={totalGastado} total={totalPresupuesto} color={totalGastado > totalPresupuesto ? C.red : C.accent} height={8} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            <span style={{ fontSize: 12, color: C.muted }}>{pct(totalGastado, totalPresupuesto)}% usado</span>
            <span style={{ fontSize: 12, color: totalGastado > totalPresupuesto ? C.red : C.muted }}>
              {totalGastado > totalPresupuesto ? `+${fmt(totalGastado - totalPresupuesto)} sobre presupuesto` : `${fmt(totalPresupuesto - totalGastado)} disponible`}
            </span>
          </div>
        </Card>
      )}

      {categorias.length === 0 ? (
        <EmptyState icon="📊" title="Sin categorías" desc="Crea categorías de gasto para hacer seguimiento mensual de tu presupuesto variable."
          action={<Btn variant="primary" onClick={() => setSheet('nuevo')}>Crear categoría</Btn>} />
      ) : (
        categorias.map(cat => {
          const gastado = gastosDelMes[cat.id] || 0
          const sobrepasado = gastado > cat.presupuesto
          return (
            <Card key={cat.id} onClick={() => abrirGasto(cat)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 20 }}>{cat.icon}</span>
                    <p style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{cat.nombre}</p>
                    {cat.esencial && <Tag color={C.blue} small>esencial</Tag>}
                  </div>
                  <p style={{ fontSize: 11, color: C.hint }}>presupuesto: {fmt(cat.presupuesto)}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 18, fontWeight: 800, color: gastado === 0 ? C.hint : sobrepasado ? C.red : C.green }}>
                    {gastado === 0 ? '—' : fmtK(gastado)}
                  </p>
                  {sobrepasado && <p style={{ fontSize: 10, color: C.red }}>+{fmtK(gastado - cat.presupuesto)}</p>}
                </div>
              </div>
              <Bar value={gastado} total={cat.presupuesto} color={sobrepasado ? C.red : C.accent} height={4} />
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <Btn variant="ghost" onClick={e => { e.stopPropagation(); setSheet(cat) }} style={{ flex: 1, padding: '6px', fontSize: 11 }}>
                  Editar categoría
                </Btn>
                <Btn variant="danger" onClick={e => { e.stopPropagation(); deleteCategoria(cat.id) }} style={{ padding: '6px 12px', fontSize: 11 }}>
                  Eliminar
                </Btn>
              </div>
            </Card>
          )
        })
      )}

      {/* Sheet: registrar gasto */}
      {editGasto && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'flex-end', zIndex: 200 }}
          onClick={() => setEditGasto(null)}>
          <div style={{ background: C.surface, borderRadius: '20px 20px 0 0', padding: '20px 20px 32px', width: '100%', border: `1px solid ${C.border}` }}
            onClick={e => e.stopPropagation()}>
            <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 17, fontWeight: 700, color: C.text, marginBottom: 2 }}>{editGasto.icon} {editGasto.nombre}</p>
            <p style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>Presupuesto: {fmt(editGasto.presupuesto)}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: 20, color: C.muted }}>$</span>
              <input type="number" value={valorGasto} onChange={e => setValorGasto(e.target.value)} placeholder="0" autoFocus
                style={{ flex: 1, fontSize: 28, fontWeight: 800, background: C.surfaceHi, border: `1px solid ${C.border}`, borderRadius: 12, padding: '10px 14px', color: C.text, outline: 'none', fontFamily: "'Nunito', sans-serif" }} />
              <span style={{ fontSize: 14, color: C.muted }}>mil</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Btn variant="ghost" onClick={() => setEditGasto(null)} style={{ flex: 1 }}>Cancelar</Btn>
              <Btn variant="primary" onClick={guardarGasto} style={{ flex: 1 }}>Guardar</Btn>
            </div>
          </div>
        </div>
      )}

      <BottomSheet open={!!sheet} onClose={() => setSheet(null)} title={sheet?.id ? 'Editar categoría' : 'Nueva categoría'}>
        <FormCategoria inicial={sheet?.id ? sheet : null} onSave={handleSaveCat} onClose={() => setSheet(null)} />
      </BottomSheet>

      <div style={{ height: 20 }} />
    </div>
  )
}
