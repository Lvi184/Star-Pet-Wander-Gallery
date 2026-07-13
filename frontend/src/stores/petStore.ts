import { create } from 'zustand'
import { eventBus, GAME_EVENTS } from '../game/eventBus'

export interface Pet {
  id: string
  user_id: string
  name: string
  species: string
  personality: Record<string, any>
  mood: number
  energy: number
  spiritual_power: number
  cultivation_level: number
  current_region: string | null
  inventory: string[]
  health: number
  status: string
  controller_type: 'player' | 'agent'
  controller_version: number
  last_active: string | null
  last_player_heartbeat: string | null
  affinity_map: Record<string, number>
  goals: any[]
}

interface PetState {
  pets: Pet[]
  selectedId: string | null
  loading: boolean
  error: string | null
  wsConnected: boolean
  wsReconnecting: boolean
  _ws: WebSocket | null
  _pollTimer: ReturnType<typeof setInterval> | null

  fetchPets: () => Promise<void>
  selectPet: (id: string) => void
  updatePet: (id: string, patch: Partial<Pet>) => void
  addPet: (pet: Pet) => void
  setError: (err: string | null) => void

  connectWebSocket: () => void
  disconnectWebSocket: () => void
  subscribeCharacter: (charId: string) => void
  unsubscribeCharacter: (charId: string) => void

  switchController: (id: string, mode: 'player' | 'agent') => Promise<void>
  createCharacter: (data: { name: string; species: string; personality?: string }) => Promise<Pet>
}

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

export const usePetStore = create<PetState>((set, get) => ({
  pets: [],
  selectedId: null,
  loading: false,
  error: null,
  wsConnected: false,
  wsReconnecting: false,
  _ws: null,
  _pollTimer: null,

  fetchPets: async () => {
    set({ loading: true, error: null })
    try {
      const res = await fetch(`${API_BASE}/character/user/demo-user`, {
        headers: { 'Content-Type': 'application/json' },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      const pets: Pet[] = Array.isArray(data) ? data : data.characters || []
      set({
        pets,
        selectedId: pets.length > 0 ? pets[0].id : null,
        loading: false,
      })
      if (pets.length > 0) {
        eventBus.emit(GAME_EVENTS.SPAWN_PET, { pets })
        eventBus.emit(GAME_EVENTS.FOCUS_PET, { petId: pets[0].id })
      }
    } catch (err: any) {
      set({ error: err.message || '获取宠物列表失败', loading: false })
    }
  },

  selectPet: (id: string) => {
    const { pets } = get()
    const pet = pets.find((p) => p.id === id)
    if (!pet || pet.status === 'dead') return
    set({ selectedId: id })
    eventBus.emit(GAME_EVENTS.FOCUS_PET, { petId: id })
  },

  updatePet: (id: string, patch: Partial<Pet>) => {
    set((state) => ({
      pets: state.pets.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }))
    if (patch.current_region) {
      eventBus.emit(GAME_EVENTS.MOVE_PET, { petId: id, region: patch.current_region })
    }
  },

  addPet: (pet: Pet) => {
    set((state) => ({ pets: [...state.pets, pet] }))
    eventBus.emit(GAME_EVENTS.SPAWN_PET, { pets: [pet] })
  },

  setError: (err: string | null) => set({ error: err }),

  connectWebSocket: () => {
    const { _ws, wsConnected } = get()
    if (_ws || wsConnected) return

    const clientId = 'demo-user-' + Math.random().toString(36).slice(2, 8)
    const wsUrl = (API_BASE + '/ws/' + clientId).replace('http://', 'ws://').replace('https://', 'wss://')

    try {
      const ws = new WebSocket(wsUrl)
      set({ _ws: ws, wsReconnecting: false })

      ws.onopen = () => {
        set({ wsConnected: true, wsReconnecting: false, error: null })
        const { pets, _pollTimer } = get()
        if (_pollTimer) {
          clearInterval(_pollTimer)
          set({ _pollTimer: null })
        }
        pets.forEach((p) => {
          ws.send(JSON.stringify({ action: 'subscribe', char_id: p.id }))
        })
      }

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data)
          if (msg.type === 'pet_update' && msg.pet_id) {
            get().updatePet(msg.pet_id, msg.data || msg)
            eventBus.emit(GAME_EVENTS.STATUS_UPDATE, msg)
          } else if (msg.type === 'heartbeat') {
          }
        } catch (e) {}
      }

      ws.onclose = () => {
        set({ wsConnected: false, _ws: null })
        const { _pollTimer } = get()
        if (!_pollTimer) {
          const timer = setInterval(() => {
            get().fetchPets()
          }, 8000)
          set({ _pollTimer: timer })
        }
        setTimeout(() => {
          const { wsConnected } = get()
          if (!wsConnected) {
            set({ wsReconnecting: true })
            get().connectWebSocket()
          }
        }, 5000)
      }

      ws.onerror = () => {}
    } catch (err: any) {
      set({ error: 'WebSocket 连接失败' })
    }
  },

  disconnectWebSocket: () => {
    const { _ws, _pollTimer } = get()
    if (_ws) {
      _ws.close()
      set({ _ws: null, wsConnected: false })
    }
    if (_pollTimer) {
      clearInterval(_pollTimer)
      set({ _pollTimer: null })
    }
  },

  subscribeCharacter: (charId: string) => {
    const { _ws, wsConnected } = get()
    if (_ws && wsConnected) {
      _ws.send(JSON.stringify({ action: 'subscribe', char_id: charId }))
    }
  },

  unsubscribeCharacter: (charId: string) => {
    const { _ws, wsConnected } = get()
    if (_ws && wsConnected) {
      _ws.send(JSON.stringify({ action: 'unsubscribe', char_id: charId }))
    }
  },

  switchController: async (id: string, mode: 'player' | 'agent') => {
    const endpoint = mode === 'player' ? 'takeover' : 'release'
    const res = await fetch(`${API_BASE}/character/${id}/control/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || `切换失败 (${res.status})`)
    }
    const data = await res.json()
    get().updatePet(id, {
      controller_type: data.controller_type,
      controller_version: data.controller_version,
    })
    eventBus.emit(GAME_EVENTS.CONTROL_CHANGE, {
      petId: id,
      controllerType: data.controller_type,
    })
  },

  createCharacter: async (data) => {
    const res = await fetch(`${API_BASE}/character`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: 'demo-user',
        name: data.name,
        species: data.species,
        personality: data.personality || '灵动狡黠',
      }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || `创建失败 (${res.status})`)
    }
    const newPet = await res.json()
    get().addPet(newPet)
    get().subscribeCharacter(newPet.id)
    return newPet
  },
}))
