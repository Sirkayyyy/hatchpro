import React, { useState } from 'react'
import dayjs from 'dayjs'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { useApp } from '../context/AppContext'
import { PageTitle, SectionHeader, ProgressBar } from '../components/UI'

const LEGEND = [
  { label: 'Available',  cls: 'available',  color: '#C8E6C9' },
  { label: 'Incubation', cls: 'incubation', color: '#90CAF9' },
  { label: 'Candling',   cls: 'candling',   color: '#FFE082' },
  { label: 'Hatching',   cls: 'hatching',   color: '#CE93D8' },
]

export default function CapacityMonitor() {
  const { batches, capacity, occupied, available } = useApp()
  const [reqCrates, setReqCrates] = useState('')
  const [reqDate, setReqDate] = useState('')
  const [feasResult, setFeasResult] = useState(null)

  const active = batches.filter((b) => b.stage !== 'completed')

  // Build crate map: assign each active crate to a slot
  const crateMap = {}
  let slot = 1
  active.forEach((b) => {
    for (let i = 0; i < b.crates; i++) {
      if (slot <= capacity) {
        crateMap[slot] = { batch: b.batchNum, stage: b.stage }
        slot++
      }
    }
  })

  // 30-day forecast
  const forecast = Array.from({ length: 30 }, (_, i) => {
    const d = dayjs().add(i, 'day')
    const occ = batches
      .filter((b) => b.stage !== 'completed' && (!b.expectedHatch || dayjs(b.expectedHatch).isAfter(d)))
      .reduce((s, b) => s + b.crates, 0)
    return {
      date: d.format('MMM D'),
      available: Math.max(0, capacity - occ),
      occupied: Math.min(capacity, occ),
    }
  })

  // Capacity timeline: batches with expectedHatch dates
  const timeline = batches
    .filter((b) => b.stage !== 'completed' && b.expectedHatch)
    .sort((a, b) => new Date(a.expectedHatch) - new Date(b.expectedHatch))

  // Smart insights
  const utilPct = capacity > 0 ? Math.round((occupied / capacity) * 100) : 0
  const nextRelease = timeline[0]
  const highestFreeDay = forecast.reduce((best, d) => d.available > best.available ? d : best, forecast[0])

  // Feasibility check
  const checkFeasibility = () => {
    const crates = parseInt(reqCrates)
    if (!crates || crates < 1) { setFeasResult({ ok: false, reason: 'Enter a valid number of crates.' }); return }

    if (!reqDate) {
      // Check now
      if (available >= crates) {
        setFeasResult({ ok: true, msg: `✅ Accepted — ${available} crates currently available.` })
      } else {
        setFeasResult({ ok: false, reason: `Not enough capacity. Only ${available} crates available now.` })
      }
      return
    }

    const target = dayjs(reqDate)
    const dayIdx = target.diff(dayjs(), 'day')
    if (dayIdx < 0) { setFeasResult({ ok: false, reason: 'Date is in the past.' }); return }
    if (dayIdx >= forecast.length) { setFeasResult({ ok: true, msg: `✅ Likely accepted — no data beyond ${forecast.length} days, but capacity should free up.` }); return }

    const snap = forecast[dayIdx]
    if (snap.available >= crates) {
      setFeasResult({ ok: true, msg: `✅ Accepted — ${snap.available} crates projected available on ${target.format('MMM D, YYYY')}.` })
    } else {
      setFeasResult({ ok: false, reason: `Not enough capacity on ${target.format('MMM D, YYYY')}. Only ${snap.available} crates projected.` })
    }
  }

  return (
    <div>
      <PageTitle title="Capacity Monitor" subtitle="Visual crate map, forecasting, and feasibility checker" />

      {/* Top stats */}
      <div className="grid-3" style={{ marginBottom: 20 }}>
        {[
          ['Total Capacity', capacity, 'var(--green)', '🏭'],
          ['Occupied',       occupied, 'var(--amber)', '📦'],
          ['Available',      available, 'var(--blue)', '✨'],
        ].map(([l, v, c, ic]) => (
          <div key={l} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, padding: 18, borderLeft: `4px solid ${c}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text2)', marginBottom: 6 }}>{ic} {l}</div>
            <div style={{ fontSize: 32, fontWeight: 800, fontFamily: 'Space Grotesk', color: c }}>{v}</div>
            <div style={{ marginTop: 8 }}>
              <ProgressBar value={v} max={capacity} color={c} />
            </div>
          </div>
        ))}
      </div>

      {/* Crate map */}
      <div className="card" style={{ marginBottom: 20 }}>
        <SectionHeader
          title="Crate Map"
          action={
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {LEGEND.map(({ label, color }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text2)' }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: color, border: '1px solid rgba(0,0,0,0.1)' }} />
                  {label}
                </div>
              ))}
            </div>
          }
        />
        <div className="crate-grid">
          {Array.from({ length: capacity }, (_, i) => {
            const n = i + 1
            const data = crateMap[n]
            const cls = data ? data.stage : 'available'
            return (
              <div key={n} className={`crate ${cls}`} title={data ? `${data.batch} — ${data.stage}` : `Crate ${n} — Available`}>
                <div className="crate-num">C{n}</div>
                <div className="crate-info">{data ? data.batch : 'Free'}</div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 20 }}>
        {/* 30-day forecast chart */}
        <div className="card">
          <SectionHeader title="30-Day Capacity Forecast" />
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecast} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="date" tick={{ fontSize: 9 }} interval={4} />
                <YAxis tick={{ fontSize: 10 }} domain={[0, capacity]} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="available" stroke="var(--green)" strokeWidth={2} dot={false} name="Available" />
                <Line type="monotone" dataKey="occupied"  stroke="var(--amber)"  strokeWidth={2} dot={false} name="Occupied"  />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Smart insights */}
        <div className="card">
          <SectionHeader title="Smart Insights" />
          <div>
            {[
              { icon: '📊', label: 'Current Utilization', value: `${utilPct}%`, color: utilPct > 80 ? 'var(--danger)' : utilPct > 60 ? 'var(--warning)' : 'var(--green)' },
              { icon: '✨', label: 'Available Right Now', value: `${available} crates`, color: 'var(--blue)' },
              { icon: '📅', label: 'Next Capacity Release', value: nextRelease ? `${nextRelease.crates} crates on ${nextRelease.expectedHatch}` : 'No scheduled releases', color: 'var(--purple)' },
              { icon: '🏆', label: 'Highest Free Capacity (30 days)', value: `${highestFreeDay?.available} crates on ${highestFreeDay?.date}`, color: 'var(--green)' },
            ].map(({ icon, label, value, color }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 20 }}>{icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 1 }}>{label}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color }}>{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Capacity timeline */}
      {timeline.length > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <SectionHeader title="Capacity Release Timeline" />
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  {['Expected Hatch Date', 'Batch', 'Farm', 'Crates Released', 'Stage'].map((h) => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {timeline.map((b) => (
                  <tr key={b.id}>
                    <td><strong>{b.expectedHatch}</strong></td>
                    <td>{b.batchNum}</td>
                    <td>{b.farmName}</td>
                    <td><span style={{ fontWeight: 700, color: 'var(--green)' }}>+{b.crates} crates</span></td>
                    <td><span className={`stage-pill stage-${b.stage}`}>{b.stage}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Feasibility checker */}
      <div className="card">
        <SectionHeader title="Feasibility Checker" />
        <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 16 }}>
          Check if a new batch can be accommodated on a specific date.
        </p>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: '0 0 160px' }}>
            <label className="input-label">Required Crates</label>
            <input className="input" type="number" min={1} placeholder="e.g. 6" value={reqCrates} onChange={(e) => setReqCrates(e.target.value)} />
          </div>
          <div style={{ flex: '0 0 180px' }}>
            <label className="input-label">Expected Arrival Date</label>
            <input className="input" type="date" value={reqDate} onChange={(e) => setReqDate(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={checkFeasibility}>Check Feasibility</button>
        </div>
        {feasResult && (
          <div style={{
            marginTop: 16, padding: 16, borderRadius: 8,
            background: feasResult.ok ? 'var(--green-light)' : '#FFEBEE',
            border: `1px solid ${feasResult.ok ? '#A5D6A7' : '#FFCDD2'}`,
            color: feasResult.ok ? 'var(--green)' : 'var(--danger)',
            fontWeight: 600, fontSize: 14,
          }}>
            {feasResult.ok ? feasResult.msg : `❌ ${feasResult.reason}`}
          </div>
        )}
      </div>
    </div>
  )
}
