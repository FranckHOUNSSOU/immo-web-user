import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'

type AuthUser = {
  id: number
  nom: string
  prenom: string
  email: string | null
  telephone: string | null
  role: string
  roles_actifs?: string[]
  role_principal?: string
  photo_profil: string | null
  score_credibilite?: number
  nb_etoiles?: number
  penalite_pourcentage?: number
}

type AuthCtx = {
  user: AuthUser | null
  token: string | null
  isLoggedIn: boolean
  login: (data: any) => void
  logout: () => void
  updateUser: (u: Partial<AuthUser>) => void
  hasRole: (role: string) => boolean
  rolesActifs: string[]
}

const AuthContext = createContext<AuthCtx>({
  user: null,
  token: null,
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
  updateUser: () => {},
  hasRole: () => false,
  rolesActifs: [],
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try { return JSON.parse(localStorage.getItem('rg_user') || 'null') }
    catch { return null }
  })
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('rg_token')
  )

  const login = (data: any) => {
    const u: AuthUser = data.user
    const t: string = data.access_token
    const rt: string = data.refresh_token
    setUser(u)
    setToken(t)
    localStorage.setItem('rg_user', JSON.stringify(u))
    localStorage.setItem('rg_token', t)
    localStorage.setItem('rg_refresh', rt)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('rg_user')
    localStorage.removeItem('rg_token')
    localStorage.removeItem('rg_refresh')
  }

  const updateUser = (partial: Partial<AuthUser>) => {
    if (!user) return
    const updated = { ...user, ...partial }
    setUser(updated)
    localStorage.setItem('rg_user', JSON.stringify(updated))
  }

  const rolesActifs: string[] = user?.roles_actifs ?? (user?.role ? [user.role] : [])

  const hasRole = (role: string) => rolesActifs.includes(role)

  useEffect(() => {}, [])

  return (
    <AuthContext.Provider value={{ user, token, isLoggedIn: !!token, login, logout, updateUser, hasRole, rolesActifs }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
