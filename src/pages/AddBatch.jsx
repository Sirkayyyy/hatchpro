import React, { useState } from 'react'
import { toast } from 'react-toastify'
import dayjs from 'dayjs'
import { useApp } from '../context/AppContext'
import { genId } from '../utils/storage'
import { PageTitle, Alert, Field, ProgressBar } from '../components/UI'

const BIRD_TYPES = ['Broiler', 'Layer', 'Cockerel', 'Turkey', 'Duck']

const empty = () => ({
  batchNum: '',
  farmName: '',
  birdType: 'Broiler',
  eggs: '',
  chicksExpected: '',
  dateLoaded: dayjs().format('YYYY-MM-DD'),
  expectedHatch: '',
  remarks: '',
})

export default function AddBatch() {
  const { batches, setBatches, available, occupied, capacity } = useApp()
  const [form, setForm] = useState(empty())
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const upd = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = () => {
    setError('')
    setSuccess('')

    if (!form.batchNum || !form.farmName || !form.eggs || !form.dateLoaded) {
      setError('Please fill in all required fields.')
      return
    }

    const eggs = parseInt(form.eggs)
    if (isNaN(eggs) || eggs < 1) {
      setError('Enter a valid number of eggs.')
      return
    }

    if (occupied + eggs > capacity) {
      setError(`Not enough available capacity. Only ${available.toLocaleString()} egg slots available.`)
      return
    }

    if (batches.find((b) => b.batchNum.trim().toLowerCase() === form.batchNum.trim().toLowerCase())) {
      setError('Batch number already exists. Use a unique batch number.')
      return
    }

    const batch = {
      id: genId(),
      batchNum: form.batchNum.trim(),
      farmName: form.farmName.trim(),
      birdType: form.birdType,
      eggs,
      chicksExpected: parseInt(form.chicksExpected) || 0,
      dateLoaded: form.dateLoaded,
      expectedHatch: form.expectedHatch,
      remarks: form.remarks.trim(),
      stage: 'incubation',
      createdAt: new Date().toISOString(),
    }

    setBatches((b) => [...b, batch])
    toast.success(`Batch ${batch.batchNum} added — ${eggs.toLocaleString()} eggs registered!`)
    setSuccess(`Batch ${batch.batchNum} has been registered with ${eggs.toLocaleString()} eggs and is now in incubation.`)
    setForm(empty())
  }

  const utilPct = capacity > 0 ? Math.round((occupied / capacity) * 100) : 0

  return (
    <div>
      <PageTitle title="Add New Batch" subtitle="Register a new egg batch for incubation" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>
        {/* Form */}
        <div className="card">
          {error && <Alert type="danger">{error}</Alert>}
          {success && <Alert type="success">{success}</Alert>}

          <div className="grid-2">
            <Field label="Batch Number" required>
              <input className="input" placeholder="e.g. B001" value={form.batchNum} onChange={upd('batchNum')} />
            </Field>

            <Field label="Farm Name" required>
              <input className="input" placeholder="Farm or supplier name" value={form.farmName} onChange={upd('farmName')} />
            </Field>

            <Field label="Bird Type" required>
              <select className="input select" value={form.birdType} onChange={upd('birdType')}>
                {BIRD_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>

            <Field label="Number of Eggs" required hint={`${available.toLocaleString()} egg slots currently available`}>
              <input
                className="input"
                type="number"
                min={1}
                max={available}
                placeholder="Total eggs in this batch"
                value={form.eggs}
                onChange={upd('eggs')}
              />
            </Field>

            <Field label="Chicks Expected" hint="Estimated number of chicks to hatch">
              <input
                className="input"
                type="number"
                min={0}
                placeholder="Expected chick count"
                value={form.chicksExpected}
                onChange={upd('chicksExpected')}
              />
            </Field>

            <Field label="Date Loaded" required>
              <input className="input" type="date" value={form.dateLoaded} onChange={upd('dateLoaded')} />
            </Field>

            <Field label="Expected Hatch Date">
              <input className="input" type="date" value={form.expectedHatch} onChange={upd('expectedHatch')} />
            </Field>

            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="Remarks">
                <textarea
                  className="input"
                  rows={3}
                  placeholder="Optional notes about this batch..."
                  value={form.remarks}
                  onChange={upd('remarks')}
                />
              </Field>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button className="btn btn-primary" onClick={submit}>➕ Add Batch</button>
            <button className="btn btn-secondary" onClick={() => { setForm(empty()); setError(''); setSuccess('') }}>
              Clear
            </button>
          </div>
        </div>

        {/* Sidebar info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>🥚 Egg Capacity Status</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
              {[
                ['Total',     capacity,  'var(--green)'],
                ['Occupied',  occupied,  'var(--amber)'],
                ['Available', available, 'var(--blue)'],
              ].map(([l, v, c]) => (
                <div key={l} style={{ background: 'var(--bg)', borderRadius: 8, padding: 10, textAlign: 'center' }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: c, fontFamily: 'Space Grotesk' }}>
                    {v.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 9, color: 'var(--text2)', marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </div>
            <ProgressBar value={occupied} max={capacity} />
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 6, textAlign: 'center' }}>
              {utilPct}% of egg capacity used
            </div>
          </div>

          <div className="card">
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Bird Types in System</div>
            {BIRD_TYPES.map((t) => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 0' }}>
                <span className={`tag tag-${t.toLowerCase()}`}>{t}</span>
                <span style={{ fontSize: 11, color: 'var(--text2)' }}>
                  {batches.filter((b) => b.birdType === t).length} batch{batches.filter((b) => b.birdType === t).length !== 1 ? 'es' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
