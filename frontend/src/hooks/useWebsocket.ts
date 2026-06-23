import { useEffect, useState, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '../stores/authStore'

export const useWebSocket = (namespace: string = '') => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<string | null>(null)
  const { accessToken } = useAuthStore()
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!accessToken) return

    const socketUrl = import.meta.env.VITE_WS_URL || 'http://localhost:8000'
    const newSocket = io(`${socketUrl}/${namespace}`, {
      transports: ['websocket'],
      auth: { token: accessToken },
    })

    newSocket.on('connect', () => {
      console.log(`WebSocket connected to ${namespace}`)
      setIsConnected(true)
    })

    newSocket.on('disconnect', () => {
      console.log(`WebSocket disconnected from ${namespace}`)
      setIsConnected(false)
    })

    newSocket.on('message', (data) => {
      setLastMessage(JSON.stringify(data))
    })

    newSocket.on('notification', (data) => {
      setLastMessage(JSON.stringify(data))
    })

    socketRef.current = newSocket
    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
      socketRef.current = null
    }
  }, [accessToken, namespace])

  const sendMessage = (event: string, data: any) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(event, data)
    }
  }

  return { socket, isConnected, lastMessage, sendMessage }
}