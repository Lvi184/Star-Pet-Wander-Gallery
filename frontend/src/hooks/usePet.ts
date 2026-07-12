import { useEffect, useState } from 'react'
import { usePetStore } from '../stores/petStore'
import { petApi } from '../services/api'

interface OfflineSyncResult {
  offline_duration: number
  events_generated: number
  current_status: {
    mood: number
    energy: number
    location: string
    inventory: string[]
  }
  events: Array<{
    event_type: string
    location: string
    detail: string
    mood_change: number
    energy_change: number
    items_found: string[]
  }>
}

export function usePet(petId: string) {
  const pet = usePetStore()
  const [offlineResult, setOfflineResult] = useState<OfflineSyncResult | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function syncOffline() {
      const lastOnline = localStorage.getItem('last_online_time')
      const now = new Date().toISOString()
      
      if (lastOnline) {
        setIsSyncing(true)
        try {
          const { data } = await petApi.sync(petId, lastOnline)
          if (!cancelled && data.events_generated > 0) {
            setOfflineResult(data)
            pet.updateStatus({
              mood: data.current_status.mood,
              energy: data.current_status.energy,
              currentRegion: data.current_status.location,
              inventory: data.current_status.inventory,
            })
          }
        } catch (e) {
          console.warn('离线同步失败')
        } finally {
          setIsSyncing(false)
        }
      }
      
      localStorage.setItem('last_online_time', now)
    }

    async function fetchStatus() {
      try {
        const { data } = await petApi.getStatus(petId)
        if (!cancelled) {
          pet.updateStatus({
            name: data.name,
            species: data.species,
            mood: data.mood,
            energy: data.energy,
            currentRegion: data.current_region,
            inventory: data.inventory || [],
          })
        }
      } catch (e) {
        console.warn('获取宠物状态失败，使用本地数据')
      }
    }

    syncOffline()
    fetchStatus()
    const timer = setInterval(fetchStatus, 30000)
    
    const handleBeforeUnload = () => {
      localStorage.setItem('last_online_time', new Date().toISOString())
    }
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      cancelled = true
      clearInterval(timer)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      localStorage.setItem('last_online_time', new Date().toISOString())
    }
  }, [petId])

  const dismissOfflineReport = () => {
    setOfflineResult(null)
  }

  return { ...pet, offlineResult, isSyncing, dismissOfflineReport }
}
