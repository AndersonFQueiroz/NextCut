import { useEffect, useMemo, useRef, useState } from 'react'

const RECONNECT_DELAY_MS = 3000

function normalizePhone(phone) {
  return String(phone || '').replace(/\D/g, '')
}

function buildQueueSocketUrl() {
  const apiUrl = import.meta.env.VITE_API_URL || window.location.origin
  const url = new URL(apiUrl, window.location.origin)

  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
  url.pathname = '/ws/queue'
  url.search = ''
  url.hash = ''

  return url.toString()
}

function findEntryByPhone(snapshot, phone) {
  const normalizedPhone = normalizePhone(phone)

  if (!normalizedPhone || !Array.isArray(snapshot?.entries)) {
    return null
  }

  return snapshot.entries.find((entry) => normalizePhone(entry.clientPhone) === normalizedPhone) || null
}

export default function useQueueSocket(phone) {
  const [queueEntry, setQueueEntry] = useState(null)
  const [status, setStatus] = useState(phone ? 'connecting' : 'idle')
  const [hasSnapshot, setHasSnapshot] = useState(false)
  const reconnectTimerRef = useRef(null)
  const socketRef = useRef(null)
  const normalizedPhone = useMemo(() => normalizePhone(phone), [phone])

  useEffect(() => {
    if (!normalizedPhone) {
      setQueueEntry(null)
      setStatus('idle')
      setHasSnapshot(false)
      return undefined
    }

    let isActive = true

    function clearReconnectTimer() {
      if (reconnectTimerRef.current) {
        window.clearTimeout(reconnectTimerRef.current)
        reconnectTimerRef.current = null
      }
    }

    function connect() {
      clearReconnectTimer()
      setStatus((currentStatus) => (currentStatus === 'reconnecting' ? currentStatus : 'connecting'))

      const socket = new WebSocket(buildQueueSocketUrl())
      socketRef.current = socket

      socket.onopen = () => {
        if (isActive) {
          setStatus('connected')
        }
      }

      socket.onmessage = (event) => {
        if (!isActive || typeof event.data !== 'string') {
          return
        }

        try {
          const snapshot = JSON.parse(event.data)
          setQueueEntry(findEntryByPhone(snapshot, normalizedPhone))
          setHasSnapshot(true)
          setStatus('connected')
        } catch {
          setStatus('error')
        }
      }

      socket.onclose = () => {
        if (!isActive) {
          return
        }

        setStatus('reconnecting')
        reconnectTimerRef.current = window.setTimeout(connect, RECONNECT_DELAY_MS)
      }

      socket.onerror = () => {
        socket.close()
      }
    }

    setQueueEntry(null)
    setHasSnapshot(false)
    connect()

    return () => {
      isActive = false
      clearReconnectTimer()

      if (socketRef.current) {
        socketRef.current.close()
      }
    }
  }, [normalizedPhone])

  return {
    queueEntry,
    hasSnapshot,
    isConnected: status === 'connected',
    isReconnecting: status === 'reconnecting',
    status,
  }
}
