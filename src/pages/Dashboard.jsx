import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { PageTitle, StatCard, SectionHeader, ProgressBar, StagePill, BirdTag } from '../components/UI'

export default function Dashboard() {
  const { batches, capacity, occupied, available, stageCounts } = useApp()
  const navigate = useNavigate()
  const utilPct = capacity > 0 ? Math.round((occupied / capacity) * 100) : 0
  const recent = [...batches].reverse().slice(0, 6)

  return (
    <div>
      <PageTitle title="Dashboard" subtitle="Overview of your hatchery operations" />

      {/* Top stats */}
      <div className="grid-4" style={{ marginBottom: 20 }}>
        <StatCard label="Total Egg Capacity"  value={capacity.toLocaleString()}  icon="🏭" color="var(--green)" sub="Maximum eggs" />
        <StatCard label="Eggs Occupied"        value={occupied.toLocaleString()}  icon="🥚" color="var(--amber)"  sub={`${utilPct}% utilization`} />
        <StatCard label="Eggs Available"       value={available.toLocaleString()} icon="✨" color="var(--blue)"   sub="Slots free" />
        <StatCard label="Active Batches"       value={batches.filter(b => b.stage !== 'completed').length} icon="🔬" color="var(--purple)" sub="In progress" />
      </div>

      {/* Stage counts */}
      <div className="grid-4" style={{ marginBottom: 20 }}>
        {[
          { label: 'Incubation', count: stageCounts.incubation, icon: '🥚', color: 'var(--blue)',   path: '/incubation' },
          { label: 'Candling',   count: stageCounts.candling,   icon: '🔦', color: 'var(--amber)',  path: '/candling'   },
          { label: 'Hatching',   count: stageCounts.hatching,   icon: '🐣', color: 'var(--purple)', path: '/hatching'   },
          { label: 'Completed',  count: stageCounts.completed,  icon: '✅', color: 'var(--green)',  path: '/completed'  },
        ].map(({ label, count, icon, color, path }) => (
          <div
            key={label}
            className="card"
            style={{ cursor: 'pointer', transition: 'all 0.15s', borderLeft: `4px solid ${color}` }}
            onClick={() => navigate(path)}
          >
            <div style={{ fontSize: 24, marginBottom: 6 }}>{icon}</div>
            <div style={{ fontSize: 26, fontWeight: 800, fontFamily: 'Space Grotesk', color }}>{count}</div>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{label} batches</div>
          </div>
        ))}
      </div>

      {/* Lower row */}
      <div className="grid-2">
        {/* Capacity widget */}
        <div className="card">
          <SectionHeader title="Egg Capacity Utilization" />
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--text2)' }}>
                {occupied.toLocaleString()} of {capacity.toLocaleString()} eggs occupied
              </span>
              <span style={{
                fontSize: 13, fontWeight: 700,
                color: utilPct > 80 ? 'var(--danger)' : utilPct > 60 ? 'var(--warning)' : 'var(--green)',
              }}>
                {utilPct}%
              </span>
            </div>
            <ProgressBar value={occupied} max={capacity} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {[
              ['Total',     capacity,  'var(--green)'],
              ['Occupied',  occupied,  'var(--amber)'],
              ['Available', available, 'var(--blue)'],
            ].map(([l, v, c]) => (
              <div key={l} style={{ background: 'var(--bg)', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 800, fontFamily: 'Space Grotesk', color: c }}>
                  {v.toLocaleString()}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text2)', marginTop: 2 }}>{l} Eggs</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="card">
          <SectionHeader
            title="Recent Activity"
            action={
              <button className="btn btn-secondary" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => navigate('/active')}>
                View All
              </button>
            }
          />
          {recent.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text3)' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🥚</div>
              <div style={{ fontSize: 13 }}>No batches yet. Add your first batch!</div>
            </div>
          ) : (
            recent.map((b) => (
              <div key={b.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F3F4F6' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{b.batchNum}</div>
                  <div style={{ fontSize: 11, color: 'var(--text2)' }}>
                    {b.farmName} · {(b.eggs || 0).toLocaleString()} eggs · <BirdTag type={b.birdType} />
                  </div>
                </div>
                <StagePill stage={b.stage} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
