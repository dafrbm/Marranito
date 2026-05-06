import { useState } from 'react'
import { useStore } from '../store'
import { C, Card, SectionLabel, Btn, Row } from '../components/ui'

function ConfirmDialog({ mensaje, onConfirm, onCancel }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 300, padding: '0 24px',
    }}>
      <div style={{
        background: C.surface, borderRadius: 16, padding: 24,
        width: '100%', maxWidth: 360, border: `1px solid ${C.border}`,
      }}>
        <p style={{ fontSize: 22, textAlign: 'center', marginBottom: 12 }}>⚠️</p>
        <p style={{ fontSize: 15, fontWeight: 700, color: C.text, textAlign: 'center', marginBottom: 8 }}>
          ¿Reiniciar la app?
        </p>
        <p style={{ fontSize: 13, color: C.muted, textAlign: 'center', lineHeight: 1.6, marginBottom: 24 }}>
          {mensaje}
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <Btn variant="ghost" onClick={onCancel} style={{ flex: 1 }}>Cancelar</Btn>
          <Btn variant="danger" onClick={onConfirm} style={{ flex: 1 }}>Sí, reiniciar</Btn>
        </div>
      </div>
    </div>
  )
}

export default function Ajustes() {
  const { perfil, fuentes, compromisos, categorias, reservas, estrategiaDeuda, resetStore } = useStore()
  const [confirmando, setConfirmando] = useState(false)

  const totalIngresos = fuentes.filter(f => f.activo).length
  const totalCompromisos = compromisos.filter(c => c.activo).length
  const totalCategorias = categorias.length
  const totalReservas = reservas.length

  function handleReset() {
    resetStore()
    setConfirmando(false)
  }

  const situacionLabel = {
    empleado: 'Empleado',
    independiente: 'Independiente',
    mixto: 'Mixto',
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 22, fontWeight: 800, color: C.text }}>Ajustes</h2>
        <p style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Configuración de tu cuenta</p>
      </div>

      {/* Perfil */}
      <Card>
        <SectionLabel>Perfil</SectionLabel>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '8px 0' }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: C.accentDim, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 22, flexShrink: 0,
          }}>🐷</div>
          <div>
            <p style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{perfil.nombre || 'Sin nombre'}</p>
            <p style={{ fontSize: 12, color: C.muted }}>
              {situacionLabel[perfil.situacion] || 'Sin configurar'} · {perfil.moneda}
            </p>
          </div>
        </div>
      </Card>

      {/* Resumen de datos */}
      <Card>
        <SectionLabel>Datos registrados</SectionLabel>
        <Row label="Fuentes de ingreso" value={totalIngresos} border />
        <Row label="Compromisos activos" value={totalCompromisos} border />
        <Row label="Categorías de gasto" value={totalCategorias} border />
        <Row label="Reservas" value={totalReservas} border={false} />
      </Card>

      {/* Preferencias */}
      <Card>
        <SectionLabel>Preferencias</SectionLabel>
        <Row
          label="Estrategia de deudas"
          value={estrategiaDeuda === 'avalanche' ? 'Avalanche' : 'Snowball'}
          sub={estrategiaDeuda === 'avalanche' ? 'Mayor tasa primero' : 'Menor saldo primero'}
          border={false}
        />
      </Card>

      {/* Zona peligrosa */}
      <Card style={{ borderColor: `${C.red}33` }}>
        <SectionLabel>Zona peligrosa</SectionLabel>
        <p style={{ fontSize: 13, color: C.muted, marginBottom: 14, lineHeight: 1.6 }}>
          Reiniciar borra todos tus datos: ingresos, compromisos, gastos, deudas y reservas.
          Esta acción no se puede deshacer.
        </p>
        <Btn
          variant="danger"
          onClick={() => setConfirmando(true)}
          style={{ width: '100%' }}
        >
          Reiniciar desde cero
        </Btn>
      </Card>

      <p style={{ fontSize: 11, color: C.hint, textAlign: 'center', marginTop: 16 }}>
        Marranito v1.0 · Datos guardados localmente
      </p>

      <div style={{ height: 20 }} />

      {confirmando && (
        <ConfirmDialog
          mensaje="Se borrarán todos tus datos: ingresos, compromisos, gastos, deudas y reservas. Esta acción no se puede deshacer."
          onConfirm={handleReset}
          onCancel={() => setConfirmando(false)}
        />
      )}
    </div>
  )
}
