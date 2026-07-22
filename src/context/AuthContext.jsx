import React, { createContext, useContext, useState, useCallback } from 'react'
import users from '../data/users.json'

// ─── Storage key ────────────────────────────────────────────────────────────
const STORAGE_KEY = 'vrit_current_user'

// ─── Context ─────────────────────────────────────────────────────────────────
const AuthContext = createContext(null)

// ─── Helper: rehydrate from localStorage ─────────────────────────────────────
function loadPersistedUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// ─── Provider ────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => loadPersistedUser())

  /**
   * Attempt login against the hardcoded users list.
   * Returns true on success, false on bad credentials.
   *
   * NOTE: plaintext comparison — demo/showcase only. Not production-safe.
   */
  const login = useCallback((username, password) => {
    const match = users.find(
      (u) => u.username === username && u.password === password
    )
    if (match) {
      // Strip the password before storing — minor hygiene even in demo mode
      const safeUser = { username: match.username, role: match.role, name: match.name }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(safeUser))
      setCurrentUser(safeUser)
      return true
    }
    return false
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setCurrentUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// ─── Hook ────────────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
