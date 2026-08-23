import React from 'react'
import { MdClose, MdWarning, MdCheckCircle, MdInfo, MdError } from 'react-icons/md'

export function ConfirmDialog({ title, message, onConfirm, onCancel, danger = true }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 24, maxWidth: 360, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{title}</h3>
        <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 20, lineHeight: 1.6 }}>{message}</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>{danger ? '🗑️ Delete' : 'Confirm'}</button>
        </div>
      </div>
    </div>
  )
}

export function Modal({ title, children, footer, onClose, maxWidth = 520 }) {
  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth }}>
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text2)', display: 'flex' }}><MdClose size={20} /></button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
        {footer && <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>{footer}</div>}
      </div>
    </div>
  )
}

export function Alert({ type = 'info', children }) {
  const configs = { danger: { Icon: MdError, cls: 'alert-danger' }, success: { Icon: MdCheckCircle, cls: 'alert-success' }, warning: { Icon: MdWarning, cls: 'alert-warning' }, info: { Icon: MdInfo, cls: 'alert-info' } }
  const { Icon, cls } = configs[type] || configs.info
  return <div className={`alert ${cls}`}><Icon size={16} /><span>{children}</span></div>
}

export function StagePill({ stage }) {
  const labels = { incubation: '🥚 Incubation', candling: '🔦 Candling', hatching: '🐣 Hatching', completed: '✅ Completed' }
  return <span className={`stage-pill stage-${stage}`}>{labels[stage] || stage}</span>
}

export function BirdTag({ type }) {
  return <span className={`tag tag-${type?.toLowerCase()}`}>{type}</span>
}

export function ProgressBar({ value, max, color }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  const bg = color || (pct > 80 ? 'var(--danger)' : pct > 60 ? 'var(--warning)' : 'var(--green)')
  return <div className="progress-bar"><div className="progress-fill" style={{ width: `${pct}%`, background: bg }} /></div>
}

export function EmptyState({ icon, title, subtitle }) {
  return (
    <div className="empty-state">
      <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text2)', marginBottom: 4 }}>{title}</div>
      {subtitle && <div style={{ fontSize: 12, color: 'var(--text3)' }}>{subtitle}</div>}
    </div>
  )
}

export function StatCard({ label, value, icon, color = 'var(--green)', sub }) {
  return (
    <div className="stat-card">
      <div style={{ width: 36, height: 36, borderRadius: 8, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--text2)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'Space Grotesk', color, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

export function SectionHeader({ title, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{title}</div>
      {action}
    </div>
  )
}

export function PageTitle({ title, subtitle }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>{title}</h2>
      {subtitle && <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>{subtitle}</p>}
    </div>
  )
}

export function Field({ label, required, children, hint }) {
  return (
    <div className="input-group">
      <label className="input-label">{label}{required && <span style={{ color: 'var(--danger)', marginLeft: 2 }}>*</span>}</label>
      {children}
      {hint && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>{hint}</div>}
    </div>
  )
}
