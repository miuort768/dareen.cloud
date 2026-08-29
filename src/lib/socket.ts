import { io, Socket } from 'socket.io-client'
import { SOCKET_EVENTS } from './socket-events'

class SocketService {
  private socket: Socket | null = null
  private activeRooms: Set<string> = new Set()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 10
  private presenceInterval: ReturnType<typeof setInterval> | null = null

  private startPresencePing() {
    if (this.presenceInterval) return
    this.presenceInterval = setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit(SOCKET_EVENTS.PRESENCE_PING)
      }
    }, 20000)
  }

  connect() {
    const token = localStorage.getItem('auth_token')
    if (!token) return null

    if (!this.socket) {
      const origin = window.location.origin
      this.socket = io(origin, {
        path: '/api/socket.io',
        transports: ['polling', 'websocket'],
        autoConnect: true,
        auth: { token },
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 10000,
        timeout: 30000,
      })

      this.socket.on(SOCKET_EVENTS.CONNECT, () => {
        this.reconnectAttempts = 0
        this.activeRooms.forEach((roomId) => {
          this.socket?.emit(SOCKET_EVENTS.JOIN_CONVERSATION, roomId)
        })
      })

      this.startPresencePing()

      this.socket.on(SOCKET_EVENTS.CONNECT_ERROR, (err) => {
        if (err.message === 'Authentication error') {
          console.error('Socket auth failed')
          this.reconnectAttempts++
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            this.socket?.disconnect()
            this.socket = null
            this.reconnectAttempts = 0
            return
          }
          return
        }
        console.error('Socket connection error:', err.message)
      })
    } else {
      const currentToken = (this.socket.auth as { token?: string })?.token
      if (currentToken !== token) {
        this.socket.auth = { token }
        if (this.socket.connected) {
          this.socket.disconnect().connect()
        }
      }
    }
    return this.socket
  }

  getSocket() {
    if (this.socket?.connected) return this.socket
    return this.connect()
  }

  joinConversation(id: string) {
    this.activeRooms.add(id)
    this.getSocket()?.emit(SOCKET_EVENTS.JOIN_CONVERSATION, id)
  }

  leaveConversation(id: string) {
    this.activeRooms.delete(id)
    this.getSocket()?.emit(SOCKET_EVENTS.LEAVE_CONVERSATION, id)
  }

  disconnect() {
    this.activeRooms.clear()
    this.reconnectAttempts = 0
    if (this.presenceInterval) {
      clearInterval(this.presenceInterval)
      this.presenceInterval = null
    }
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }
}

export const socketService = new SocketService()
