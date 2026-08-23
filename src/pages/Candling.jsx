import React, { useState } from 'react'
import { toast } from 'react-toastify'
import dayjs from 'dayjs'
import { useApp } from '../context/AppContext'
import { PageTitle, BirdTag, Modal, Alert, Field, EmptyState } from '../components/UI'

function CandlingModal({ batch, onClose }) {
  const { setBatches } = useApp()
  const [form, setForm] = useState({
    fertile: '',
    rejected: '',
    candlingDate: dayjs().format('YYYY-MM-DD'),
  })

  const upd = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const fertile = parseInt(form.fertile) || 0
  const fertilityRate = batch.eggs > 0 ? Math.round((fertile / batch.eggs) * 100) : 0

  const save = () => {
    if (!form.fertile) { toast.error('Please enter the number of fertile eggs'); return }
    if (fertile > batch.eggs) { toast.error('Fertile eggs cannot exceed total eggs'); return }

    setBatches((b) =>
      b.map((x) =>
        x.id === batch.id
          ? {
              ...x,
              stage: 'hatching',
              fertileEggs: fertile,
              rejectedEggs: parseInt(form.rejected) || 0,
              fertilityRate,
              candlingDate: form.candlingDate,
            }
          : x
      )
    )
    toast.success(`Candling recorded — ${fertilityRate}% fertility. Moved to Hatching.`)
    onClose()
  }

  return (
    <Modal
      title={`Candling Record — ${batch.batchNum}`}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            style={{ background: 'var(--amber)', color: '#1F2937' }}
            onClick={save}
          >
            🐣 Move to Hatching
          </button>
        </>
      }
    >
      <Alert type="info">
        Total eggs in this batch: <strong>{(batch.eggs || 0).toLocaleString()}</strong>
        {batch.chicksExpected > 0 && (
          <span> · Chicks expected: <strong>{(batch.chicksExpected || 0).toLocaleString()}</strong></span>
        )}
      </Alert>

      <Field label="Fertile Eggs" required hint="Number of eggs confirmed viable during candling">
        <input
          className="input"
          type="number"
          min={0}
          max={batch.eggs}
          placeholder="Enter count..."
          value={form.fertile}
          onChange={upd('fertile')}
        />
      </Field>

      <Field label="Rejected / Infertile Eggs">
        <input
          className="input"
          type="number"
          min={0}
          placeholder="Enter count..."
          value={form.rejected}
          onChange={upd('rejected')}
        />
      </Field>

      <Field label="Candling Date" required>
        <input className="input" type="date" value={form.candlingDate} onChange={upd('candlingDate')} />
      </Field>

      {form.fertile && (
        <div style={{ background: 'var(--green-light)', borderRadius: 10, padding: 16, marginTop: 4, textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600, marginBottom: 4 }}>Calculated Fertility Rate</div>
          <div style={{
            fontSize: 40, fontWeight: 800, fontFamily: 'Space Grotesk',
            color: fertilityRate >= 80 ? 'var(--green)' : fertilityRate >= 60 ? 'var(--warning)' : 'var(--danger)',
          }}>
            {fertilityRate}%
          </div>
          <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 4 }}>
            {fertile.toLocaleString()} fertile out of {(batch.eggs || 0).toLocaleString()} total eggs
          </div>
        </div>
      )}
    </Modal>
  )
}

export default function Candling() {
  const { batches } = useApp()
  const [selected, setSelected] = useState(null)
  const candling = batches.filter((b) => b.stage === 'candling')

  return (
    <div>
      {selected && <CandlingModal batch={selected} onClose={() => setSelected(null)} />}

      <PageTitle
        title="Candling"
        subtitle={`${candling.length} batch${candling.length !== 1 ? 'es' : ''} awaiting candling`}
      />

      {candling.length === 0 ? (
        <div className="card">
          <EmptyState icon="🔦" title="No batches in candling stage" subtitle="Batches will appear here once moved from Incubation" />
        </div>
      ) : (
        <div className="grid-3">
          {candling.map((b) => (
            <div key={b.id} className="card" style={{ borderTop: '3px solid var(--amber)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{b.batchNum}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)' }}>{b.farmName}</div>
                </div>
                <BirdTag type={b.birdType} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                {[
                  ['🥚', `${(b.eggs || 0).toLocaleString()} Eggs`],
                  ['🐣', `${(b.chicksExpected || 0).toLocaleString()} Chicks Exp.`],
                  ['📅', `Loaded: ${b.dateLoaded || '—'}`],
                  ['🎯', b.expectedHatch ? `Hatch: ${b.expectedHatch}` : 'No hatch date'],
                ].map(([icon, val]) => (
                  <div key={val} style={{ background: 'var(--bg)', borderRadius: 6, padding: '6px 10px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>{icon}</span>
                    <span style={{ fontWeight: 600 }}>{val}</span>
                  </div>
                ))}
              </div>

              <div style={{ background: 'var(--amber-light)', borderRadius: 8, padding: '8px 12px', marginBottom: 12, fontSize: 12, color: '#E65100', fontWeight: 500 }}>
                🔦 Ready for candling inspection
              </div>

              <button
                className="btn btn-full"
                style={{ background: 'var(--amber)', color: '#1F2937', fontWeight: 700, justifyContent: 'center', padding: '9px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
                onClick={() => setSelected(b)}
              >
                🔦 Record Candling Result
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
