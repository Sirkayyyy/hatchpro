import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { useApp } from '../context/AppContext'
import { PageTitle, StagePill, BirdTag, ConfirmDialog, Modal, Alert, Field, EmptyState } from '../components/UI'
import { MdEdit, MdDelete } from 'react-icons/md'

const BIRD_TYPES = ['Broiler', 'Layer', 'Cockerel', 'Turkey', 'Duck']

function EditModal({ batch, onClose }) {
  const { setBatches, available } = useApp()
  const [form, setForm] = useState({
    ...batch,
    eggs: String(batch.eggs),
    chicksExpected: String(batch.chicksExpected || ''),
  })
  const upd = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const save = () => {
    const eggs = parseInt(form.eggs) || 0
    const diff = eggs - batch.eggs
    if (batch.stage !== 'completed' && diff > available) {
      toast.error(`Not enough capacity. Only ${available.toLocaleString()} extra egg slots available.`)
      return
    }
    setBatches((b) => b.map((x) => x.id === batch.id
      ? { ...form, eggs, chicksExpected: parseInt(form.chicksExpected) || 0 }
      : x
    ))
    toast.success('Batch updated successfully')
    onClose()
  }

  return (
    <Modal
      title={`Edit Batch ${batch.batchNum}`}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={save}>💾 Save Changes</button>
        </>
      }
    >
      <div className="grid-2">
        <Field label="Batch Number" required>
          <input className="input" value={form.batchNum} onChange={upd('batchNum')} />
        </Field>
        <Field label="Farm Name" required>
          <input className="input" value={form.farmName} onChange={upd('farmName')} />
        </Field>
        <Field label="Bird Type">
          <select className="input select" value={form.birdType} onChange={upd('birdType')}>
            {BIRD_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Number of Eggs">
          <input className="input" type="number" min={1} value={form.eggs} onChange={upd('eggs')} />
        </Field>
        <Field label="Chicks Expected">
          <input className="input" type="number" min={0} value={form.chicksExpected} onChange={upd('chicksExpected')} />
        </Field>
        <Field label="Expected Hatch Date">
          <input className="input" type="date" value={form.expectedHatch || ''} onChange={upd('expectedHatch')} />
        </Field>
        <div style={{ gridColumn: '1 / -1' }}>
          <Field label="Remarks">
            <textarea className="input" rows={2} value={form.remarks || ''} onChange={upd('remarks')} />
          </Field>
        </div>
      </div>
    </Modal>
  )
}

export default function ActiveBatches() {
  const { batches, setBatches } = useApp()
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState('All')
  const [confirm, setConfirm] = useState(null)
  const [editBatch, setEditBatch] = useState(null)

  const filtered = batches.filter((b) => {
    const s = search.toLowerCase()
    const matchS = !s || b.batchNum.toLowerCase().includes(s) || b.farmName.toLowerCase().includes(s)
    const matchStage = stageFilter === 'All' || b.stage === stageFilter.toLowerCase()
    return matchS && matchStage
  })

  const deleteBatch = (id) => {
    setBatches((b) => b.filter((x) => x.id !== id))
    toast.success('Batch deleted')
    setConfirm(null)
  }

  return (
    <div>
      {confirm && (
        <ConfirmDialog
          title="Delete Batch"
          message="Are you sure you want to delete this batch? This action cannot be undone."
          onConfirm={() => deleteBatch(confirm)}
          onCancel={() => setConfirm(null)}
        />
      )}
      {editBatch && <EditModal batch={editBatch} onClose={() => setEditBatch(null)} />}

      <PageTitle
        title="Active Batches"
        subtitle={`${batches.length} total batch${batches.length !== 1 ? 'es' : ''} registered`}
      />

      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', fontSize: 14 }}>🔍</span>
          <input
            className="input"
            placeholder="Search by batch number or farm name..."
            style={{ paddingLeft: 34 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="input select" style={{ width: 140 }} value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}>
          {['All', 'Incubation', 'Candling', 'Hatching', 'Completed'].map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <EmptyState icon="📋" title="No batches found" subtitle="Try adjusting your search or add a new batch" />
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                {['Batch #', 'Farm', 'Bird Type', 'Eggs', 'Chicks Expected', 'Stage', 'Date Loaded', 'Exp. Hatch', 'Actions'].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id}>
                  <td><span style={{ fontWeight: 700 }}>{b.batchNum}</span></td>
                  <td>{b.farmName}</td>
                  <td><BirdTag type={b.birdType} /></td>
                  <td><strong>{(b.eggs || 0).toLocaleString()}</strong></td>
                  <td>{(b.chicksExpected || 0).toLocaleString()}</td>
                  <td><StagePill stage={b.stage} /></td>
                  <td>{b.dateLoaded || '—'}</td>
                  <td>{b.expectedHatch || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        title="Edit"
                        onClick={() => setEditBatch(b)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, color: 'var(--text2)', display: 'inline-flex' }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#F3F4F6'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                      >
                        <MdEdit size={16} />
                      </button>
                      <button
                        title="Delete"
                        onClick={() => setConfirm(b.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, color: 'var(--text3)', display: 'inline-flex' }}
                        onMouseOver={(e) => { e.currentTarget.style.background = '#FFEBEE'; e.currentTarget.style.color = 'var(--danger)' }}
                        onMouseOut={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text3)' }}
                      >
                        <MdDelete size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
