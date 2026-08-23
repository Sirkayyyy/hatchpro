import React from 'react'
import { toast } from 'react-toastify'
import dayjs from 'dayjs'
import { useApp } from '../context/AppContext'
import { PageTitle, BirdTag, ProgressBar, EmptyState } from '../components/UI'

export default function Incubation() {
  const { batches, setBatches, settings } = useApp()
  const incubating = batches.filter((b) => b.stage === 'incubation')
  const incubationDays = settings.incubationDays || 21

  const moveToCandling = (id) => {
    setBatches((b) =>
      b.map((x) =>
        x.id === id ? { ...x, stage: 'candling', candlingStart: new Date().toISOString() } : x
      )
    )
    toast.success('Batch moved to Candling')
  }

  const daysIn = (batch) => {
    if (!batch.dateLoaded) return 0
    return dayjs().diff(dayjs(batch.dateLoaded), 'day')
  }

  return (
    <div>
      <PageTitle
        title="Incubation"
        subtitle={`${incubating.length} batch${incubating.length !== 1 ? 'es' : ''} currently in incubation`}
      />

      {incubating.length === 0 ? (
        <div className="card">
          <EmptyState icon="🥚" title="No batches in incubation" subtitle="Add a new batch to start the incubation process" />
        </div>
      ) : (
        <div className="grid-3">
          {incubating.map((b) => {
            const days = daysIn(b)
            const pct = Math.min(100, Math.round((days / incubationDays) * 100))
            const isReady = days >= incubationDays

            return (
              <div key={b.id} className="card" style={{ borderTop: '3px solid #1565C0' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>{b.batchNum}</div>
                    <div style={{ fontSize: 12, color: 'var(--text2)' }}>{b.farmName}</div>
                  </div>
                  <BirdTag type={b.birdType} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
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

                <div style={{ background: '#EDE7F6', borderRadius: 8, padding: '8px 12px', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: '#6A1B9A', fontWeight: 600 }}>⏱ Days in incubation</span>
                  <span style={{ fontSize: 18, fontWeight: 800, color: '#7B1FA2', fontFamily: 'Space Grotesk' }}>{days}</span>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 11, color: 'var(--text2)' }}>Progress ({incubationDays} days)</span>
                    <span style={{ fontSize: 11, fontWeight: 700 }}>{pct}%</span>
                  </div>
                  <ProgressBar value={days} max={incubationDays} color="#1565C0" />
                </div>

                {isReady && (
                  <div style={{ background: '#E8F5E9', borderRadius: 6, padding: '6px 10px', fontSize: 11, color: 'var(--green)', fontWeight: 600, marginBottom: 10, textAlign: 'center' }}>
                    ✅ Ready for candling!
                  </div>
                )}

                <button
                  className="btn btn-primary btn-full"
                  style={{ background: '#1565C0' }}
                  onClick={() => moveToCandling(b.id)}
                >
                  🔦 Move to Candling
                </button>

                {b.remarks && (
                  <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text2)', fontStyle: 'italic', borderTop: '1px solid var(--border)', paddingTop: 8 }}>
                    📝 {b.remarks}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
