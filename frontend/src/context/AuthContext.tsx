import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { api } from '../lib/api'
import type { AuthUser } from '../lib/types'

interface AuthContextValue {
  user: AuthUser | null
  // True only while the initial session check (GET /api/auth/me) is in
  // flight — callers use this to avoid flashing the sign-in screen before
  // we actually know whether there's a valid session.
  loading: boolean
  signInWithGoogleToken: (idToken: string) => Promise<void>
  signOut: () => Promise<void>
  // Re-fetches /api/auth/me — used after completing/skipping onboarding so
  // user.onboarding_status updates without a full page reload.
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchMe = useCallback(async () => {
    try {
      const res = await api.get<AuthUser>('/api/auth/me')
      setUser(res.data)
    } catch {
      setUser(null)
    }
  }, [])

  useEffect(() => {
    fetchMe().finally(() => setLoading(false))
  }, [fetchMe])

  async function signInWithGoogleToken(idToken: string) {
    const res = await api.post<AuthUser>('/api/auth/google', { id_token: idToken })
    setUser(res.data)
  }

  async function signOut() {
    try {
      await api.post('/api/auth/logout')
    } finally {
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogleToken, signOut, refreshUser: fetchMe }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
