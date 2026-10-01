export interface AuthUser {
  id: string
  name: string
  email: string
  role: string
  avatar: string
  district: string
  token: string
}

const AUTH_STORAGE_KEY = 'civiccycle_auth_user'

export const DEMO_ACCOUNTS = [
  {
    role: 'Operations Lead (Admin)',
    email: 'admin@civiccycle.com',
    password: 'admin123',
    name: 'Jordan Smith',
    avatar: 'JS',
    district: 'San Francisco Municipal HQ'
  },
  {
    role: 'Fleet Dispatcher',
    email: 'supervisor@civiccycle.com',
    password: 'civic2026',
    name: 'Elena Rostova',
    avatar: 'ER',
    district: 'Portola & SOMA Sector'
  },
  {
    role: 'MRF Plant Engineer',
    email: 'operator@civiccycle.com',
    password: 'clean2026',
    name: 'Marcus Vance',
    avatar: 'MV',
    district: 'Pier 96 Recovery Facility'
  }
]

export const authService = {
  getUser(): AuthUser | null {
    try {
      const data = localStorage.getItem(AUTH_STORAGE_KEY)
      return data ? JSON.parse(data) : null
    } catch {
      return null
    }
  },

  isAuthenticated(): boolean {
    return !!this.getUser()?.token
  },

  async login(email: string, password: string): Promise<AuthUser> {
    // 1. Try calling the backend /api/auth/login endpoint
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.user) {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data.user))
          return data.user
        }
      } else {
        const errorData = await response.json().catch(() => null)
        if (errorData?.message) {
          throw new Error(errorData.message)
        }
      }
    } catch (err: any) {
      if (err.message && !err.message.includes('fetch')) {
        throw err
      }
      // If network/offline or mock server, fall through to client-side credential verification
    }

    // 2. Client-side fallback authentication
    const knownAccount = DEMO_ACCOUNTS.find(
      acc => acc.email.toLowerCase() === email.trim().toLowerCase()
    )

    if (knownAccount) {
      if (knownAccount.password !== password) {
        throw new Error(`Incorrect password for ${knownAccount.name}. Use demo password: ${knownAccount.password}`)
      }
      const user: AuthUser = {
        id: `usr_${Date.now()}`,
        name: knownAccount.name,
        email: knownAccount.email,
        role: knownAccount.role,
        avatar: knownAccount.avatar,
        district: knownAccount.district,
        token: `jwt_civic_${btoa(email)}_${Date.now()}`
      }
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
      return user
    }

    // Generic fallback for any username if credentials match demo format
    if (email.includes('@') && password.length >= 6) {
      const name = email.split('@')[0].replace('.', ' ')
      const formattedName = name.charAt(0).toUpperCase() + name.slice(1)
      const user: AuthUser = {
        id: `usr_${Date.now()}`,
        name: formattedName,
        email,
        role: 'Field Officer',
        avatar: (formattedName[0] || 'U').toUpperCase(),
        district: 'San Francisco Municipal',
        token: `jwt_civic_${btoa(email)}_${Date.now()}`
      }
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
      return user
    }

    throw new Error('Invalid email or password. Use demo account: admin@civiccycle.com / admin123')
  },

  logout(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }
}
