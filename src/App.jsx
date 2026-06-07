import React, { useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { AppProvider } from './context/AppContext'
import Sidebar from './components/Sidebar'
import Header from './components/Header'

import Dashboard      from './pages/Dashboard'
import AddBatch       from './pages/AddBatch'
import ActiveBatches  from './pages/ActiveBatches'
import Incubation     from './pages/Incubation'
import Candling       from './pages/Candling'
import Hatching       from './pages/Hatching'
import Completed      from './pages/Completed'
import CapacityMonitor from './pages/CapacityMonitor'
import ProductionBoard from './pages/ProductionBoard'
import Reports        from './pages/Reports'
import Settings       from './pages/Settings'

const PAGE_TITLES = {
  '/':           '🏠 Dashboard',
  '/add-batch':  '➕ Add Batch',
  '/active':     '📋 Active Batches',
  '/incubation': '🥚 Incubation',
  '/candling':   '🔦 Candling',
  '/hatching':   '🐣 Hatching',
  '/completed':  '✅ Completed',
  '/capacity':   '📊 Capacity Monitor',
  '/production': '🗂 Production Board',
  '/reports':    '📈 Reports',
  '/settings':   '⚙ Settings',
}

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { pathname } = useLocation()
  const title = PAGE_TITLES[pathname] || 'HatchPro'

  return (
    <div className="app">
      <Sidebar open={sidebarOpen} />

      <div className={`main ${!sidebarOpen ? 'main-full' : ''}`}>
        <Header title={title} onToggleSidebar={() => setSidebarOpen((o) => !o)} />

        <div className="content">
          <Routes>
            <Route path="/"           element={<Dashboard />}       />
            <Route path="/add-batch"  element={<AddBatch />}        />
            <Route path="/active"     element={<ActiveBatches />}   />
            <Route path="/incubation" element={<Incubation />}      />
            <Route path="/candling"   element={<Candling />}        />
            <Route path="/hatching"   element={<Hatching />}        />
            <Route path="/completed"  element={<Completed />}       />
            <Route path="/capacity"   element={<CapacityMonitor />} />
            <Route path="/production" element={<ProductionBoard />} />
            <Route path="/reports"    element={<Reports />}         />
            <Route path="/settings"   element={<Settings />}        />
            <Route path="*"           element={<Dashboard />}       />
          </Routes>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="light"
        toastStyle={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13 }}
      />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Layout />
    </AppProvider>
  )
}
