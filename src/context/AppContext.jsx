import React, { createContext, useContext, useState, useCallback } from 'react'
import { LS, KEYS, DEFAULT_SETTINGS } from '../utils/storage'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [batches, setBatchesRaw] = useState(() => LS.get(KEYS.BATCHES, []))
  const [settings, setSettingsRaw] = useState(() => LS.get(KEYS.SETTINGS, DEFAULT_SETTINGS))

  const setBatches = useCallback((updater) => {
    setBatchesRaw((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      LS.set(KEYS.BATCHES, next)
      return next
    })
  }, [])

  const setSettings = useCallback((updater) => {
    setSettingsRaw((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      LS.set(KEYS.SETTINGS, next)
      return next
    })
  }, [])

  const capacity = settings.capacity || 900000

  // Occupied = sum of eggs for all active (non-completed) batches
  const occupied = batches
    .filter((b) => b.stage !== 'completed')
    .reduce((sum, b) => sum + (b.eggs || 0), 0)

  const available = capacity - occupied

  const stageCounts = batches.reduce(
    (acc, b) => {
      if (acc[b.stage] !== undefined) acc[b.stage]++
      return acc
    },
    { incubation: 0, candling: 0, hatching: 0, completed: 0 }
  )

  return (
    <AppContext.Provider
      value={{
        batches,
        setBatches,
        settings,
        setSettings,
        capacity,
        occupied,
        available,
        stageCounts,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
