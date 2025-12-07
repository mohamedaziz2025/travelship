import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: 'sender' | 'shipper' | 'both' | 'admin'
  adminRole?: 'superadmin' | 'moderator'
  avatarUrl?: string
  verified: boolean
  badges: string[]
  stats: {
    matches: number
    rating: number
    completed: number
  }
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      logout: () => {
        localStorage.removeItem('accessToken')
        set({ user: null, isAuthenticated: false })
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)

interface UIState {
  isSidebarOpen: boolean
  isSearchOpen: boolean
  toggleSidebar: () => void
  toggleSearch: () => void
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: true,
  isSearchOpen: false,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
}))
