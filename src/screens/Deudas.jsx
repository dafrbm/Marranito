import { useState } from 'react'
import { useStore, ESTRATEGIAS_DEUDA, TIPOS_TASA } from '../store'
import { C, Card, SectionLabel, Btn, Tag, Bar, EmptyState, fmt, fmtK, pct } from '../components/ui'

function PlanTimeline({ plan }) {
  if (!plan || plan.length === 0) return (
    <p style={{ fontSize: 13, color: C.hint, textAlign: 'center', padding: '16px 0' }}>
      Agrega ingresos y categorías de gasto para calcular el plan.
    </p>
  )

  return (
    <div>
      {plan.map((mes, i) => (
        <div key={i} style={{ display: 'flex', gap: 12, paddingBottom: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: mes.saldoTotal === 0 ? C.green : C.accent, flexShrink: 0, marginTop: 2 }} />
            {i < plan.length - 1 && <div style={{ width: 1, flex: 1, background: C.border, minHeight: 24 }} />}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Mes {mes.mes}</p>
              <p style={{ fontSize: 12, color: mes.saldoTotal === 0 ? C.green : C.muted, fontWeight: mes.saldoTotal === 0 ? 700 : 400 }}>
                {mes.saldoTotal === 0 ? '🎉 Deuda cero' : fmtK(mes.saldoTotal)}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {mes.acciones.map((a, j) => (
                <Tag key={j} color={a.cierra ? C.green : C.accent} small>
                  {a.cierra ? '✓ ' : ''}{a.nombre}: {fmtK(a.pago)}
                </Tag>
              ))}
            </div>
            {mes.sobrante > 0 && (
              <p style={{ fontSize: 10, color: C.hint, marginTop: 4 }}>+{fmtK(mes.sobrante)} sobrante</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Deudas() {
  const { compromisos, estrategiaDeuda, setEstrategia, getDeudas, calcularPlanDeudas, updateCompromiso } = useStore()
  const deudas = getDeudas()
  const planAvalanche = (() => { setEstrategia('avalanche'); return calcularPlanDeudas() })()
  const planSnowball = (() => { setEstrategia('snowball'); return calcularPlanDeudas() })()
  // Restore actual strategy
  const planActual = estrategiaDeuda === 'avalanche' ? planAvalanche : planSnowball

  const deudaTotal = deudas.reduce((s, d) => s + d.saldo, 0)
  const deudaInicial = deudas.reduce((s, d) => s + (d.saldoInicial || d.saldo), 0)

  const mesesAvalanche = planAvalanche.length
  const mesesSnowball = planSnowball.length

  if (compromisos.filter(c => ['tarjeta','prestamo','libranza','informal'].includes(c.tipo)).length === 0) {
    return (
      <div>
        <h2 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 16 }}>Plan de deudas</h2>
        <EmptyState icon="🎉" title="Sin deudas registradas" desc="Agrega tus deudas en Compromisos para ver el plan de pago óptimo." />
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 22, fontWeight: 800, color: C.text }}>Plan de deudas</h2>
        <p style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Deuda total: <strong style={{ color: C.red }}>{fmtK(deudaTotal)}</strong></p>
      </div>

      {/* Comparación de estrategias */}
      <Card>
        <SectionLabel>Elige tu estrategia</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
          {[
            { id: 'avalanche', label: 'Avalanche', desc: 'Mayor tasa primero', meses: mesesAvalanche, ventaja: 'Ahorra más intereses' },
            { id: 'snowball', label: 'Snowball', desc: 'Menor saldo primero', meses: mesesSnowball, ventaja: 'Cierra deudas más rápido' },
          ].map(e => (
            <div key={e.id} onClick={() => setEstrategia(e.id)}
              style={{ padding: '12px', borderRadius: 12, border: `1px solid ${estrategiaDeuda === e.id ? C.accent : C.border}`, background: estrategiaDeuda === e.id ? C.accentDim : C.surfaceHi, cursor: 'pointer', transition: 'all 0.2s' }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: estrategiaDeuda === e.id ? C.accentText : C.text, marginBottom: 2 }}>{e.label}</p>
              <p style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>{e.desc}</p>
              <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 22, fontWeight: 800, color: estrategiaDeuda === e.id ? C.accent : C.text }}>{e.meses}</p>
              <p style={{ fontSize: 10, color: C.hint }}>meses</p>
              <p style={{ fontSize: 10, color: C.green, marginTop: 4 }}>{e.ventaja}</p>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 11, color: C.hint, textAlign: 'center' }}>
          {mesesAvalanche === mesesSnowball ? 'Ambas estrategias terminan en el mismo tiempo' : mesesAvalanche < mesesSnowball ? `Avalanche termina ${mesesSnowball - mesesAvalanche} mes(es) antes` : `Snowball termina ${mesesAvalanche - mesesSnowball} mes(es) antes`}
        </p>
      </Card>

      {/* Estado de cada deuda */}
      <Card>
        <SectionLabel>Deudas — orden de pago ({estrategiaDeuda})</SectionLabel>
        {deudas.map((d, i) => {
          const pagado = (d.saldoInicial || d.saldo) - d.saldo
          const tasaInfo = TIPOS_TASA[d.tasaTipo]
          return (
            <div key={d.id} style={{ paddingBottom: i < deudas.length - 1 ? 12 : 0, marginBottom: i < deudas.length - 1 ? 12 : 0, borderBottom: i < deudas.length - 1 ? `1px solid ${C.border}` : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: C.surfaceHi, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: C.muted, flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{d.nombre}</p>
                    {tasaInfo && <Tag color={tasaInfo.color} small>{tasaInfo.label}</Tag>}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 16, fontWeight: 800, color: d.saldo === 0 ? C.green : C.red }}>{fmtK(d.saldo)}</p>
                  <p style={{ fontSize: 10, color: C.hint }}>cuota {fmtK(d.cuota)}</p>
                </div>
              </div>
              <Bar value={pagado} total={d.saldoInicial || d.saldo} color={d.saldo === 0 ? C.green : d.color} height={4} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <span style={{ fontSize: 10, color: C.hint }}>{pct(pagado, d.saldoInicial || d.saldo)}% pagado</span>
                <span style={{ fontSize: 10, color: C.hint }}>inicial: {fmtK(d.saldoInicial)}</span>
              </div>
            </div>
          )
        })}
      </Card>

      {/* Timeline */}
      <Card>
        <SectionLabel>Proyección mes a mes — {estrategiaDeuda}</SectionLabel>
        <PlanTimeline plan={planActual} />
      </Card>

      <div style={{ height: 20 }} />
    </div>
  )
}
