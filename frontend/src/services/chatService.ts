import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '@/stores/authStore'

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  window.location.hostname === 'localhost'
    ? 'http://localhost:25101'
    : `${window.location.protocol}//${window.location.host}`

type ChatEventHandlers = {
  onMessage?: (message: any) => void
  onUserJoined?: (user: any) => void
  onUserLeft?: (user: any) => void
  onUserTyping?: (user: any) => void
  onStopTyping?: (userId: string) => void
  onSongShared?: (data: any) => void
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: any) => void
}

class ChatService {
  private socket: Socket | null = null
  private eventHandlers: ChatEventHandlers = {}
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve()
        return
      }

      const { token } = useAuthStore.getState()

      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        auth: { token },
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        timeout: 5000,
      })

      this.socket.on('connect', () => {
        console.log('WebSocket已连接')
        this.reconnectAttempts = 0

        // 自动认证
        if (token) {
          this.authenticate(token)
        }

        this.eventHandlers.onConnect?.()
        resolve()
      })

      this.socket.on('disconnect', () => {
        console.log('WebSocket已断开')
        this.eventHandlers.onDisconnect?.()
      })

      this.socket.on('connect_error', (error) => {
        console.error('WebSocket连接错误:', error)
        this.reconnectAttempts++
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          reject(new Error('无法连接到聊天服务器'))
        }
        
        this.eventHandlers.onError?.(error)
      })

      this.setupEventListeners()
    })
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  private setupEventListeners(): void {
    if (!this.socket) return

    this.socket.on('new_message', (message) => {
      this.eventHandlers.onMessage?.(message)
    })

    this.socket.on('user_joined', (data) => {
      this.eventHandlers.onUserJoined?.(data)
    })

    this.socket.on('user_left', (data) => {
      this.eventHandlers.onUserLeft?.(data)
    })

    this.socket.on('user_typing', (data) => {
      this.eventHandlers.onUserTyping?.(data)
    })

    this.socket.on('user_stop_typing', (data) => {
      this.eventHandlers.onStopTyping?.(data.userId)
    })

    this.socket.on('song_shared', (data) => {
      this.eventHandlers.onSongShared?.(data)
    })

    this.socket.on('error', (error) => {
      this.eventHandlers.onError?.(error)
    })
  }

  authenticate(token: string): void {
    this.socket?.emit('authenticate', token)
  }

  joinRoom(roomId: string): void {
    this.socket?.emit('join_room', roomId)
  }

  leaveRoom(): void {
    this.socket?.emit('leave_room')
  }

  sendMessage(content: string, type: 'text' | 'song' = 'text', songId?: string): void {
    this.socket?.emit('send_message', { content, type, songId })
  }

  sendTyping(): void {
    this.socket?.emit('typing')
  }

  stopTyping(): void {
    this.socket?.emit('stop_typing')
  }

  getOnlineUsers(): void {
    this.socket?.emit('get_online_users')
  }

  getRoomInfo(roomId: string): void {
    this.socket?.emit('get_room_info', roomId)
  }

  on(event: keyof ChatEventHandlers, handler: any): void {
    this.eventHandlers[event] = handler as any
  }

  off(event: keyof ChatEventHandlers): void {
    delete this.eventHandlers[event]
  }

  isConnected(): boolean {
    return this.socket?.connected || false
  }
}

export const chatService = new ChatService()
export default chatService
