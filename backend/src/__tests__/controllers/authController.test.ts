import { Request, Response } from 'express'
import { login, register } from '../../controllers/authController'

jest.mock('../../models', () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}))

jest.mock('../../utils/logger', () => ({
  error: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
}))

import { User } from '../../models'

describe('authController', () => {
  let mockReq: Partial<Request>
  let mockRes: Partial<Response>
  let jsonMock: jest.Mock
  let statusMock: jest.Mock

  beforeEach(() => {
    jsonMock = jest.fn().mockReturnThis()
    statusMock = jest.fn().mockReturnValue({ json: jsonMock })
    mockRes = {
      status: statusMock,
      json: jsonMock,
    }
    jest.clearAllMocks()
  })

  describe('register', () => {
    it('should register a new user successfully', async () => {
      mockReq = {
        body: {
          email: 'test@example.com',
          username: 'testuser',
          password: 'password123',
        },
      }

      const mockUser = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'test@example.com',
        username: 'testuser',
        avatar: null,
        role: 'user',
      }

        ; (User.findOne as jest.Mock).mockResolvedValue(null)
        ; (User.create as jest.Mock).mockResolvedValue(mockUser)

      await register(mockReq as Request, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(201)
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            token: expect.any(String),
            user: expect.objectContaining({
              id: mockUser.id,
              email: mockUser.email,
            }),
          }),
        })
      )
    })

    it('should return 400 for invalid input', async () => {
      mockReq = {
        body: {
          email: 'invalid-email',
          username: 't',
          password: '123',
        },
      }

      await register(mockReq as Request, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(400)
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 400,
          }),
        })
      )
    })

    it('should return 409 for existing user', async () => {
      mockReq = {
        body: {
          email: 'existing@example.com',
          username: 'existing',
          password: 'password123',
        },
      }

        ; (User.findOne as jest.Mock).mockResolvedValue({
          email: 'existing@example.com',
          username: 'existing',
        })

      await register(mockReq as Request, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(409)
    })
  })

  describe('login', () => {
    it('should login with valid credentials', async () => {
      mockReq = {
        body: {
          email: 'test@example.com',
          password: 'password123',
        },
      }

      const mockUser = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'test@example.com',
        username: 'testuser',
        role: 'user',
        is_active: true,
        comparePassword: jest.fn().mockResolvedValue(true),
      }

        ; (User.findOne as jest.Mock).mockResolvedValue(mockUser)

      await login(mockReq as Request, mockRes as Response)

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            token: expect.any(String),
            user: expect.objectContaining({
              id: mockUser.id,
              email: mockUser.email,
            }),
          }),
        })
      )
    })

    it('should return 401 for invalid credentials', async () => {
      mockReq = {
        body: {
          email: 'test@example.com',
          password: 'wrongpassword',
        },
      }

      const mockUser = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'test@example.com',
        comparePassword: jest.fn().mockResolvedValue(false),
      }

        ; (User.findOne as jest.Mock).mockResolvedValue(mockUser)

      await login(mockReq as Request, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(401)
    })

    it('should return 401 for non-existent user', async () => {
      mockReq = {
        body: {
          email: 'nonexistent@example.com',
          password: 'password123',
        },
      }

        ; (User.findOne as jest.Mock).mockResolvedValue(null)

      await login(mockReq as Request, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(401)
    })

    it('should return 403 for inactive account', async () => {
      mockReq = {
        body: {
          email: 'inactive@example.com',
          password: 'password123',
        },
      }

      const mockUser = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'inactive@example.com',
        is_active: false,
        comparePassword: jest.fn().mockResolvedValue(true),
      }

        ; (User.findOne as jest.Mock).mockResolvedValue(mockUser)

      await login(mockReq as Request, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(403)
    })
  })
})
