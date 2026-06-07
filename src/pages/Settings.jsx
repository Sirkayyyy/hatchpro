import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { useApp } from '../context/AppContext'
import { LS, KEYS } from '../utils/storage'
import { PageTitle, Alert } from '../components/UI'

export default function Settings() {
  const { settings, setSettings, batches } = useApp()
  const [form, setForm] = useState({ ...settings })
  const [importError, setImportError] = useState('')

  const upd = (k) => (e) => setForm((f) => ({ ...f, [k]: Number(e.target.value) }))

  const save = () => {
    if (form.capacity < 1) { toast.error('Capacity must be at least 1'); return }
    if (form.incubationDays < 1) { toast.error('Incubation days must be at least 1'); return }
    if (form.candlingDay < 1) { toast.error('Candling day must be at least 1'); return }
    setSettings(form)
    toast.success('Settings saved successfully')
  }

  const exportData = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
      batches: LS.get(KEYS.BATCHES, []),
      settings: LS.get(KEYS.SETTINGS, {}),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const date = new Date().toISOString().slice(0, 10)
    a.href = url
    a.download = `hatchpro-backup-${date}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Data exported successfully')
  }

  const importData = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImportError('')
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result)
        if (!parsed.batches || !Array.isArray(parsed.batches)) {
          setImportError('Invalid backup file format.')
          return
        }
        LS.set(KEYS.BATCHES, parsed.batches)
        if (parsed.settings) LS.set(KEYS.SETTINGS, parsed.settings)
        toast.success('Data imported — please refresh the page.')
      } catch {
        setImportError('Could not parse the backup file. Make sure it is a valid HatchPro JSON backup.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const clearAllData = () => {
    if (!window.confirm('⚠️ This will permanently delete ALL batches and reset settings. Are you absolutely sure?')) return
    LS.remove(KEYS.BATCHES)
    LS.remove(KEYS.SETTINGS)
    toast.success('All data cleared — please refresh the page.')
  }

  const occupied = batches.filter((b) => b.stage !== 'completed').reduce((s, b) => s + b.crates, 0)

  return (
    <div>
      <PageTitle title="Settings" subtitle="Configure hatchery parameters and manage data" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
        {/* Hatchery config */}
        <div className="card">
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>🏭 Hatchery Configuration</div>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 20 }}>
            These values affect capacity tracking and progress calculations.
          </div>

          <div className="input-group">
            <label className="input-label">
              Maximum Crate Capacity
              <span style={{ marginLeft: 8, fontSize: 10, background: '#E3F2FD', color: '#1565C0', padding: '2px 7px', borderRadius: 10, fontWeight: 600 }}>
                {occupied} currently occupied
              </span>
            </label>
            <input className="input" type="number" min={1} max={500} value={form.capacity} onChange={upd('capacity')} />
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>Default: 36 crates</div>
          </div>

          <div className="input-group">
            <label className="input-label">Incubation Duration (days)</label>
            <input className="input" type="number" min={1} max={90} value={form.incubationDays} onChange={upd('incubationDays')} />
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>Default: 21 days — used for progress bar on Incubation page</div>
          </div>

          <div className="input-group">
            <label className="input-label">Candling Day</label>
            <input className="input" type="number" min={1} max={30} value={form.candlingDay} onChange={upd('candlingDay')} />
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>Default: Day 7 — recommended day to perform candling</div>
          </div>

          <button className="btn btn-primary" onClick={save}>💾 Save Settings</button>
        </div>

        {/* Data management */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>💾 Data Management</div>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 16, lineHeight: 1.6 }}>
              All data is stored locally in your browser's localStorage. Export regularly to avoid data loss.
            </div>

            {/* Stats */}
            <div style={{ background: 'var(--bg)', borderRadius: 8, padding: 12, marginBottom: 16 }}>
              {[
                ['Total batches stored', batches.length],
                ['Active batches', batches.filter((b) => b.stage !== 'completed').length],
                ['Completed batches', batches.filter((b) => b.stage === 'completed').length],
                ['Storage key', KEYS.BATCHES],
              ].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 12 }}>
                  <span style={{ color: 'var(--text2)' }}>{l}</span>
                  <span style={{ fontWeight: 600, fontFamily: typeof v === 'number' ? 'Space Grotesk' : 'monospace', fontSize: typeof v === 'string' && v.startsWith('hatch') ? 11 : 12 }}>{v}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button className="btn btn-secondary" onClick={exportData} style={{ justifyContent: 'center' }}>
                📤 Export Backup (JSON)
              </button>

              <label style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                cursor: 'pointer', background: '#fff', border: '1px solid var(--border)',
                color: 'var(--text)', transition: 'all 0.15s',
              }}>
                📥 Import Backup (JSON)
                <input type="file" accept=".json" onChange={importData} style={{ display: 'none' }} />
              </label>

              {importError && <Alert type="danger">{importError}</Alert>}
            </div>
          </div>

          <div className="card" style={{ border: '1px solid #FFCDD2' }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, color: 'var(--danger)' }}>⚠️ Danger Zone</div>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 14, lineHeight: 1.6 }}>
              Permanently delete all batches and reset settings. This cannot be undone.
            </div>
            <button className="btn btn-danger" onClick={clearAllData}>
              🗑️ Clear All Data
            </button>
          </div>

          <div className="card">
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>ℹ️ About HatchPro</div>
            <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.8 }}>
              <div><strong>Version:</strong> 1.0.0</div>
              <div><strong>Storage:</strong> Browser localStorage (no server)</div>
              <div><strong>Max Capacity:</strong> {form.capacity} crates</div>
              <div><strong>Incubation:</strong> {form.incubationDays} days</div>
              <div><strong>Candling Day:</strong> Day {form.candlingDay}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
