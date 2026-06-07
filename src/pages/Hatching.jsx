import React, { useState } from 'react'
import { toast } from 'react-toastify'
import dayjs from 'dayjs'
import { useApp } from '../context/AppContext'
import { PageTitle, BirdTag, Modal, Alert, Field, ProgressBar, EmptyState } from '../components/UI'

function HatchingModal({ batch, onClose }) {
  const { setBatches } = useApp()
  const [form, setForm] = useState({
    chicks: '',
    hatchDate: dayjs().format('YYYY-MM-DD'),
  })
  const upd = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const chicks = parseInt(form.chicks) || 0
  const base = batch.fertileEggs || batch.eggs || 1
  const hatchRate = Math.round((chicks / base) * 100)

  const complete = () => {
    if (!form.chicks) { toast.error('Please enter the number of chicks hatched'); return }
    setBatches((b) =>
      b.map((x) =>
        x.id === batch.id
          ? {
              ...x,
              stage: 'completed',
              chicksHatched: chicks,
              hatchRate,
              hatchDate: form.hatchDate,
              completedAt: new Date().toISOString(),
            }
          : x
      )
    )
    toast.success(`Batch ${batch.batchNum} completed! Hatch rate: ${hatchRate}%`)
    onClose()
  }

  return (
    <Modal
      title={`Complete Hatching — ${batch.batchNum}`}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={complete}>✅ Mark as Completed</button>
        </>
      }
    >
      <Alert type="info">
        Fertile eggs in this batch: <strong>{(batch.fertileEggs || batch.eggs || 0).toLocaleString()}</strong>
      </Alert>

      <Field label="Chicks Hatched" required hint="Total number of chicks successfully hatched">
        <input
          className="input"
          type="number"
          min={0}
          placeholder="Enter count..."
          value={form.chicks}
          onChange={upd('chicks')}
        />
      </Field>

      <Field label="Hatch Date" required>
        <input className="input" type="date" value={form.hatchDate} onChange={upd('hatchDate')} />
      </Field>

      {form.chicks && (
        <div style={{ background: 'var(--green-light)', borderRadius: 10, padding: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600, marginBottom: 4 }}>Calculated Hatch Rate</div>
          <div style={{
            fontSize: 40, fontWeight: 800, fontFamily: 'Space Grotesk',
            color: hatchRate >= 80 ? 'var(--green)' : hatchRate >= 60 ? 'var(--warning)' : 'var(--danger)',
          }}>
            {hatchRate}%
          </div>
          <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 4 }}>
            {chicks.toLocaleString()} chicks from {(batch.fertileEggs || batch.eggs || 0).toLocaleString()} fertile eggs
          </div>
        </div>
      )}
    </Modal>
  )
}

export default function Hatching() {
  const { batches } = useApp()
  const [selected, setSelected] = useState(null)
  const hatching = batches.filter((b) => b.stage === 'hatching')

  return (
    <div>
      {selected && <HatchingModal batch={selected} onClose={() => setSelected(null)} />}

      <PageTitle
        title="Hatching"
        subtitle={`${hatching.length} batch${hatching.length !== 1 ? 'es' : ''} in hatching stage`}
      />

      {hatching.length === 0 ? (
        <div className="card">
          <EmptyState icon="🐣" title="No batches in hatching stage" subtitle="Batches will appear here once candling is complete" />
        </div>
      ) : (
        <div className="grid-3">
          {hatching.map((b) => (
            <div key={b.id} className="card" style={{ borderTop: '3px solid var(--purple)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{b.batchNum}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)' }}>{b.farmName}</div>
                </div>
                <BirdTag type={b.birdType} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                {[
                  ['📦', `${b.crates} Crates`],
                  ['🥚', `${(b.eggs || 0).toLocaleString()} Total Eggs`],
                  ['✅', `${(b.fertileEggs || 0).toLocaleString()} Fertile`],
                  ['❌', `${(b.rejectedEggs || 0).toLocaleString()} Rejected`],
                ].map(([icon, val]) => (
                  <div key={val} style={{ background: 'var(--bg)', borderRadius: 6, padding: '6px 10px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>{icon}</span>
                    <span style={{ fontWeight: 600 }}>{val}</span>
                  </div>
                ))}
              </div>

              {b.fertilityRate !== undefined && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 11, color: 'var(--text2)' }}>Fertility Rate</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--green)' }}>{b.fertilityRate}%</span>
                  </div>
                  <ProgressBar value={b.fertilityRate} max={100} color="var(--green)" />
                </div>
              )}

              {b.candlingDate && (
                <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 12 }}>
                  🔦 Candled on: <strong>{b.candlingDate}</strong>
                </div>
              )}

              <div style={{ background: 'var(--purple-light)', borderRadius: 8, padding: '8px 12px', marginBottom: 12, fontSize: 12, color: 'var(--purple)', fontWeight: 500 }}>
                🐣 Eggs are hatching — record results when complete
              </div>

              <button
                className="btn btn-primary btn-full"
                onClick={() => setSelected(b)}
              >
                ✅ Record Hatching Result
              </button>

              {b.remarks && (
                <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text2)', fontStyle: 'italic', borderTop: '1px solid var(--border)', paddingTop: 8 }}>
                  📝 {b.remarks}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
