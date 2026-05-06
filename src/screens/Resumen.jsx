import { useStore } from '../store'
import { C, Card, SectionLabel, Metric, Bar, Tag, Row, fmt, fmtK, pct } from '../components/ui'

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

export default function Resumen() {
  const {
    perfil, mesActivo, añoActivo, setMes,
    getIngresoMensual, getGastosFijos, getCuotasDeuda, getAhorroMensual,
    getGastosDelMes, categorias, compromisos, fuentes,
  } = useStore()

  const ingreso = getIngresoMensual()
  const gastosFijos = getGastosFijos()
  const cuotas = getCuotasDeuda()
  const ahorro = getAhorroMensual()
  const gastosDelMes = getGastosDelMes(mesActivo, añoActivo)
  const totalGastadoCat = Object.values(gastosDelMes).reduce((s, v) => s + v, 0)
  const totalPresupuestoCat = categorias.reduce((s, c) => s + c.presupuesto, 0)
  const totalEgresos = gastosFijos + cuotas + ahorro + totalPresupuestoCat
  const flujo = ingreso - totalEgresos
  const deudaTotal = compromisos.filter(c => ['tarjeta','prestamo','libranza','informal'].includes(c.tipo)).reduce((s, c) => s + (c.saldo || 0), 0)

  const mesIdx = MESES.indexOf(mesActivo)
  const mesPrev = mesIdx > 0 ? MESES[mesIdx - 1] : MESES[11]
  const mesNext = mesIdx < 11 ? MESES[mesIdx + 1] : MESES[0]

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <p style={{ fontSize: 13, color: C.muted, marginBottom: 2 }}>Hola, {perfil.nombre} 🐷</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => setMes(mesPrev, mesIdx === 0 ? añoActivo - 1 : añoActivo)}
              style={{ background: 'none', border: 'none', color: C.muted, fontSize: 18, cursor: 'pointer', padding: '0 4px' }}>‹</button>
            <h1 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 26, fontWeight: 800, color: C.text }}>{mesActivo}</h1>
            <button onClick={() => setMes(mesNext, mesIdx === 11 ? añoActivo + 1 : añoActivo)}
              style={{ background: 'none', border: 'none', color: C.muted, fontSize: 18, cursor: 'pointer', padding: '0 4px' }}>›</button>
          </div>
          <p style={{ fontSize: 12, color: C.hint }}>{añoActivo}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 11, color: C.muted, marginBottom: 3 }}>Flujo neto</p>
          <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 22, fontWeight: 800, color: flujo >= 0 ? C.green : C.red }}>
            {flujo >= 0 ? '+' : ''}{fmtK(flujo)}
          </p>
        </div>
      </div>

      {/* Métricas principales */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
        <Metric label="Ingresos" value={fmtK(ingreso)} color={C.green} sub={`${fuentes.filter(f=>f.activo).length} fuente(s)`} />
        <Metric label="Egresos totales" value={fmtK(totalEgresos)} color={C.red} sub="fijos + deudas + ahorro" />
        <Metric label="Deuda total" value={fmtK(deudaTotal)} color={deudaTotal > 0 ? C.amber : C.green} sub={deudaTotal === 0 ? '¡Sin deudas! 🎉' : 'saldo restante'} />
        <Metric label="Ahorro mensual" value={fmtK(ahorro)} color={C.purple} sub="comprometido" />
      </div>

      {/* Balance del mes */}
      <Card>
        <SectionLabel>Balance del mes</SectionLabel>
        <Row label="Ingresos" value={fmt(ingreso)} color={C.green} />
        <Row label="Gastos fijos" value={`-${fmt(gastosFijos)}`} color={C.red} />
        <Row label="Cuotas deudas" value={`-${fmt(cuotas)}`} color={C.red} />
        <Row label="Ahorro" value={`-${fmt(ahorro)}`} color={C.purple} />
        <Row label="Presupuesto variable" value={`-${fmt(totalPresupuestoCat)}`} color={C.amber} />
        <div style={{ paddingTop: 10, marginTop: 4, borderTop: `1px solid ${C.borderHi}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: C.text, fontFamily: "'Nunito', sans-serif" }}>Disponible</p>
          <p style={{ fontSize: 18, fontWeight: 800, color: flujo >= 0 ? C.green : C.red, fontFamily: "'Nunito', sans-serif" }}>{fmt(flujo)}</p>
        </div>
      </Card>

      {/* Gasto variable del mes */}
      {categorias.length > 0 && (
        <Card>
          <SectionLabel>Gasto variable este mes</SectionLabel>
          <Bar value={totalGastadoCat} total={totalPresupuestoCat} color={totalGastadoCat > totalPresupuestoCat ? C.red : C.accent} height={6} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: C.muted }}>{fmt(totalGastadoCat)} gastado</span>
            <span style={{ fontSize: 12, color: C.muted }}>de {fmt(totalPresupuestoCat)}</span>
          </div>
          {categorias.slice(0, 4).map((cat, i) => {
            const gastado = gastosDelMes[cat.id] || 0
            return (
              <div key={cat.id} style={{ marginBottom: i < 3 ? 10 : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 12, color: C.text }}>{cat.icon} {cat.nombre}</span>
                  <span style={{ fontSize: 12, color: gastado > cat.presupuesto ? C.red : C.muted }}>
                    {fmt(gastado)} / {fmt(cat.presupuesto)}
                  </span>
                </div>
                <Bar value={gastado} total={cat.presupuesto} color={gastado > cat.presupuesto ? C.red : C.green} height={3} />
              </div>
            )
          })}
          {categorias.length > 4 && (
            <p style={{ fontSize: 11, color: C.hint, marginTop: 8 }}>+{categorias.length - 4} categorías más en Gastos</p>
          )}
        </Card>
      )}

      {/* Deudas top */}
      {deudaTotal > 0 && (
        <Card>
          <SectionLabel>Deudas activas</SectionLabel>
          {compromisos.filter(c => ['tarjeta','prestamo','libranza','informal'].includes(c.tipo) && c.saldo > 0).slice(0, 3).map((d, i, arr) => (
            <div key={d.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                  <p style={{ fontSize: 13, color: C.text }}>{d.nombre}</p>
                </div>
                <p style={{ fontSize: 13, fontWeight: 600, color: C.red }}>{fmtK(d.saldo)}</p>
              </div>
              <Bar value={d.saldoInicial - d.saldo} total={d.saldoInicial} color={d.color} height={3} />
              {i < arr.length - 1 && <div style={{ height: 8 }} />}
            </div>
          ))}
        </Card>
      )}

      {/* Sin datos */}
      {fuentes.length === 0 && compromisos.length === 0 && (
        <Card style={{ textAlign: 'center', padding: '24px 16px' }}>
          <p style={{ fontSize: 32, marginBottom: 8 }}>🐷</p>
          <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7 }}>Agrega tus ingresos y compromisos<br />para ver el resumen aquí.</p>
        </Card>
      )}

      <div style={{ height: 20 }} />
    </div>
  )
}
