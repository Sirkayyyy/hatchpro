import React, { useState } from 'react'
import dayjs from 'dayjs'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { useApp } from '../context/AppContext'
import { PageTitle, SectionHeader, ProgressBar } from '../components/UI'

export default function CapacityMonitor() {
  const { batches, capacity, occupied, available } = useApp()
  const [reqEggs, setReqEggs] = useState('')
  const [reqDate, setReqDate] = useState('')
  const [feasResult, setFeasResult] = useState(null)

  const active = batches.filter((b) => b.stage !== 'completed')

  // 30-day forecast based on expectedHatch dates
  const forecast = Array.from({ length: 30 }, (_, i) => {
    const d = dayjs().add(i, 'day')
    const occ = batches
      .filter((b) => b.stage !== 'completed' && (!b.expectedHatch || dayjs(b.expectedHatch).isAfter(d)))
      .reduce((s, b) => s + (b.eggs || 0), 0)
    return {
      date: d.format('MMM D'),
      available: Math.max(0, capacity - occ),
      occupied: Math.min(capacity, occ),
    }
  })

  // Capacity timeline
  const timeline = batches
    .filter((b) => b.stage !== 'completed' && b.expectedHatch)
    .sort((a, b) => new Date(a.expectedHatch) - new Date(b.expectedHatch))

  // Smart insights
  const utilPct = capacity > 0 ? Math.round((occupied / capacity) * 100) : 0
  const nextRelease = timeline[0]
  const highestFreeDay = forecast.reduce((best, d) => d.available > best.available ? d : best, forecast[0])

  // Feasibility check
  const checkFeasibility = () => {
    const eggs = parseInt(reqEggs)
    if (!eggs || eggs < 1) {
      setFeasResult({ ok: false, reason: 'Enter a valid number of eggs.' })
      return
    }

    if (!reqDate) {
      if (available >= eggs) {
        setFeasResult({ ok: true, msg: `✅ Accepted — ${available.toLocaleString()} egg slots currently available.` })
      } else {
        setFeasResult({ ok: false, reason: `Not enough capacity. Only ${available.toLocaleString()} egg slots available now.` })
      }
      return
    }

    const target = dayjs(reqDate)
    const dayIdx = target.diff(dayjs(), 'day')
    if (dayIdx < 0) { setFeasResult({ ok: false, reason: 'Date is in the past.' }); return }
    if (dayIdx >= forecast.length) {
      setFeasResult({ ok: true, msg: `✅ Likely accepted — capacity should free up beyond the 30-day window.` })
      return
    }

    const snap = forecast[dayIdx]
    if (snap.available >= eggs) {
      setFeasResult({ ok: true, msg: `✅ Accepted — ${snap.available.toLocaleString()} egg slots projected available on ${target.format('MMM D, YYYY')}.` })
    } else {
      setFeasResult({ ok: false, reason: `Not enough capacity on ${target.format('MMM D, YYYY')}. Only ${snap.available.toLocaleString()} egg slots projected.` })
    }
  }

  // Egg capacity visual — show top batches as proportional blocks
  const totalActiveEggs = active.reduce((s, b) => s + (b.eggs || 0), 0)

  return (
    <div>
      <PageTitle title="Capacity Monitor" subtitle="Egg slot utilization, forecasting, and feasibility checker" />

      {/* Top stats */}
      <div className="grid-3" style={{ marginBottom: 20 }}>
        {[
          ['Total Egg Capacity', capacity,  'var(--green)', '🏭'],
          ['Eggs Occupied',      occupied,  'var(--amber)', '🥚'],
          ['Egg Slots Free',     available, 'var(--blue)',  '✨'],
        ].map(([l, v, c, ic]) => (
          <div key={l} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, padding: 18, borderLeft: `4px solid ${c}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text2)', marginBottom: 6 }}>
              {ic} {l}
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Space Grotesk', color: c }}>
              {v.toLocaleString()}
            </div>
            <div style={{ marginTop: 8 }}>
              <ProgressBar value={v} max={capacity} color={c} />
            </div>
          </div>
        ))}
      </div>

      {/* Utilization bar */}
      <div className="card" style={{ marginBottom: 20 }}>
        <SectionHeader title="Egg Capacity Breakdown by Batch" />
        {active.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 24, color: 'var(--text3)', fontSize: 13 }}>No active batches</div>
        ) : (
          <>
            {/* Proportional bar */}
            <div style={{ display: 'flex', height: 32, borderRadius: 8, overflow: 'hidden', marginBottom: 12 }}>
              {active.map((b, i) => {
                const pct = capacity > 0 ? (b.eggs / capacity) * 100 : 0
                const colors = ['#1565C0', '#F9A825', '#7B1FA2', '#2E7D32', '#00838F', '#D32F2F', '#E65100']
                return (
                  <div
                    key={b.id}
                    title={`${b.batchNum}: ${(b.eggs || 0).toLocaleString()} eggs`}
                    style={{ width: `${pct}%`, background: colors[i % colors.length], minWidth: 2 }}
                  />
                )
              })}
              {/* Free space */}
              <div style={{ flex: 1, background: '#E8F5E9' }} title={`Free: ${available.toLocaleString()} eggs`} />
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {active.map((b, i) => {
                const colors = ['#1565C0', '#F9A825', '#7B1FA2', '#2E7D32', '#00838F', '#D32F2F', '#E65100']
                return (
                  <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: colors[i % colors.length] }} />
                    <span style={{ color: 'var(--text2)' }}>{b.batchNum}: <strong>{(b.eggs || 0).toLocaleString()}</strong></span>
                  </div>
                )
              })}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: '#C8E6C9' }} />
                <span style={{ color: 'var(--text2)' }}>Free: <strong>{available.toLocaleString()}</strong></span>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="grid-2" style={{ marginBottom: 20 }}>
        {/* 30-day forecast chart */}
        <div className="card">
          <SectionHeader title="30-Day Egg Capacity Forecast" />
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecast} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="date" tick={{ fontSize: 9 }} interval={4} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                <Tooltip formatter={(v) => v.toLocaleString() + ' eggs'} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="available" stroke="var(--green)" strokeWidth={2} dot={false} name="Available Eggs" />
                <Line type="monotone" dataKey="occupied"  stroke="var(--amber)"  strokeWidth={2} dot={false} name="Occupied Eggs"  />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Smart insights */}
        <div className="card">
          <SectionHeader title="Smart Insights" />
          {[
            { icon: '📊', label: 'Current Utilization',           value: `${utilPct}%`,                                                                     color: utilPct > 80 ? 'var(--danger)' : utilPct > 60 ? 'var(--warning)' : 'var(--green)' },
            { icon: '✨', label: 'Available Egg Slots Now',       value: `${available.toLocaleString()} eggs`,                                               color: 'var(--blue)'   },
            { icon: '📅', label: 'Next Capacity Release',         value: nextRelease ? `${(nextRelease.eggs||0).toLocaleString()} eggs on ${nextRelease.expectedHatch}` : 'No scheduled releases', color: 'var(--purple)' },
            { icon: '🏆', label: 'Highest Free Capacity (30 days)', value: `${(highestFreeDay?.available||0).toLocaleString()} eggs on ${highestFreeDay?.date}`, color: 'var(--green)'  },
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

      {/* Capacity timeline */}
      {timeline.length > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <SectionHeader title="Egg Capacity Release Timeline" />
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  {['Expected Hatch Date', 'Batch', 'Farm', 'Eggs Released', 'Stage'].map((h) => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {timeline.map((b) => (
                  <tr key={b.id}>
                    <td><strong>{b.expectedHatch}</strong></td>
                    <td>{b.batchNum}</td>
                    <td>{b.farmName}</td>
                    <td><span style={{ fontWeight: 700, color: 'var(--green)' }}>+{(b.eggs || 0).toLocaleString()} eggs</span></td>
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
          Check if a new batch of eggs can be accommodated now or on a future date.
        </p>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: '0 0 180px' }}>
            <label className="input-label">Required Egg Slots</label>
            <input className="input" type="number" min={1} placeholder="e.g. 50000" value={reqEggs} onChange={(e) => setReqEggs(e.target.value)} />
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
