import jwt from 'jsonwebtoken'
import { Server, Socket } from 'socket.io'
import { JWT_SECRET } from '../config'
import logger from '../utils/logger'

interface ConnectedUser {
  socketId: string
  userId: string
  username: string
  room?: string
}

interface ChatMessage {
  id: string
  roomId: string
  userId: string
  username: string
  content: string
  timestamp: Date
  type: 'text' | 'song' | 'system'
}

class ChatService {
  private io: Server
  private connectedUsers: Map<string, ConnectedUser> = new Map()
  private rooms: Map<string, Set<string>> = new Map()

  constructor(io: Server) {
    this.io = io
    this.setupEventHandlers()
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket) => {
      logger.info(`用户连接: ${socket.id}`)

      // 认证处理
      socket.on('authenticate', async (token: string) => {
        try {
          const decoded = jwt.verify(token, JWT_SECRET) as any

          const user: ConnectedUser = {
            socketId: socket.id,
            userId: decoded.userId,
            username: decoded.username || decoded.email,
          }

          this.connectedUsers.set(socket.id, user)

          socket.emit('authenticated', {
            success: true,
            user: { userId: user.userId, username: user.username },
          })

          // 广播用户上线
          this.io.emit('user_online', {
            userId: user.userId,
            username: user.username,
            onlineCount: this.getOnlineCount(),
          })

        } catch (error) {
          socket.emit('authenticated', {
            success: false,
            error: '认证失败',
          })
        }
      })

      // 加入房间（音乐房间/歌单讨论）
      socket.on('join_room', (roomId: string) => {
        const user = this.connectedUsers.get(socket.id)

        if (!user) {
          socket.emit('error', { message: '请先认证' })
          return
        }

        // 离开之前的房间
        if (user.room) {
          socket.leave(user.room)
          this.removeFromRoom(user.room, socket.id)
        }

        // 加入新房间
        socket.join(roomId)
        user.room = roomId
        this.addToRoom(roomId, socket.id)

        const roomUsers = this.getRoomUsers(roomId)

        socket.emit('joined_room', {
          roomId,
          users: roomUsers,
          message: `已加入房间 ${roomId}`,
        })

        // 通知房间内其他用户
        socket.to(roomId).emit('user_joined', {
          userId: user.userId,
          username: user.username,
          roomUsersCount: roomUsers.length,
        })
      })

      // 离开房间
      socket.on('leave_room', () => {
        const user = this.connectedUsers.get(socket.id)

        if (user?.room) {
          socket.leave(user.room)
          this.removeFromRoom(user.room, socket.id)

          socket.to(user.room).emit('user_left', {
            userId: user.userId,
            username: user.username,
            roomUsersCount: this.getRoomUserCount(user.room),
          })

          user.room = undefined
        }
      })

      // 发送消息
      socket.on(
        'send_message',
        (data: { content: string; type?: 'text' | 'song'; songId?: string }) => {
          const user = this.connectedUsers.get(socket.id)

          if (!user || !user.room) {
            socket.emit('error', { message: '请先加入房间' })
            return
          }

          const message: ChatMessage = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            roomId: user.room,
            userId: user.userId,
            username: user.username,
            content: data.content,
            timestamp: new Date(),
            type: data.type || 'text',
          }

          // 广播消息到房间内的所有用户（包括发送者）
          this.io.to(user.room).emit('new_message', message)

          // 如果是分享歌曲，触发特殊事件
          if (data.type === 'song' && data.songId) {
            this.io.to(user.room).emit('song_shared', {
              messageId: message.id,
              songId: data.songId,
              sharedBy: user.username,
              timestamp: message.timestamp,
            })
          }
        }
      )

      // 正在输入状态
      socket.on('typing', () => {
        const user = this.connectedUsers.get(socket.id)

        if (user?.room) {
          socket.to(user.room).emit('user_typing', {
            userId: user.userId,
            username: user.username,
          })
        }
      })

      // 停止输入
      socket.on('stop_typing', () => {
        const user = this.connectedUsers.get(socket.id)

        if (user?.room) {
          socket.to(user.room).emit('user_stop_typing', {
            userId: user.userId,
          })
        }
      })

      // 获取在线用户列表
      socket.on('get_online_users', () => {
        const onlineUsers = Array.from(this.connectedUsers.values()).map((u) => ({
          userId: u.userId,
          username: u.username,
          currentRoom: u.room,
        }))

        socket.emit('online_users_list', {
          users: onlineUsers,
          count: onlineUsers.length,
        })
      })

      // 获取房间信息
      socket.on('get_room_info', (roomId: string) => {
        const users = this.getRoomUsers(roomId)

        socket.emit('room_info', {
          roomId,
          users,
          userCount: users.length,
        })
      })

      // 断开连接
      socket.on('disconnect', () => {
        logger.info(`用户断开连接: ${socket.id}`)
        this.handleDisconnect(socket)
      })
    })
  }

  private handleDisconnect(socket: Socket): void {
    const user = this.connectedUsers.get(socket.id)

    if (user) {
      // 从房间移除
      if (user.room) {
        this.removeFromRoom(user.room, socket.id)
        socket.to(user.room).emit('user_left', {
          userId: user.userId,
          username: user.username,
          roomUsersCount: this.getRoomUserCount(user.room),
        })
      }

      // 从在线列表移除
      this.connectedUsers.delete(socket.id)

      // 广播用户下线
      this.io.emit('user_offline', {
        userId: user.userId,
        username: user.username,
        onlineCount: this.getOnlineCount(),
      })
    }
  }

  private addToRoom(roomId: string, socketId: string): void {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set())
    }
    this.rooms.get(roomId)!.add(socketId)
  }

  private removeFromRoom(roomId: string, socketId: string): void {
    const room = this.rooms.get(roomId)

    if (room) {
      room.delete(socketId)

      if (room.size === 0) {
        this.rooms.delete(roomId)
      }
    }
  }

  private getRoomUsers(roomId: string): Array<{ userId: string; username: string }> {
    const room = this.rooms.get(roomId)

    if (!room) return []

    return Array.from(room)
      .map((socketId) => this.connectedUsers.get(socketId))
      .filter((u): u is ConnectedUser => !!u)
      .map((u) => ({ userId: u.userId, username: u.username }))
  }

  private getRoomUserCount(roomId: string): number {
    return this.rooms.get(roomId)?.size || 0
  }

  private getOnlineCount(): number {
    return this.connectedUsers.size
  }

  getStats() {
    return {
      totalConnected: this.connectedUsers.size,
      totalRooms: this.rooms.size,
      rooms: Object.fromEntries(
        Array.from(this.rooms.entries()).map(([roomId, sockets]) => [
          roomId,
          sockets.size,
        ])
      ),
    }
  }
}

export default ChatService
