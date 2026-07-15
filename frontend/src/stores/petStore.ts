import { create } from 'zustand'
import { eventBus, GAME_EVENTS } from '../game/eventBus'
import { getMockPets, createMockPet } from './petMockData'
import { useGameStore } from '../game/engine/gameStore'

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
  x: number
  y: number
  last_active: string | null
  last_player_heartbeat: string | null
  affinity_map: Record<string, number>
  goals: any[]
}

export interface ExploreEvent {
  id: string
  char_id: string
  action_type: string
  location: string
  detail: string
  cause_chain: string[]
  result: Record<string, any>
  timestamp: string | null
  created_at: string | null
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
  events: ExploreEvent[]

  fetchPets: () => Promise<void>
  selectPet: (id: string) => void
  updatePet: (id: string, patch: Partial<Pet>) => void
  addPet: (pet: Pet) => void
  setError: (err: string | null) => void
  fetchEvents: (charId: string) => Promise<void>
  addEvent: (event: ExploreEvent) => void
  clearEvents: () => void

  connectWebSocket: () => void
  disconnectWebSocket: () => void
  subscribeCharacter: (charId: string) => void
  unsubscribeCharacter: (charId: string) => void

  switchController: (id: string, mode: 'player' | 'agent') => Promise<void>
  createCharacter: (data: { name: string; species: string; personality?: string }) => Promise<Pet>
}

const API_BASE = import.meta.env.VITE_API_BASE || '/'

export const usePetStore = create<PetState>((set, get) => ({
  pets: [],
  selectedId: null,
  loading: false,
  error: null,
  wsConnected: false,
  wsReconnecting: false,
  _ws: null,
  _pollTimer: null,
  events: [],

  fetchPets: async () => {
    set({ loading: true, error: null })
    try {
      const res = await fetch(`${API_BASE}character/user/demo-user`, {
        headers: { 'Content-Type': 'application/json' },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      const remotePets: Pet[] = Array.isArray(data) ? data : data.value || data.characters || []
      
      const { pets: currentPets } = get()
      const mergedPets = remotePets.map((remotePet) => {
        const localPet = currentPets.find((p) => p.id === remotePet.id)
        if (localPet && localPet.controller_version > (remotePet.controller_version || 0)) {
          return { ...remotePet, controller_type: localPet.controller_type, controller_version: localPet.controller_version }
        }
        return remotePet
      })
      
      set({
        pets: mergedPets,
        selectedId: mergedPets.length > 0 ? mergedPets[0].id : null,
        loading: false,
      })
      if (mergedPets.length > 0) {
        eventBus.emit(GAME_EVENTS.SPAWN_PET, { pets: mergedPets })
        eventBus.emit(GAME_EVENTS.FOCUS_PET, { petId: mergedPets[0].id })
      }
    } catch (err: any) {
      console.warn('API不可用，使用Mock数据:', err.message)
      const remotePets = getMockPets()
      
      const { pets: currentPets } = get()
      const mergedPets = remotePets.map((remotePet) => {
        const localPet = currentPets.find((p) => p.id === remotePet.id)
        if (localPet && localPet.controller_version > (remotePet.controller_version || 0)) {
          return { ...remotePet, controller_type: localPet.controller_type, controller_version: localPet.controller_version }
        }
        return remotePet
      })
      
      set({
        pets: mergedPets,
        selectedId: mergedPets.length > 0 ? mergedPets[0].id : null,
        loading: false,
        error: null,
      })
      if (mergedPets.length > 0) {
        eventBus.emit(GAME_EVENTS.SPAWN_PET, { pets: mergedPets })
        eventBus.emit(GAME_EVENTS.FOCUS_PET, { petId: mergedPets[0].id })
      }
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
    if (patch.x !== undefined || patch.y !== undefined) {
      useGameStore.getState().updatePlayer(id, {
        position: {
          x: patch.x !== undefined ? patch.x : useGameStore.getState().players.get(id)?.position.x || 10,
          y: patch.y !== undefined ? patch.y : useGameStore.getState().players.get(id)?.position.y || 10,
        },
      })
    }
  },

  addPet: (pet: Pet) => {
    set((state) => ({ pets: [...state.pets, pet] }))
    eventBus.emit(GAME_EVENTS.SPAWN_PET, { pets: [pet] })
  },

  setError: (err: string | null) => set({ error: err }),

  fetchEvents: async (charId: string) => {
    try {
      const res = await fetch(`${API_BASE}character/${charId}/events`, {
        headers: { 'Content-Type': 'application/json' },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: ExploreEvent[] = await res.json()
      set({ events: data })
    } catch (err: any) {
      console.warn('获取探索事件失败:', err.message)
      set({ events: [] })
    }
  },

  addEvent: (event: ExploreEvent) => {
    set((state) => ({
      events: [event, ...state.events.slice(0, 19)],
    }))
  },

  clearEvents: () => set({ events: [] }),

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
            const updateData = msg.data || msg
            get().updatePet(msg.pet_id, {
              ...updateData,
              x: updateData.x,
              y: updateData.y,
            })
            eventBus.emit(GAME_EVENTS.STATUS_UPDATE, msg)
          } else if (msg.type === 'pet_event' && msg.event) {
            get().addEvent(msg.event)
            eventBus.emit(GAME_EVENTS.PET_EVENT, msg)
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
    try {
      const endpoint = mode === 'player' ? 'takeover' : 'release'
      const res = await fetch(`${API_BASE}character/${id}/control/${endpoint}`, {
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
    } catch (err: any) {
      console.warn('API不可用，使用Mock切换控制:', err.message)
      get().updatePet(id, {
        controller_type: mode,
        controller_version: Date.now(),
      })
      eventBus.emit(GAME_EVENTS.CONTROL_CHANGE, {
        petId: id,
        controllerType: mode,
      })
    }
  },

  createCharacter: async (data) => {
    try {
      const res = await fetch(`${API_BASE}character`, {
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
    } catch (err: any) {
      console.warn('API不可用，使用Mock创建宠物:', err.message)
      const newPet = createMockPet(data)
      get().addPet(newPet)
      get().subscribeCharacter(newPet.id)
      return newPet
    }
  },
}))
