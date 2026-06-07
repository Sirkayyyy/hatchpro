import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  MdDashboard, MdAdd, MdList, MdEgg, MdFlashOn, MdPets,
  MdCheckCircle, MdBarChart, MdViewKanban, MdInsights, MdSettings,
} from 'react-icons/md'

const NAV = [
  { path: '/',            label: 'Dashboard',       Icon: MdDashboard  },
  { path: '/add-batch',   label: 'Add Batch',        Icon: MdAdd        },
  { path: '/active',      label: 'Active Batches',   Icon: MdList       },
  { path: '/incubation',  label: 'Incubation',       Icon: MdEgg        },
  { path: '/candling',    label: 'Candling',         Icon: MdFlashOn    },
  { path: '/hatching',    label: 'Hatching',         Icon: MdPets       },
  { path: '/completed',   label: 'Completed',        Icon: MdCheckCircle},
  { path: '/capacity',    label: 'Capacity Monitor', Icon: MdBarChart   },
  { path: '/production',  label: 'Production Board', Icon: MdViewKanban },
  { path: '/reports',     label: 'Reports',          Icon: MdInsights   },
  { path: '/settings',    label: 'Settings',         Icon: MdSettings   },
]

export default function Sidebar({ open }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <div className={`sidebar ${open ? '' : 'sidebar-hidden'}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <h1 style={{ fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: '-0.3px' }}>
          🐣 HatchPro
        </h1>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
          Hatchery Management
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 0' }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', padding: '12px 20px 4px' }}>
          Menu
        </div>
        {NAV.map(({ path, label, Icon }) => {
          const isActive = pathname === path
          return (
            <div
              key={path}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => navigate(path)}
            >
              <Icon size={17} style={{ flexShrink: 0 }} />
              {label}
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
        v1.0.0 · All data local
      </div>
    </div>
  )
}
