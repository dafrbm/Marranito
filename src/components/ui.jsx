// ---- Design tokens ----
export const C = {
  bg: '#1A1A1A',
  surface: '#242424',
  surfaceHi: '#2E2E2E',
  surfaceHover: '#333333',
  border: '#363636',
  borderHi: '#444444',
  text: '#F0EDE8',
  muted: '#9A9590',
  hint: '#5A5550',
  accent: '#F5A623',      // naranja alcancía
  accentDim: '#3A2800',
  accentText: '#FFC85A',
  green: '#34D399',
  greenDim: '#0D2E20',
  red: '#F87171',
  redDim: '#2E0D0D',
  amber: '#FBBF24',
  amberDim: '#2E2000',
  blue: '#60A5FA',
  blueDim: '#0D1E3A',
  purple: '#A78BFA',
  purpleDim: '#1E0D3A',
}

export const fmt = (n) => {
  if (n === undefined || n === null) return '—'
  const abs = Math.abs(Math.round(n))
  return (n < 0 ? '-' : '') + '$' + abs.toLocaleString('es-CO')
}

export const fmtK = (n) => {
  if (!n) return '—'
  if (Math.abs(n) >= 1000000) return (n < 0 ? '-' : '') + '$' + (Math.abs(n) / 1000000).toFixed(1) + 'M'
  if (Math.abs(n) >= 1000) return (n < 0 ? '-' : '') + '$' + (Math.abs(n) / 1000).toFixed(0) + 'K'
  return fmt(n)
}

export const pct = (a, b) => b === 0 ? 0 : Math.min(100, Math.max(0, Math.round((a / b) * 100)))

// ---- Shared components ----
export function Card({ children, style: s = {}, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 16, padding: '14px 16px', marginBottom: 10,
      cursor: onClick ? 'pointer' : 'default',
      transition: 'background 0.15s',
      ...s
    }}>
      {children}
    </div>
  )
}

export function SectionLabel({ children, action }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, marginTop: 4 }}>
      <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.muted }}>{children}</p>
      {action}
    </div>
  )
}

export function Tag({ children, color = C.accent, small }) {
  return (
    <span style={{
      fontSize: small ? 9 : 10, fontWeight: 700, padding: small ? '1px 6px' : '2px 8px',
      borderRadius: 20, background: color + '22', color, letterSpacing: '0.04em',
      display: 'inline-flex', alignItems: 'center', gap: 3,
    }}>
      {children}
    </span>
  )
}

export function Bar({ value, total, color = C.accent, height = 5 }) {
  return (
    <div style={{ background: C.border, borderRadius: 99, height, overflow: 'hidden' }}>
      <div style={{ width: `${pct(value, total)}%`, height: '100%', background: color, borderRadius: 99, transition: 'width 0.4s ease' }} />
    </div>
  )
}

export function Metric({ label, value, color = C.text, sub, small }) {
  return (
    <div style={{ background: C.surfaceHi, borderRadius: 12, padding: small ? '10px 12px' : '12px 14px' }}>
      <p style={{ fontSize: 11, color: C.muted, marginBottom: 3 }}>{label}</p>
      <p style={{ fontSize: small ? 17 : 20, fontWeight: 700, color, fontVariantNumeric: 'tabular-nums', fontFamily: "'Nunito', sans-serif" }}>{value}</p>
      {sub && <p style={{ fontSize: 10, color: C.hint, marginTop: 2 }}>{sub}</p>}
    </div>
  )
}

export function Btn({ children, onClick, variant = 'secondary', style: s = {}, disabled }) {
  const variants = {
    primary: { background: C.accent, color: '#1A1A1A', border: 'none', fontWeight: 700 },
    secondary: { background: C.surfaceHi, color: C.text, border: `1px solid ${C.border}`, fontWeight: 500 },
    ghost: { background: 'none', color: C.muted, border: `1px solid ${C.border}`, fontWeight: 400 },
    danger: { background: C.redDim, color: C.red, border: `1px solid ${C.red}33`, fontWeight: 600 },
  }
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: '10px 16px', borderRadius: 10, fontSize: 13, cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1, transition: 'opacity 0.15s', ...variants[variant], ...s
    }}>
      {children}
    </button>
  )
}

export function Input({ label, value, onChange, type = 'text', placeholder, suffix, hint }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <p style={{ fontSize: 12, color: C.muted, marginBottom: 5 }}>{label}</p>}
      <div style={{ display: 'flex', alignItems: 'center', background: C.surfaceHi, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden' }}>
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          style={{ flex: 1, background: 'none', border: 'none', padding: '10px 12px', fontSize: 14, color: C.text, outline: 'none', fontFamily: "'DM Sans', sans-serif" }} />
        {suffix && <span style={{ fontSize: 12, color: C.muted, paddingRight: 12 }}>{suffix}</span>}
      </div>
      {hint && <p style={{ fontSize: 11, color: C.hint, marginTop: 4 }}>{hint}</p>}
    </div>
  )
}

export function Select({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <p style={{ fontSize: 12, color: C.muted, marginBottom: 5 }}>{label}</p>}
      <select value={value} onChange={e => onChange(e.target.value)} style={{
        width: '100%', background: C.surfaceHi, border: `1px solid ${C.border}`, borderRadius: 10,
        padding: '10px 12px', fontSize: 14, color: C.text, outline: 'none', fontFamily: "'DM Sans', sans-serif",
        appearance: 'none',
      }}>
        <option value="">Seleccionar...</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

export function BottomSheet({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'flex-end', zIndex: 200 }}
      onClick={onClose}>
      <div style={{ background: C.surface, borderRadius: '20px 20px 0 0', padding: '0 0 32px', width: '100%', border: `1px solid ${C.border}`, maxHeight: '90vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px 12px', borderBottom: `1px solid ${C.border}` }}>
          <p style={{ fontSize: 16, fontWeight: 700, color: C.text, fontFamily: "'Nunito', sans-serif" }}>{title}</p>
          <button onClick={onClose} style={{ background: C.surfaceHi, border: 'none', color: C.muted, fontSize: 18, width: 30, height: 30, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>
        <div style={{ padding: '16px 20px' }}>{children}</div>
      </div>
    </div>
  )
}

export function Row({ label, value, color, sub, border = true, onClick }) {
  return (
    <div onClick={onClick} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: border ? `1px solid ${C.border}` : 'none', cursor: onClick ? 'pointer' : 'default' }}>
      <div>
        <p style={{ fontSize: 13, color: C.text }}>{label}</p>
        {sub && <p style={{ fontSize: 11, color: C.hint, marginTop: 1 }}>{sub}</p>}
      </div>
      <p style={{ fontSize: 13, fontWeight: 600, color: color || C.text, fontVariantNumeric: 'tabular-nums' }}>{value}</p>
    </div>
  )
}

export function EmptyState({ icon, title, desc, action }) {
  return (
    <div style={{ textAlign: 'center', padding: '32px 16px' }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>{icon}</div>
      <p style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 6 }}>{title}</p>
      <p style={{ fontSize: 13, color: C.muted, marginBottom: 20, lineHeight: 1.6 }}>{desc}</p>
      {action}
    </div>
  )
}
