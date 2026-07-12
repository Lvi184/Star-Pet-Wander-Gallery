import { useEffect, useRef } from 'react'

export function useSSE(url: string, onMessage: (data: unknown) => void) {
  const esRef = useRef<EventSource | null>(null)

  useEffect(() => {
    const es = new EventSource(url)
    esRef.current = es

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        onMessage(data)
      } catch {
        onMessage(event.data)
      }
    }

    es.onerror = () => {
      console.warn('SSE 连接断开，5秒后重连')
      es.close()
    }

    return () => {
      es.close()
    }
  }, [url])

  return esRef
}
