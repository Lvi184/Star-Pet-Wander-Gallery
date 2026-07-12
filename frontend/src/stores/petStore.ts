import { create } from 'zustand'

interface PetState {
  petId: string
  name: string
  species: string
  mood: number
  energy: number
  currentRegion: string | null
  inventory: string[]
  loading: boolean
  setPet: (pet: Partial<PetState>) => void
  updateStatus: (status: Partial<PetState>) => void
}

export const usePetStore = create<PetState>((set) => ({
  petId: 'demo-pet-001',
  name: '小星',
  species: '星灵猫',
  mood: 75,
  energy: 60,
  currentRegion: 'star-forest',
  inventory: ['星光石', '月牙草'],
  loading: false,
  setPet: (pet) => set((state) => ({ ...state, ...pet })),
  updateStatus: (status) => set((state) => ({ ...state, ...status })),
}))
