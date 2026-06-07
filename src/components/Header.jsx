import React from 'react'
import dayjs from 'dayjs'
import { MdMenu } from 'react-icons/md'
import { useApp } from '../context/AppContext'

export default function Header({ title, onToggleSidebar }) {
  const { occupied, capacity, available } = useApp()

  return (
    <div className="header">
      <div>
        <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 1 }}>
          {dayjs().format('dddd, MMMM D, YYYY')}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div className="capacity-badge">
          <span style={{ fontSize: 14 }}>📦</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--green)' }}>
            {occupied}/{capacity} crates
          </span>
          <span style={{ fontSize: 12, color: '#81C784' }}>· {available} free</span>
        </div>

        <button
          onClick={onToggleSidebar}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 6,
            borderRadius: 6,
            color: 'var(--text2)',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <MdMenu size={22} />
        </button>
      </div>
    </div>
  )
}
