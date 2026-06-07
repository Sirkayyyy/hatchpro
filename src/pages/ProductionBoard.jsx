import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { useApp } from '../context/AppContext'
import { PageTitle, BirdTag } from '../components/UI'

const STAGES = [
  { id: 'incubation', label: 'Incubation', icon: '🥚', color: '#1565C0', bg: '#E3F2FD', countBg: '#BBDEFB' },
  { id: 'candling',   label: 'Candling',   icon: '🔦', color: '#E65100', bg: '#FFF8E1', countBg: '#FFE082' },
  { id: 'hatching',   label: 'Hatching',   icon: '🐣', color: '#7B1FA2', bg: '#F3E5F5', countBg: '#CE93D8' },
  { id: 'completed',  label: 'Completed',  icon: '✅', color: '#2E7D32', bg: '#E8F5E9', countBg: '#A5D6A7' },
]

const STAGE_ORDER = ['incubation', 'candling', 'hatching', 'completed']

export default function ProductionBoard() {
  const { batches, setBatches } = useApp()
  const [draggingId, setDraggingId] = useState(null)
  const [dragOverStage, setDragOverStage] = useState(null)

  const moveToStage = (id, toStage) => {
    const batch = batches.find((b) => b.id === id)
    if (!batch) return

    const fromIdx = STAGE_ORDER.indexOf(batch.stage)
    const toIdx = STAGE_ORDER.indexOf(toStage)

    if (toIdx === fromIdx) return
    if (toIdx !== fromIdx + 1) {
      toast.error('Batches can only advance to the next stage')
      return
    }

    setBatches((b) =>
      b.map((x) =>
        x.id === id
          ? {
              ...x,
              stage: toStage,
              ...(toStage === 'candling'   ? { candlingStart: new Date().toISOString() } : {}),
              ...(toStage === 'completed'  ? { completedAt: new Date().toISOString() }  : {}),
            }
          : x
      )
    )
    toast.success(`Moved to ${STAGES.find((s) => s.id === toStage)?.label}`)
  }

  const handleDrop = (toStage) => {
    if (draggingId) moveToStage(draggingId, toStage)
    setDraggingId(null)
    setDragOverStage(null)
  }

  const totalActive = batches.filter((b) => b.stage !== 'completed').length

  return (
    <div>
      <PageTitle
        title="Production Board"
        subtitle={`Kanban view — drag cards to advance batches through stages · ${totalActive} active batch${totalActive !== 1 ? 'es' : ''}`}
      />

      {/* Instructions */}
      <div style={{
        background: '#EDE7F6', border: '1px solid #CE93D8', borderRadius: 8,
        padding: '10px 14px', marginBottom: 20, fontSize: 12, color: '#6A1B9A', display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{ fontSize: 16 }}>💡</span>
        Drag a card to the next column to advance it, or use the arrow button on each card.
        Batches can only move forward (Incubation → Candling → Hatching → Completed).
      </div>

      <div className="kanban">
        {STAGES.map((stage) => {
          const items = batches.filter((b) => b.stage === stage.id)
          const isOver = dragOverStage === stage.id

          return (
            <div
              key={stage.id}
              className="kanban-col"
              style={{
                outline: isOver ? `2px dashed ${stage.color}` : 'none',
                outlineOffset: 2,
                background: isOver ? stage.bg : '#F9FAFB',
                transition: 'all 0.15s',
              }}
              onDragOver={(e) => { e.preventDefault(); setDragOverStage(stage.id) }}
              onDragLeave={() => setDragOverStage(null)}
              onDrop={() => handleDrop(stage.id)}
            >
              {/* Column header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 16 }}>{stage.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', color: stage.color }}>
                    {stage.label}
                  </span>
                </div>
                <span style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: stage.countBg, color: stage.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700,
                }}>
                  {items.length}
                </span>
              </div>

              {/* Cards */}
              {items.length === 0 ? (
                <div style={{
                  textAlign: 'center', padding: '32px 12px',
                  color: 'var(--text3)', fontSize: 12,
                  border: `2px dashed ${stage.countBg}`,
                  borderRadius: 8,
                }}>
                  {isOver ? `Drop here to move to ${stage.label}` : 'No batches'}
                </div>
              ) : (
                items.map((b) => {
                  const nextStage = STAGE_ORDER[STAGE_ORDER.indexOf(b.stage) + 1]
                  const nextLabel = STAGES.find((s) => s.id === nextStage)?.label

                  return (
                    <div
                      key={b.id}
                      className={`kanban-card ${draggingId === b.id ? 'dragging' : ''}`}
                      draggable
                      onDragStart={() => setDraggingId(b.id)}
                      onDragEnd={() => { setDraggingId(null); setDragOverStage(null) }}
                    >
                      {/* Card header */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700 }}>{b.batchNum}</div>
                          <div style={{ fontSize: 11, color: 'var(--text2)' }}>{b.farmName}</div>
                        </div>
                        {nextStage && (
                          <button
                            title={`Move to ${nextLabel}`}
                            onClick={() => moveToStage(b.id, nextStage)}
                            style={{
                              background: stage.bg, border: `1px solid ${stage.countBg}`,
                              borderRadius: 6, padding: '3px 7px', cursor: 'pointer',
                              fontSize: 11, color: stage.color, fontWeight: 700,
                              display: 'flex', alignItems: 'center', gap: 3,
                            }}
                          >
                            → {nextLabel}
                          </button>
                        )}
                      </div>

                      {/* Tags row */}
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 8 }}>
                        <BirdTag type={b.birdType} />
                        <span style={{ background: '#F3F4F6', color: 'var(--text2)', padding: '2px 7px', borderRadius: 10, fontSize: 10, fontWeight: 600 }}>
                          {b.crates} crates
                        </span>
                        <span style={{ background: '#F3F4F6', color: 'var(--text2)', padding: '2px 7px', borderRadius: 10, fontSize: 10, fontWeight: 600 }}>
                          {(b.eggs || 0).toLocaleString()} eggs
                        </span>
                      </div>

                      {/* Stage-specific info */}
                      {b.stage === 'incubation' && b.dateLoaded && (
                        <div style={{ fontSize: 10, color: 'var(--text3)' }}>
                          📅 Loaded: {b.dateLoaded}
                        </div>
                      )}
                      {b.stage === 'candling' && (
                        <div style={{ fontSize: 10, color: 'var(--text3)' }}>
                          ✅ Fertile: {b.fertileEggs ?? '—'} &nbsp;|&nbsp; ❌ Rejected: {b.rejectedEggs ?? '—'}
                        </div>
                      )}
                      {b.stage === 'hatching' && b.fertilityRate !== undefined && (
                        <div style={{ fontSize: 10, color: 'var(--text3)' }}>
                          🧬 Fertility: {b.fertilityRate}%
                        </div>
                      )}
                      {b.stage === 'completed' && (
                        <div style={{ fontSize: 10, color: 'var(--text3)' }}>
                          🐣 Chicks: {(b.chicksHatched || 0).toLocaleString()} &nbsp;|&nbsp; 📊 {b.hatchRate ?? 0}% hatch rate
                        </div>
                      )}

                      {b.expectedHatch && b.stage !== 'completed' && (
                        <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 4 }}>
                          🎯 Expected: {b.expectedHatch}
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
