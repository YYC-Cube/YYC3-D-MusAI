import { io, Socket } from 'socket.io-client'
import * as SecureStore from 'expo-secure-store'

const SOCKET_URL = process.env.EXPO_PUBLIC_API_BASE_URL?.replace('/api', '') || 'http://localhost:25101'

export interface ChatMessage {
  id: string
  roomId: string
  userId: string
  username: string
  content: string
  timestamp: string
  type: 'text' | 'song' | 'system'
}

export interface OnlineUser {
  userId: string
  username: string
  currentRoom?: string
}

class SocketService {
  private socket: Socket | null = null
  private messageHandlers: Array<(msg: ChatMessage) => void> = []
  private userJoinHandlers: Array<(data: { userId: string; username: string }) => void> = []
  private userLeaveHandlers: Array<(data: { userId: string; username: string }) => void> = []
  private onlineCountHandlers: Array<(count: number) => void> = []
  private typingHandlers: Array<(data: { userId: string; username: string }) => void> = []

  async connect(): Promise<boolean> {
    return new Promise(async (resolve) => {
      const token = await SecureStore.getItemAsync('auth_token')

      this.socket = io(SOCKET_URL, {
        transports: ['websocket'],
        timeout: 10000,
      })

      this.socket.on('connect', () => {
        console.log('Socket connected:', this.socket?.id)
        if (token) {
          this.socket?.emit('authenticate', token)
        }
        resolve(true)
      })

      this.socket.on('connect_error', (error: any) => {
        console.error('Socket connection error:', (error as Error).message)
        resolve(false)
      })

      this.socket.on('authenticated', (data: any) => {
        if (data.success) {
          console.log('Socket authenticated:', data.user)
        }
      })

      this.socket.on('new_message', (message: any) => {
        this.messageHandlers.forEach((handler) => handler(message))
      })

      this.socket.on('user_joined', (data: any) => {
        this.userJoinHandlers.forEach((handler) => handler(data))
      })

      this.socket.on('user_left', (data: any) => {
        this.userLeaveHandlers.forEach((handler) => handler(data))
      })

      this.socket.on('user_online', (data: any) => {
        this.onlineCountHandlers.forEach((handler) => handler(data.onlineCount))
      })

      this.socket.on('user_offline', (data: any) => {
        this.onlineCountHandlers.forEach((handler) => handler(data.onlineCount))
      })

      this.socket.on('user_typing', (data: any) => {
        this.typingHandlers.forEach((handler) => handler(data))
      })

      this.socket.on('disconnect', () => {
        console.log('Socket disconnected')
      })
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  joinRoom(roomId: string) {
    this.socket?.emit('join_room', roomId)
  }

  leaveRoom() {
    this.socket?.emit('leave_room')
  }

  sendMessage(content: string, type: 'text' | 'song' = 'text', songId?: string) {
    this.socket?.emit('send_message', { content, type, songId })
  }

  startTyping() {
    this.socket?.emit('typing')
  }

  stopTyping() {
    this.socket?.emit('stop_typing')
  }

  onMessage(handler: (msg: ChatMessage) => void) {
    this.messageHandlers.push(handler)
    return () => {
      this.messageHandlers = this.messageHandlers.filter((h) => h !== handler)
    }
  }

  onUserJoin(handler: (data: { userId: string; username: string }) => void) {
    this.userJoinHandlers.push(handler)
    return () => {
      this.userJoinHandlers = this.userJoinHandlers.filter((h) => h !== handler)
    }
  }

  onUserLeave(handler: (data: { userId: string; username: string }) => void) {
    this.userLeaveHandlers.push(handler)
    return () => {
      this.userLeaveHandlers = this.userLeaveHandlers.filter((h) => h !== handler)
    }
  }

  onOnlineCountChange(handler: (count: number) => void) {
    this.onlineCountHandlers.push(handler)
    return () => {
      this.onlineCountHandlers = this.onlineCountHandlers.filter((h) => h !== handler)
    }
  }

  onTyping(handler: (data: { userId: string; username: string }) => void) {
    this.typingHandlers.push(handler)
    return () => {
      this.typingHandlers = this.typingHandlers.filter((h) => h !== handler)
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false
  }
}

export const socketService = new SocketService()
export default socketService
