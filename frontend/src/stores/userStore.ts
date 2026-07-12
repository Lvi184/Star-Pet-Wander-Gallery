import { create } from 'zustand'

interface UserState {
  userId: string | null
  nickname: string
  avatar: string
  isLogin: boolean
  token: string | null
  setUser: (user: Partial<UserState>) => void
  logout: () => void
}

export const useUserStore = create<UserState>((set) => ({
  userId: null,
  nickname: '漫游者',
  avatar: '',
  isLogin: false,
  token: null,
  setUser: (user) => set((state) => ({ ...state, ...user, isLogin: true })),
  logout: () => set({ userId: null, nickname: '漫游者', avatar: '', isLogin: false, token: null }),
}))
