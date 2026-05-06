import { useState } from 'react'
import { useStore, TIPOS_COMPROMISO, TIPOS_TASA } from '../store'
import { C, Card, SectionLabel, Tag, Btn, Input, Select, BottomSheet, EmptyState, Bar, fmt, fmtK, pct } from '../components/ui'

const GRUPOS = {
  deudas: { label: 'Deudas', tipos: ['tarjeta', 'prestamo', 'libranza', 'informal'], icon: '💳' },
  fijos: { label: 'Gastos fijos', tipos: ['arriendo', 'servicio', 'suscripcion'], icon: '📆' },
  ahorro: { label: 'Ahorro e inversión', tipos: ['ahorro'], icon: '🐷' },
  otro: { label: 'Otros', tipos: ['otro'], icon: '📌' },
}

function FormCompromiso({ inicial, onSave, onClose }) {
  const [nombre, setNombre] = useState(inicial?.nombre || '')
  const [tipo, setTipo] = useState(inicial?.tipo || 'tarjeta')
  const [saldo, setSaldo] = useState(inicial ? String(inicial.saldo / 1000) : '')
  const [cuota, setCuota] = useState(inicial ? String(inicial.cuota / 1000) : '')
  const [tasaTipo, setTasaTipo] = useState(inicial?.tasaTipo || 'media')
  const [cuotaManejo, setCuotaManejo] = useState(inicial ? String((inicial.cuotaManejo || 0) / 1000) : '0')
  const [fechaFin, setFechaFin] = useState(inicial?.fechaFin || '')

  const esDeuda = ['tarjeta', 'prestamo', 'libranza', 'informal'].includes(tipo)
  const esAhorro = tipo === 'ahorro'
  const esFijo = ['arriendo', 'servicio', 'suscripcion'].includes(tipo)

  function guardar() {
    if (!nombre) return
    onSave({
      nombre, tipo,
      saldo: esDeuda ? parseFloat(saldo) * 1000 || 0 : esAhorro ? parseFloat(saldo) * 1000 || 0 : 0,
      cuota: parseFloat(cuota) * 1000 || 0,
      tasaTipo: esDeuda ? tasaTipo : null,
      cuotaManejo: parseFloat(cuotaManejo) * 1000 || 0,
      fechaFin: fechaFin || null,
      activo: true,
    })
  }

  return (
    <>
      <Input label="Nombre" value={nombre} onChange={setNombre} placeholder="Ej: Visa, Arriendo, Netflix..." />
      <Select label="Tipo" value={tipo} onChange={setTipo}
        options={Object.entries(TIPOS_COMPROMISO).map(([k, v]) => ({ value: k, label: `${v.icon} ${v.label}` }))} />

      {esDeuda && <>
        <Input label="Saldo restante" value={saldo} onChange={setSaldo} type="number" placeholder="2500" suffix="miles" />
        <Input label="Cuota mensual" value={cuota} onChange={setCuota} type="number" placeholder="350" suffix="miles" />
        <Select label="Nivel de tasa" value={tasaTipo} onChange={setTasaTipo}
          options={Object.entries(TIPOS_TASA).map(([k, v]) => ({ value: k, label: v.label }))} />
        <Input label="Cuota de manejo mensual" value={cuotaManejo} onChange={setCuotaManejo} type="number" placeholder="0" suffix="miles" hint="0 si no tiene" />
      </>}

      {esAhorro && <>
        <Input label="Saldo actual" value={saldo} onChange={setSaldo} type="number" placeholder="500" suffix="miles" />
        <Input label="Aporte mensual" value={cuota} onChange={setCuota} type="number" placeholder="500" suffix="miles" />
      </>}

      {esFijo && <>
        <Input label="Valor mensual" value={cuota} onChange={setCuota} type="number" placeholder="800" suffix="miles" />
      </>}

      <Input label="Fecha de fin (opcional)" value={fechaFin} onChange={setFechaFin} type="month" hint="Si tiene vencimiento o estás pagando hasta cierta fecha" />

      <div style={{ display: 'flex', gap: 8 }}>
        <Btn variant="ghost" onClick={onClose} style={{ flex: 1 }}>Cancelar</Btn>
        <Btn variant="primary" onClick={guardar} disabled={!nombre} style={{ flex: 1 }}>
          {inicial ? 'Guardar' : 'Agregar'}
        </Btn>
      </div>
    </>
  )
}

export default function Compromisos() {
  const { compromisos, addCompromiso, updateCompromiso, deleteCompromiso } = useStore()
  const [sheet, setSheet] = useState(null)
  const [grupoActivo, setGrupoActivo] = useState('deudas')

  const grupo = GRUPOS[grupoActivo]
  const items = compromisos.filter(c => grupo.tipos.includes(c.tipo))
  const deudaTotal = compromisos.filter(c => ['tarjeta','prestamo','libranza','informal'].includes(c.tipo)).reduce((s, c) => s + (c.saldo || 0), 0)

  function handleSave(data) {
    if (sheet?.id) updateCompromiso(sheet.id, data)
    else addCompromiso(data)
    setSheet(null)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: C.text }}>Compromisos</h2>
          {deudaTotal > 0 && <p style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Deuda total: <strong style={{ color: C.red }}>{fmtK(deudaTotal)}</strong></p>}
        </div>
        <Btn variant="primary" onClick={() => setSheet('nuevo')} style={{ padding: '8px 14px' }}>+ Agregar</Btn>
      </div>

      {/* Tabs de grupos */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, overflowX: 'auto', paddingBottom: 4 }}>
        {Object.entries(GRUPOS).map(([k, g]) => {
          const count = compromisos.filter(c => g.tipos.includes(c.tipo)).length
          return (
            <button key={k} onClick={() => setGrupoActivo(k)}
              style={{ flexShrink: 0, padding: '6px 14px', borderRadius: 20, border: `1px solid ${grupoActivo === k ? C.accent : C.border}`, background: grupoActivo === k ? C.accentDim : C.surface, color: grupoActivo === k ? C.accentText : C.muted, fontSize: 12, cursor: 'pointer', fontWeight: grupoActivo === k ? 600 : 400, whiteSpace: 'nowrap' }}>
              {g.icon} {g.label} {count > 0 && `(${count})`}
            </button>
          )
        })}
      </div>

      {items.length === 0 ? (
        <EmptyState icon={grupo.icon} title={`Sin ${grupo.label.toLowerCase()}`}
          desc={`Agrega tus ${grupo.label.toLowerCase()} para incluirlos en el plan financiero.`}
          action={<Btn variant="primary" onClick={() => setSheet('nuevo')}>Agregar</Btn>} />
      ) : (
        items.map(c => {
          const esDeuda = ['tarjeta','prestamo','libranza','informal'].includes(c.tipo)
          const pagado = (c.saldoInicial || c.saldo) - c.saldo
          const tasaInfo = TIPOS_TASA[c.tasaTipo]
          return (
            <Card key={c.id} onClick={() => setSheet(c)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 14 }}>{TIPOS_COMPROMISO[c.tipo]?.icon}</span>
                    <p style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{c.nombre}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {tasaInfo && <Tag color={tasaInfo.color}>{tasaInfo.label}</Tag>}
                    {c.cuotaManejo > 0 && <Tag color={C.muted}>cuota manejo {fmtK(c.cuotaManejo)}</Tag>}
                    {c.fechaFin && <Tag color={C.amber}>hasta {c.fechaFin}</Tag>}
                    {c.saldo === 0 && esDeuda && <Tag color={C.green}>✓ Saldada</Tag>}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 8 }}>
                  {esDeuda ? (
                    <>
                      <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 17, fontWeight: 800, color: c.saldo === 0 ? C.green : C.red }}>{fmtK(c.saldo)}</p>
                      <p style={{ fontSize: 10, color: C.hint }}>cuota {fmtK(c.cuota)}</p>
                    </>
                  ) : c.tipo === 'ahorro' ? (
                    <>
                      <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 17, fontWeight: 800, color: C.purple }}>{fmtK(c.saldo)}</p>
                      <p style={{ fontSize: 10, color: C.hint }}>+{fmtK(c.cuota)}/mes</p>
                    </>
                  ) : (
                    <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 17, fontWeight: 800, color: C.amber }}>{fmtK(c.cuota)}</p>
                  )}
                </div>
              </div>
              {esDeuda && c.saldoInicial > 0 && (
                <>
                  <Bar value={pagado} total={c.saldoInicial} color={c.saldo === 0 ? C.green : c.color} height={4} />
                  <p style={{ fontSize: 10, color: C.hint, marginTop: 4 }}>{pct(pagado, c.saldoInicial)}% pagado</p>
                </>
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                {esDeuda && c.saldo > 0 && (
                  <Btn variant="ghost" onClick={e => { e.stopPropagation(); setSheet({ ...c, _modoAbono: true }) }} style={{ flex: 1, padding: '6px', fontSize: 12 }}>
                    Registrar abono
                  </Btn>
                )}
                <Btn variant="danger" onClick={e => { e.stopPropagation(); deleteCompromiso(c.id) }} style={{ padding: '6px 12px', fontSize: 12 }}>
                  Eliminar
                </Btn>
              </div>
            </Card>
          )
        })
      )}

      <BottomSheet open={!!sheet} onClose={() => setSheet(null)} title={sheet?.id ? `Editar — ${sheet.nombre}` : 'Nuevo compromiso'}>
        <FormCompromiso inicial={sheet?.id ? sheet : null} onSave={handleSave} onClose={() => setSheet(null)} />
      </BottomSheet>

      <div style={{ height: 20 }} />
    </div>
  )
}
