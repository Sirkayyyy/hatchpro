import React from 'react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { useApp } from '../context/AppContext'
import { PageTitle, SectionHeader, EmptyState } from '../components/UI'

const COLORS = ['#2E7D32', '#1565C0', '#F9A825', '#7B1FA2', '#00838F', '#D32F2F']

export default function Reports() {
  const { batches, capacity } = useApp()
  const completed = batches.filter((b) => b.stage === 'completed')

  const stageData = [
    { name: 'Incubation', value: batches.filter((b) => b.stage === 'incubation').length },
    { name: 'Candling',   value: batches.filter((b) => b.stage === 'candling').length },
    { name: 'Hatching',   value: batches.filter((b) => b.stage === 'hatching').length },
    { name: 'Completed',  value: completed.length },
  ].filter((d) => d.value > 0)

  const birdData = ['Broiler', 'Layer', 'Cockerel', 'Turkey', 'Duck']
    .map((t) => ({ name: t, value: batches.filter((b) => b.birdType === t).length }))
    .filter((d) => d.value > 0)

  const hatchRates = completed.slice(-10).map((b) => ({
    name: b.batchNum,
    hatchRate: b.hatchRate || 0,
    fertilityRate: b.fertilityRate || 0,
  }))

  const utilData = Array.from({ length: 14 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (13 - i))
    const dateStr = d.toISOString().slice(0, 10)
    const occ = batches
      .filter((b) => b.dateLoaded && b.dateLoaded <= dateStr &&
        (b.stage !== 'completed' || (b.hatchDate && b.hatchDate > dateStr)))
      .reduce((s, b) => s + (b.eggs || 0), 0)
    return {
      date: d.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      utilization: capacity > 0 ? Math.round((Math.min(occ, capacity) / capacity) * 100) : 0,
    }
  })

  const totalBatches  = batches.length
  const avgHatchRate  = completed.length ? Math.round(completed.reduce((s, b) => s + (b.hatchRate || 0), 0) / completed.length) : 0
  const totalEggs     = batches.reduce((s, b) => s + (b.eggs || 0), 0)
  const totalChicks   = completed.reduce((s, b) => s + (b.chicksHatched || 0), 0)
  const totalExpected = batches.reduce((s, b) => s + (b.chicksExpected || 0), 0)
  const bestBatch     = completed.reduce((best, b) => (!best || (b.hatchRate || 0) > (best.hatchRate || 0)) ? b : best, null)
  const activeEggs    = batches.filter((b) => b.stage !== 'completed').reduce((s, b) => s + (b.eggs || 0), 0)

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, value }) => {
    if (value === 0) return null
    const RADIAN = Math.PI / 180
    const r = innerRadius + (outerRadius - innerRadius) * 0.5 + 14
    const x = cx + r * Math.cos(-midAngle * RADIAN)
    const y = cy + r * Math.sin(-midAngle * RADIAN)
    return (
      <text x={x} y={y} fill="#374151" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
        {name}: {value}
      </text>
    )
  }

  return (
    <div>
      <PageTitle title="Reports & Analytics" subtitle="Production statistics and performance insights" />

      <div className="grid-4" style={{ marginBottom: 20 }}>
        {[
          ['Total Batches',    totalBatches,                '📋', 'var(--green)'],
          ['Avg Hatch Rate',   `${avgHatchRate}%`,          '📊', 'var(--blue)'],
          ['Total Eggs',       totalEggs.toLocaleString(),  '🥚', 'var(--amber)'],
          ['Chicks Hatched',   totalChicks.toLocaleString(),'🐣', 'var(--purple)'],
        ].map(([l, v, ic, c]) => (
          <div key={l} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, padding: 18, textAlign: 'center' }}>
            <div style={{ fontSize: 24 }}>{ic}</div>
            <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'Space Grotesk', color: c, marginTop: 6 }}>{v}</div>
            <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 3 }}>{l}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: 20 }}>
        <div className="card">
          <SectionHeader title="Stage Distribution" />
          {stageData.length === 0 ? <EmptyState icon="📊" title="No data yet" /> : (
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stageData} cx="50%" cy="50%" outerRadius={80} dataKey="value" labelLine={false} label={CustomLabel}>
                    {stageData.map((_, i) => <Cell key={i} fill={['#1565C0', '#F9A825', '#7B1FA2', '#2E7D32'][i % 4]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="card">
          <SectionHeader title="Bird Type Distribution" />
          {birdData.length === 0 ? <EmptyState icon="🐦" title="No data yet" /> : (
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={birdData} cx="50%" cy="50%" outerRadius={80} dataKey="value" labelLine={false} label={CustomLabel}>
                    {birdData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <SectionHeader title="Hatch & Fertility Rates by Batch" />
        {hatchRates.length === 0 ? (
          <EmptyState icon="📈" title="No completed batches yet" subtitle="Complete a batch to see hatch rate trends" />
        ) : (
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hatchRates} margin={{ top: 4, right: 10, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} unit="%" />
                <Tooltip formatter={(v) => `${v}%`} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="hatchRate"     fill="var(--green)" radius={[4,4,0,0]} name="Hatch Rate %" />
                <Bar dataKey="fertilityRate" fill="#1565C0"      radius={[4,4,0,0]} name="Fertility Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <SectionHeader title="Egg Capacity Utilization (Last 14 Days)" />
        <div style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={utilData} margin={{ top: 4, right: 10, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={1} />
              <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} unit="%" />
              <Tooltip formatter={(v) => `${v}%`} />
              <Line type="monotone" dataKey="utilization" stroke="var(--amber)" strokeWidth={2.5} dot={{ r: 3 }} name="Utilization %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <SectionHeader title="Top Performers" />
          {completed.length === 0 ? <EmptyState icon="🏆" title="No completed batches yet" /> : (
            completed
              .sort((a, b) => (b.hatchRate || 0) - (a.hatchRate || 0))
              .slice(0, 5)
              .map((b, i) => (
                <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid #F3F4F6' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: i === 0 ? '#FFF8E1' : '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: i === 0 ? '#F9A825' : 'var(--text3)', flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{b.batchNum}</div>
                    <div style={{ fontSize: 11, color: 'var(--text2)' }}>
                      {b.farmName} · {(b.eggs || 0).toLocaleString()} eggs · {b.birdType}
                    </div>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, fontFamily: 'Space Grotesk', color: (b.hatchRate || 0) >= 80 ? 'var(--green)' : (b.hatchRate || 0) >= 60 ? 'var(--warning)' : 'var(--danger)' }}>
                    {b.hatchRate || 0}%
                  </div>
                </div>
              ))
          )}
        </div>

        <div className="card">
          <SectionHeader title="Production Summary" />
          {[
            ['Active Batches',     batches.filter((b) => b.stage !== 'completed').length, '🔬'],
            ['Active Eggs',        activeEggs.toLocaleString(),                            '🥚'],
            ['Total Eggs Loaded',  totalEggs.toLocaleString(),                             '📦'],
            ['Total Chicks Expected', totalExpected.toLocaleString(),                      '🎯'],
            ['Total Chicks Hatched',  totalChicks.toLocaleString(),                        '🐣'],
            ['Best Hatch Rate',    bestBatch ? `${bestBatch.hatchRate}% (${bestBatch.batchNum})` : '—', '🏆'],
          ].map(([l, v, ic]) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F3F4F6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16 }}>{ic}</span>
                <span style={{ fontSize: 12, color: 'var(--text2)' }}>{l}</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
