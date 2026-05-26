import jwt from 'jsonwebtoken'
import { Server, Socket } from 'socket.io'
import ChatService from '../../services/chatService'

jest.mock('jsonwebtoken')
jest.mock('../../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
}))

describe('ChatService', () => {
  let mockIo: Partial<Server>
  let mockSocket: Partial<Socket>
  let eventHandlers: Record<string, Function>
  let chatService: ChatService

  beforeEach(() => {
    eventHandlers = {}
    mockSocket = {
      id: 'socket-1',
      emit: jest.fn(),
      join: jest.fn(),
      leave: jest.fn(),
      to: jest.fn().mockReturnThis(),
      on: jest.fn((event: string, handler: Function) => {
        eventHandlers[event] = handler
        return mockSocket as Socket
      }),
    }

    mockIo = {
      on: jest.fn((event: string, handler: Function) => {
        if (event === 'connection') {
          handler(mockSocket)
        }
        return mockIo as Server
      }),
      emit: jest.fn(),
      to: jest.fn().mockReturnThis(),
    }

    jest.clearAllMocks()
    chatService = new ChatService(mockIo as Server)
  })

  describe('connection', () => {
    it('should setup event handlers on connection', () => {
      expect(mockIo.on).toHaveBeenCalledWith('connection', expect.any(Function))
      expect(mockSocket.on).toHaveBeenCalledWith('authenticate', expect.any(Function))
      expect(mockSocket.on).toHaveBeenCalledWith('join_room', expect.any(Function))
      expect(mockSocket.on).toHaveBeenCalledWith('leave_room', expect.any(Function))
      expect(mockSocket.on).toHaveBeenCalledWith('send_message', expect.any(Function))
      expect(mockSocket.on).toHaveBeenCalledWith('typing', expect.any(Function))
      expect(mockSocket.on).toHaveBeenCalledWith('stop_typing', expect.any(Function))
      expect(mockSocket.on).toHaveBeenCalledWith('get_online_users', expect.any(Function))
      expect(mockSocket.on).toHaveBeenCalledWith('get_room_info', expect.any(Function))
      expect(mockSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function))
    })
  })

  describe('authenticate', () => {
    it('should authenticate user with valid token', () => {
      const mockUser = { userId: 'user-1', username: 'testuser', email: 'test@test.com' }
        ; (jwt.verify as jest.Mock).mockReturnValue(mockUser)

      eventHandlers['authenticate']('valid-token')

      expect(jwt.verify).toHaveBeenCalledWith('valid-token', expect.any(String))
      expect(mockSocket.emit).toHaveBeenCalledWith('authenticated', {
        success: true,
        user: { userId: 'user-1', username: 'testuser' },
      })
      expect(mockIo.emit).toHaveBeenCalledWith('user_online', expect.objectContaining({
        userId: 'user-1',
        username: 'testuser',
      }))
    })

    it('should reject authentication with invalid token', () => {
      ; (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token')
      })

      eventHandlers['authenticate']('invalid-token')

      expect(mockSocket.emit).toHaveBeenCalledWith('authenticated', {
        success: false,
        error: '认证失败',
      })
    })
  })

  describe('join_room', () => {
    it('should require authentication before joining room', () => {
      eventHandlers['join_room']('room-1')

      expect(mockSocket.emit).toHaveBeenCalledWith('error', { message: '请先认证' })
    })

    it('should join room after authentication', () => {
      const mockUser = { userId: 'user-1', username: 'testuser', email: 'test@test.com' }
        ; (jwt.verify as jest.Mock).mockReturnValue(mockUser)
      eventHandlers['authenticate']('valid-token')

      eventHandlers['join_room']('room-1')

      expect(mockSocket.join).toHaveBeenCalledWith('room-1')
      expect(mockSocket.emit).toHaveBeenCalledWith('joined_room', expect.objectContaining({
        roomId: 'room-1',
      }))
    })
  })

  describe('send_message', () => {
    it('should require room membership to send message', () => {
      eventHandlers['send_message']({ content: 'hello' })

      expect(mockSocket.emit).toHaveBeenCalledWith('error', { message: '请先加入房间' })
    })

    it('should broadcast message to room', () => {
      const mockUser = { userId: 'user-1', username: 'testuser', email: 'test@test.com' }
        ; (jwt.verify as jest.Mock).mockReturnValue(mockUser)
      eventHandlers['authenticate']('valid-token')
      eventHandlers['join_room']('room-1')

      eventHandlers['send_message']({ content: 'hello world', type: 'text' })

      expect(mockIo.to).toHaveBeenCalledWith('room-1')
    })

    it('should handle song sharing', () => {
      const mockUser = { userId: 'user-1', username: 'testuser', email: 'test@test.com' }
        ; (jwt.verify as jest.Mock).mockReturnValue(mockUser)
      eventHandlers['authenticate']('valid-token')
      eventHandlers['join_room']('room-1')

      eventHandlers['send_message']({ content: 'check this song', type: 'song', songId: 'song-1' })

      expect(mockIo.to).toHaveBeenCalledWith('room-1')
    })
  })

  describe('typing', () => {
    it('should broadcast typing status to room', () => {
      const mockUser = { userId: 'user-1', username: 'testuser', email: 'test@test.com' }
        ; (jwt.verify as jest.Mock).mockReturnValue(mockUser)
      eventHandlers['authenticate']('valid-token')
      eventHandlers['join_room']('room-1')

      eventHandlers['typing']()

      expect(mockSocket.to).toHaveBeenCalledWith('room-1')
    })
  })

  describe('get_online_users', () => {
    it('should return online users list', () => {
      const mockUser = { userId: 'user-1', username: 'testuser', email: 'test@test.com' }
        ; (jwt.verify as jest.Mock).mockReturnValue(mockUser)
      eventHandlers['authenticate']('valid-token')

      eventHandlers['get_online_users']()

      expect(mockSocket.emit).toHaveBeenCalledWith('online_users_list', expect.objectContaining({
        users: expect.any(Array),
        count: expect.any(Number),
      }))
    })
  })

  describe('disconnect', () => {
    it('should clean up on disconnect', () => {
      const mockUser = { userId: 'user-1', username: 'testuser', email: 'test@test.com' }
        ; (jwt.verify as jest.Mock).mockReturnValue(mockUser)
      eventHandlers['authenticate']('valid-token')
      eventHandlers['join_room']('room-1')

      // Reset mocks after join_room to only capture disconnect behavior
      jest.clearAllMocks()

      eventHandlers['disconnect']()

      expect(mockIo.emit).toHaveBeenCalledWith('user_offline', expect.objectContaining({
        userId: 'user-1',
      }))
    })
  })

  describe('getStats', () => {
    it('should return service statistics', () => {
      const stats = chatService.getStats()

      expect(stats).toHaveProperty('totalConnected')
      expect(stats).toHaveProperty('totalRooms')
      expect(stats).toHaveProperty('rooms')
      expect(typeof stats.totalConnected).toBe('number')
      expect(typeof stats.totalRooms).toBe('number')
    })
  })

  describe('edge cases', () => {
    it('should handle multiple users in same room', () => {
      const user1 = { userId: 'user-1', username: 'user1', email: 'u1@test.com' }
      const user2 = { userId: 'user-2', username: 'user2', email: 'u2@test.com' }

        ; (jwt.verify as jest.Mock).mockReturnValue(user1)
      eventHandlers['authenticate']('token-1')
      eventHandlers['join_room']('room-1')

      // Create second socket mock
      const mockSocket2 = {
        id: 'socket-2',
        emit: jest.fn(),
        join: jest.fn(),
        leave: jest.fn(),
        to: jest.fn().mockReturnThis(),
        on: jest.fn(),
      }

      // Simulate second user connecting
      const connectHandler = (mockIo.on as jest.Mock).mock.calls.find(
        call => call[0] === 'connection'
      )?.[1]

      if (connectHandler) {
        connectHandler(mockSocket2)
      }

      ; (jwt.verify as jest.Mock).mockReturnValue(user2)
      if (eventHandlers['authenticate']) {
        eventHandlers['authenticate']('token-2')
      }
      if (eventHandlers['join_room']) {
        eventHandlers['join_room']('room-1')
      }

      const stats = chatService.getStats()
      expect(stats.totalConnected).toBeGreaterThanOrEqual(1)
    })

    it('should handle user leaving room without joining', () => {
      const mockUser = { userId: 'user-1', username: 'testuser', email: 'test@test.com' }
        ; (jwt.verify as jest.Mock).mockReturnValue(mockUser)
      eventHandlers['authenticate']('valid-token')

      // User leaves without joining any room
      jest.clearAllMocks()
      eventHandlers['leave_room']()

      // Should not throw error
      expect(mockSocket.leave).not.toHaveBeenCalled()
    })

    it('should handle typing without room membership', () => {
      const mockUser = { userId: 'user-1', username: 'testuser', email: 'test@test.com' }
        ; (jwt.verify as jest.Mock).mockReturnValue(mockUser)
      eventHandlers['authenticate']('valid-token')

      jest.clearAllMocks()
      eventHandlers['typing']()

      // Should not broadcast when not in room
      expect(mockSocket.to).not.toHaveBeenCalled()
    })

    it('should handle stop_typing without room membership', () => {
      const mockUser = { userId: 'user-1', username: 'testuser', email: 'test@test.com' }
        ; (jwt.verify as jest.Mock).mockReturnValue(mockUser)
      eventHandlers['authenticate']('valid-token')

      jest.clearAllMocks()
      eventHandlers['stop_typing']()

      // Should not broadcast when not in room
      expect(mockSocket.to).not.toHaveBeenCalled()
    })

    it('should handle get_room_info for non-existent room', () => {
      eventHandlers['get_room_info']('non-existent-room')

      expect(mockSocket.emit).toHaveBeenCalledWith('room_info', expect.objectContaining({
        roomId: 'non-existent-room',
        users: [],
        userCount: 0,
      }))
    })

    it('should handle disconnect without authentication', () => {
      jest.clearAllMocks()
      eventHandlers['disconnect']()

      // Should not throw error when disconnecting unauthenticated user
      expect(mockIo.emit).not.toHaveBeenCalled()
    })

    it('should handle send_message with missing content', () => {
      const mockUser = { userId: 'user-1', username: 'testuser', email: 'test@test.com' }
        ; (jwt.verify as jest.Mock).mockReturnValue(mockUser)
      eventHandlers['authenticate']('valid-token')
      eventHandlers['join_room']('room-1')

      jest.clearAllMocks()
      eventHandlers['send_message']({ content: '', type: 'text' })

      // Should still broadcast empty message
      expect(mockIo.to).toHaveBeenCalledWith('room-1')
    })

    it('should handle rapid room switches', () => {
      const mockUser = { userId: 'user-1', username: 'testuser', email: 'test@test.com' }
        ; (jwt.verify as jest.Mock).mockReturnValue(mockUser)
      eventHandlers['authenticate']('valid-token')

      // Join multiple rooms rapidly
      eventHandlers['join_room']('room-1')
      eventHandlers['join_room']('room-2')
      eventHandlers['join_room']('room-3')

      // Should only be in the last room
      expect(mockSocket.join).toHaveBeenLastCalledWith('room-3')
    })
  })
})
