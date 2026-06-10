export const LS = {
  get: (key, defaultValue = null) => {
    try {
      const value = localStorage.getItem(key)
      return value ? JSON.parse(value) : defaultValue
    } catch {
      return defaultValue
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch {
      return false
    }
  },
  remove: (key) => {
    try {
      localStorage.removeItem(key)
      return true
    } catch {
      return false
    }
  },
}

export const KEYS = {
  BATCHES: 'hatchpro_batches',
  SETTINGS: 'hatchpro_settings',
}

export const DEFAULT_SETTINGS = {
  capacity: 30720,
  incubationDays: 21,
  candlingDay: 7,
}

export function genId() {
  return 'B' + String(Date.now()).slice(-6) + Math.random().toString(36).slice(2, 5).toUpperCase()
}
