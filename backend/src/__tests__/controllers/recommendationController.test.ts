import { Request, Response } from 'express'
import { getRecommendations, getAvailableStrategies } from '../../controllers/recommendationController'

jest.mock('../../services/recommendation', () => ({
  recommendationEngine: {
    getRecommendations: jest.fn(),
    getAvailableStrategies: jest.fn(),
  },
}))

jest.mock('../../utils/logger', () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
  },
}))

import { recommendationEngine } from '../../services/recommendation'

describe('recommendationController', () => {
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

  describe('getRecommendations', () => {
    it('should return recommendations for authenticated user', async () => {
      mockReq = {
        user: { id: 'user-1', role: 'user' },
        query: { count: '10' },
      }

      const mockRecommendations = [
        { id: '1', title: 'Song 1', artist: 'Artist 1', confidence: 0.9 },
        { id: '2', title: 'Song 2', artist: 'Artist 2', confidence: 0.8 },
      ]

      ;(recommendationEngine.getRecommendations as jest.Mock).mockResolvedValue(mockRecommendations)

      await getRecommendations(mockReq as any, mockRes as Response)

      expect(recommendationEngine.getRecommendations).toHaveBeenCalledWith('user-1', {
        count: 10,
        strategy: undefined,
        timeWindow: undefined,
      })
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            recommendations: mockRecommendations,
          }),
        })
      )
    })

    it('should return 401 for unauthenticated user', async () => {
      mockReq = { user: undefined, query: {} }

      await getRecommendations(mockReq as any, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(401)
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({ code: 401 }),
        })
      )
    })

    it('should return 400 for invalid count parameter', async () => {
      mockReq = {
        user: { id: 'user-1', role: 'user' },
        query: { count: '100' },
      }

      await getRecommendations(mockReq as any, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(400)
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({ code: 400, message: expect.stringContaining('1-50') }),
        })
      )
    })

    it('should handle recommendation engine errors', async () => {
      mockReq = {
        user: { id: 'user-1', role: 'user' },
        query: {},
      }

      ;(recommendationEngine.getRecommendations as jest.Mock).mockRejectedValue(new Error('Engine error'))

      await getRecommendations(mockReq as any, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(500)
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({ code: 500 }),
        })
      )
    })

    it('should pass strategy and timeWindow parameters', async () => {
      mockReq = {
        user: { id: 'user-1', role: 'user' },
        query: {
          count: '5',
          strategy: 'collaborative_filtering',
          timeWindow: 'week',
        },
      }

      const mockRecommendations = [{ id: '1', title: 'Song 1', confidence: 0.9 }]
      ;(recommendationEngine.getRecommendations as jest.Mock).mockResolvedValue(mockRecommendations)

      await getRecommendations(mockReq as any, mockRes as Response)

      expect(recommendationEngine.getRecommendations).toHaveBeenCalledWith('user-1', {
        count: 5,
        strategy: 'collaborative_filtering',
        timeWindow: 'week',
      })
    })
  })

  describe('getAvailableStrategies', () => {
    it('should return available strategies', async () => {
      mockReq = {}

      const mockStrategies = [
        { name: 'collaborative_filtering', description: '协同过滤' },
        { name: 'content_based', description: '基于内容' },
      ]

      ;(recommendationEngine.getAvailableStrategies as jest.Mock).mockReturnValue(mockStrategies)

      await getAvailableStrategies(mockReq as Request, mockRes as Response)

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            strategies: mockStrategies,
          }),
        })
      )
    })

    it('should handle errors when getting strategies', async () => {
      mockReq = {}

      ;(recommendationEngine.getAvailableStrategies as jest.Mock).mockImplementation(() => {
        throw new Error('Strategy error')
      })

      await getAvailableStrategies(mockReq as Request, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(500)
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({ code: 500 }),
        })
      )
    })
  })
})
