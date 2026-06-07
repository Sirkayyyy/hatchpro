import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { PageTitle, BirdTag, EmptyState } from '../components/UI'

export default function Completed() {
  const { batches } = useApp()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')

  const completed = batches
    .filter((b) => b.stage === 'completed')
    .filter((b) => {
      const s = search.toLowerCase()
      const matchS = !s || b.batchNum.toLowerCase().includes(s) || b.farmName.toLowerCase().includes(s)
      const matchT = typeFilter === 'All' || b.birdType === typeFilter
      return matchS && matchT
    })
    .sort((a, b) => new Date(b.completedAt || 0) - new Date(a.completedAt || 0))

  const total = batches.filter((b) => b.stage === 'completed')
  const avgHatchRate = total.length > 0
    ? Math.round(total.reduce((s, b) => s + (b.hatchRate || 0), 0) / total.length)
    : 0
  const totalChicks = total.reduce((s, b) => s + (b.chicksHatched || 0), 0)
  const totalEggs = total.reduce((s, b) => s + (b.eggs || 0), 0)

  return (
    <div>
      <PageTitle
        title="Completed Batches"
        subtitle={`${total.length} batch${total.length !== 1 ? 'es' : ''} archived`}
      />

      {/* Summary stats */}
      {total.length > 0 && (
        <div className="grid-4" style={{ marginBottom: 20 }}>
          {[
            ['Total Batches', total.length, '📋', 'var(--green)'],
            ['Avg Hatch Rate', `${avgHatchRate}%`, '📊', 'var(--blue)'],
            ['Total Eggs', totalEggs.toLocaleString(), '🥚', 'var(--amber)'],
            ['Total Chicks', totalChicks.toLocaleString(), '🐣', 'var(--purple)'],
          ].map(([l, v, ic, c]) => (
            <div key={l} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 22 }}>{ic}</div>
              <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'Space Grotesk', color: c, marginTop: 4 }}>{v}</div>
              <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }}>🔍</span>
          <input
            className="input"
            placeholder="Search completed batches..."
            style={{ paddingLeft: 34 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="input select" style={{ width: 140 }} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option>All</option>
          {['Broiler', 'Layer', 'Cockerel', 'Turkey', 'Duck'].map((t) => <option key={t}>{t}</option>)}
        </select>
      </div>

      {completed.length === 0 ? (
        <div className="card">
          <EmptyState icon="✅" title="No completed batches" subtitle="Completed batches will appear here after hatching is recorded" />
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                {['Batch #', 'Farm', 'Bird Type', 'Crates', 'Total Eggs', 'Fertile Eggs', 'Chicks Hatched', 'Hatch Rate', 'Hatch Date'].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {completed.map((b) => (
                <tr key={b.id}>
                  <td><span style={{ fontWeight: 700 }}>{b.batchNum}</span></td>
                  <td>{b.farmName}</td>
                  <td><BirdTag type={b.birdType} /></td>
                  <td>{b.crates}</td>
                  <td>{(b.eggs || 0).toLocaleString()}</td>
                  <td>{(b.fertileEggs || 0).toLocaleString()}</td>
                  <td><strong>{(b.chicksHatched || 0).toLocaleString()}</strong></td>
                  <td>
                    <span style={{
                      fontWeight: 700,
                      color: (b.hatchRate || 0) >= 80 ? 'var(--green)' : (b.hatchRate || 0) >= 60 ? 'var(--warning)' : 'var(--danger)',
                    }}>
                      {b.hatchRate || 0}%
                    </span>
                  </td>
                  <td>{b.hatchDate || b.completedAt?.slice(0, 10) || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
