import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const MES_ACTUAL = new Date().toLocaleString('es-CO', { month: 'long' }).replace(/^\w/, c => c.toUpperCase())
const AÑO_ACTUAL = new Date().getFullYear()

const uid = () => Math.random().toString(36).slice(2, 9)

const COLORES = ['#F5A623', '#E8485A', '#4ECDC4', '#A78BFA', '#34D399', '#60A5FA', '#F472B6', '#FB923C']
let colorIdx = 0
const randomColor = () => COLORES[colorIdx++ % COLORES.length]

export const TIPOS_INGRESO = {
  empleado:     { label: 'Empleado',     campos: ['salario', 'fechaFin', 'renovable'] },
  independiente:{ label: 'Independiente',campos: ['monto', 'periodicidad', 'probabilidad', 'fechaFin'] },
  mixto:        { label: 'Mixto',        campos: [] },
}

export const ESTRATEGIAS_DEUDA = {
  avalanche: { label: 'Avalanche', desc: 'Paga primero la de mayor tasa. Ahorra más en intereses.' },
  snowball:  { label: 'Snowball',  desc: 'Paga primero la de menor saldo. Genera motivación rápida.' },
}

export const TIPOS_COMPROMISO = {
  tarjeta:    { label: 'Tarjeta de crédito',  icon: '💳' },
  prestamo:   { label: 'Préstamo',            icon: '🏦' },
  libranza:   { label: 'Libranza',            icon: '📋' },
  informal:   { label: 'Deuda informal',      icon: '🤝' },
  arriendo:   { label: 'Arriendo',            icon: '🏠' },
  servicio:   { label: 'Servicio',            icon: '💡' },
  suscripcion:{ label: 'Suscripción',         icon: '📱' },
  ahorro:     { label: 'Ahorro / inversión',  icon: '🐷' },
  otro:       { label: 'Otro',                icon: '📌' },
}

export const TIPOS_TASA = {
  usura: { label: 'Tasa usura',          color: '#EF4444' },
  alta:  { label: 'Alta (>2% mensual)',  color: '#F97316' },
  media: { label: 'Media (1-2% mensual)',color: '#EAB308' },
  baja:  { label: 'Baja (<1% mensual)', color: '#22C55E' },
  cero:  { label: '0% interés',          color: '#6366F1' },
}

const initialState = {
  onboardingDone: false,
  perfil: {
    nombre: '',
    situacion: null,
    moneda: 'COP',
  },

  fuentes: [],
  compromisos: [],
  categorias: [],
  gastos: {},

  escenarios: [
    { id: 'pesimista', nombre: 'Pesimista', desc: 'Sin ningún ingreso',                    multiplicador: 0,    activo: true },
    { id: 'probable',  nombre: 'Probable',  desc: 'Solo ingresos con >50% de renovación',  multiplicador: null, activo: true },
    { id: 'optimista', nombre: 'Optimista', desc: 'Todos los ingresos se renuevan',         multiplicador: 1,    activo: true },
  ],

  reservas: [],

  mesActivo: MES_ACTUAL,
  añoActivo: AÑO_ACTUAL,
  tab: 'resumen',
  estrategiaDeuda: 'avalanche',
}

export const useStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      // --- onboarding ---
      completarOnboarding: (perfil) => set({ perfil, onboardingDone: true }),
      setSituacion: (situacion) => set(s => ({ perfil: { ...s.perfil, situacion } })),

      // --- fuentes de ingreso ---
      addFuente:    (fuente) => set(s => ({ fuentes: [...s.fuentes, { id: uid(), activo: true, ...fuente }] })),
      updateFuente: (id, data) => set(s => ({ fuentes: s.fuentes.map(f => f.id === id ? { ...f, ...data } : f) })),
      deleteFuente: (id) => set(s => ({ fuentes: s.fuentes.filter(f => f.id !== id) })),

      // --- compromisos ---
      addCompromiso:    (c) => set(s => ({ compromisos: [...s.compromisos, { id: uid(), activo: true, saldoInicial: c.saldo, color: randomColor(), ...c }] })),
      updateCompromiso: (id, data) => set(s => ({ compromisos: s.compromisos.map(c => c.id === id ? { ...c, ...data } : c) })),
      deleteCompromiso: (id) => set(s => ({ compromisos: s.compromisos.filter(c => c.id !== id) })),

      // --- categorias ---
      addCategoria:    (cat) => set(s => ({ categorias: [...s.categorias, { id: uid(), ...cat }] })),
      updateCategoria: (id, data) => set(s => ({ categorias: s.categorias.map(c => c.id === id ? { ...c, ...data } : c) })),
      deleteCategoria: (id) => set(s => ({ categorias: s.categorias.filter(c => c.id !== id) })),

      // --- gastos ---
      setGasto: (mes, año, catId, monto) => set(s => {
        const key = `${mes}-${año}`
        return { gastos: { ...s.gastos, [key]: { ...(s.gastos[key] || {}), [catId]: monto } } }
      }),

      // --- escenarios ---
      addEscenario:    (e) => set(s => ({ escenarios: [...s.escenarios, { id: uid(), activo: true, ...e }] })),
      updateEscenario: (id, data) => set(s => ({ escenarios: s.escenarios.map(e => e.id === id ? { ...e, ...data } : e) })),
      deleteEscenario: (id) => set(s => ({ escenarios: s.escenarios.filter(e => e.id !== id) })),

      // --- reservas ---
      addReserva:    (r) => set(s => ({ reservas: [...s.reservas, { id: uid(), ...r }] })),
      updateReserva: (id, data) => set(s => ({ reservas: s.reservas.map(r => r.id === id ? { ...r, ...data } : r) })),
      deleteReserva: (id) => set(s => ({ reservas: s.reservas.filter(r => r.id !== id) })),

      // --- ui ---
      setTab: (tab) => set({ tab }),
      setMes: (mes, año) => set({ mesActivo: mes, añoActivo: año }),
      setEstrategia: (e) => set({ estrategiaDeuda: e }),

      // --- reset ---
      resetStore: () => set({ ...initialState, mesActivo: MES_ACTUAL, añoActivo: AÑO_ACTUAL }),

      // --- computed ---
      getIngresoMensual: () => {
        const { fuentes } = get()
        return fuentes.filter(f => f.activo).reduce((s, f) => {
          const base = f.periodicidad === 'quincenal' ? f.monto * 2
            : f.periodicidad === 'semanal' ? f.monto * 4
            : f.monto
          return s + base
        }, 0)
      },

      getGastosFijos: () => {
        const { compromisos } = get()
        return compromisos.filter(c => c.activo && ['arriendo', 'servicio', 'suscripcion'].includes(c.tipo))
          .reduce((s, c) => s + (c.cuota || c.monto || 0), 0)
      },

      getCuotasDeuda: () => {
        const { compromisos } = get()
        return compromisos.filter(c => c.activo && ['tarjeta', 'prestamo', 'libranza', 'informal'].includes(c.tipo) && c.saldo > 0)
          .reduce((s, c) => s + (c.cuota || 0), 0)
      },

      getAhorroMensual: () => {
        const { compromisos } = get()
        return compromisos.filter(c => c.activo && c.tipo === 'ahorro')
          .reduce((s, c) => s + (c.cuota || 0), 0)
      },

      getGastosDelMes: (mes, año) => {
        const { gastos } = get()
        return gastos[`${mes}-${año}`] || {}
      },

      getDeudas: () => {
        const { compromisos, estrategiaDeuda } = get()
        const deudas = compromisos.filter(c => c.activo && ['tarjeta', 'prestamo', 'libranza', 'informal'].includes(c.tipo) && c.saldo > 0)
        const orden = { usura: 0, alta: 1, media: 2, baja: 3, cero: 4 }
        if (estrategiaDeuda === 'avalanche') return [...deudas].sort((a, b) => (orden[a.tasaTipo] ?? 5) - (orden[b.tasaTipo] ?? 5))
        return [...deudas].sort((a, b) => a.saldo - b.saldo)
      },

      calcularRunway: (escenarioId) => {
        const { escenarios, fuentes, reservas, compromisos, categorias } = get()
        const esc = escenarios.find(e => e.id === escenarioId)
        if (!esc) return null

        let ingresoMensual = 0
        if (esc.multiplicador === 1) {
          ingresoMensual = fuentes.filter(f => f.activo).reduce((s, f) => s + (f.monto || 0), 0)
        } else if (esc.multiplicador === 0) {
          ingresoMensual = 0
        } else if (esc.multiplicador === null) {
          ingresoMensual = fuentes.filter(f => f.activo && (f.probabilidad || 0) > 50).reduce((s, f) => s + (f.monto || 0), 0)
        } else {
          ingresoMensual = fuentes.filter(f => f.activo).reduce((s, f) => s + (f.monto || 0), 0) * esc.multiplicador
        }

        const gastoFijo = compromisos.filter(c => c.activo && ['arriendo', 'servicio', 'suscripcion'].includes(c.tipo))
          .reduce((s, c) => s + (c.cuota || c.monto || 0), 0)
        const gastoCategoria = categorias.filter(c => c.esencial).reduce((s, c) => s + c.presupuesto, 0)
        const gastoTotal = gastoFijo + gastoCategoria
        const flujoMensual = ingresoMensual - gastoTotal
        const totalReservas = reservas.filter(r => r.disponible).reduce((s, r) => s + r.monto, 0)

        if (flujoMensual >= 0) return { meses: Infinity, flujo: flujoMensual, totalReservas }
        const meses = totalReservas / Math.abs(flujoMensual)
        return { meses, flujo: flujoMensual, totalReservas, gastoTotal, ingresoMensual }
      },

      calcularPlanDeudasConEstrategia: (estrategia) => {
        const { compromisos, getIngresoMensual, getGastosFijos, getAhorroMensual, categorias } = get()
        const orden = { usura: 0, alta: 1, media: 2, baja: 3, cero: 4 }
        const base = compromisos.filter(c => c.activo && ['tarjeta', 'prestamo', 'libranza', 'informal'].includes(c.tipo) && c.saldo > 0)
        const sorted = estrategia === 'avalanche'
          ? [...base].sort((a, b) => (orden[a.tasaTipo] ?? 5) - (orden[b.tasaTipo] ?? 5))
          : [...base].sort((a, b) => a.saldo - b.saldo)

        if (sorted.length === 0) return []

        const ingresoTotal = getIngresoMensual()
        const gastosFijos = getGastosFijos()
        const ahorro = getAhorroMensual()
        const gastosCat = categorias.reduce((s, c) => s + c.presupuesto, 0)
        const disponible = ingresoTotal - gastosFijos - ahorro - gastosCat

        if (disponible <= 0) return []

        const plan = []
        let saldos = sorted.map(d => ({ ...d }))
        let mes = 0

        while (saldos.some(d => d.saldo > 0) && mes < 60) {
          mes++
          let restante = disponible
          const acciones = []
          for (const d of saldos) {
            if (d.saldo <= 0) continue
            const pago = Math.min(d.saldo, restante)
            d.saldo = Math.max(0, d.saldo - pago)
            restante -= pago
            acciones.push({ id: d.id, nombre: d.nombre, pago, cierra: d.saldo === 0, color: d.color })
            if (restante <= 0) break
          }
          plan.push({ mes, acciones, saldoTotal: saldos.reduce((s, d) => s + d.saldo, 0), sobrante: restante })
        }

        return plan
      },

      calcularPlanDeudas: () => {
        const { getDeudas, getIngresoMensual, getGastosFijos, getAhorroMensual, categorias } = get()
        const deudas = getDeudas().map(d => ({ ...d }))
        if (deudas.length === 0) return []

        const disponible = getIngresoMensual() - getGastosFijos() - getAhorroMensual()
          - categorias.reduce((s, c) => s + c.presupuesto, 0)

        if (disponible <= 0) return []

        const plan = []
        let saldos = deudas.map(d => ({ ...d }))
        let mes = 0

        while (saldos.some(d => d.saldo > 0) && mes < 60) {
          mes++
          let restante = disponible
          const acciones = []
          for (const d of saldos) {
            if (d.saldo <= 0) continue
            const pago = Math.min(d.saldo, restante)
            d.saldo = Math.max(0, d.saldo - pago)
            restante -= pago
            acciones.push({ id: d.id, nombre: d.nombre, pago, cierra: d.saldo === 0, color: d.color })
            if (restante <= 0) break
          }
          plan.push({ mes, acciones, saldoTotal: saldos.reduce((s, d) => s + d.saldo, 0), sobrante: restante })
        }

        return plan
      },
    }),
    {
      name: 'marranito-storage',
      version: 1,
    }
  )
)
