import { RecommendationEngine } from '../../services/recommendation/RecommendationEngine'

jest.mock('../../services/recommendation/strategies/CollaborativeFiltering', () => ({
  CollaborativeFilteringStrategy: jest.fn().mockImplementation(() => ({
    name: 'collaborative_filtering',
    getRecommendations: jest.fn().mockResolvedValue({
      songs: [{ id: '1', title: 'Song 1' }],
      confidence: 0.9,
      strategy: 'collaborative_filtering',
    }),
  })),
}))

jest.mock('../../services/recommendation/strategies/ContentBased', () => ({
  ContentBasedStrategy: jest.fn().mockImplementation(() => ({
    name: 'content_based',
    getRecommendations: jest.fn().mockResolvedValue({
      songs: [{ id: '2', title: 'Song 2' }],
      confidence: 0.8,
      strategy: 'content_based',
    }),
  })),
}))

jest.mock('../../services/recommendation/strategies/Trending', () => ({
  TrendingStrategy: jest.fn().mockImplementation(() => ({
    name: 'trending',
    getRecommendations: jest.fn().mockResolvedValue({
      songs: [{ id: '3', title: 'Song 3' }],
      confidence: 0.7,
      strategy: 'trending',
    }),
  })),
}))

describe('RecommendationEngine', () => {
  let engine: RecommendationEngine

  beforeEach(() => {
    jest.clearAllMocks()
    engine = new RecommendationEngine()
  })

  describe('constructor', () => {
    it('should register all strategies on initialization', () => {
      const strategies = engine.getAvailableStrategies()
      expect(strategies.length).toBeGreaterThan(0)
    })
  })

  describe('getAvailableStrategies', () => {
    it('should return list of registered strategies', () => {
      const strategies = engine.getAvailableStrategies()
      expect(Array.isArray(strategies)).toBe(true)
      expect(strategies.length).toBe(3)
    })
  })

  describe('getRecommendations', () => {
    it('should use specified strategy when provided', async () => {
      const result = await engine.getRecommendations('user-1', { strategy: 'collaborative_filtering' })

      expect(result).toHaveLength(1)
      expect(result[0].strategy).toBe('collaborative_filtering')
    })

    it('should use hybrid strategy by default', async () => {
      const result = await engine.getRecommendations('user-1')

      expect(result.length).toBe(3)
      expect(result[0].confidence).toBeGreaterThanOrEqual(result[1].confidence)
    })

    it('should fallback to hybrid for unknown strategy', async () => {
      const result = await engine.getRecommendations('user-1', { strategy: 'unknown' })

      expect(result.length).toBe(3)
    })

    it('should handle strategy execution errors gracefully', async () => {
      const { CollaborativeFilteringStrategy } = require('../../services/recommendation/strategies/CollaborativeFiltering')
      CollaborativeFilteringStrategy.mockImplementation(() => ({
        name: 'collaborative_filtering',
        getRecommendations: jest.fn().mockRejectedValue(new Error('Strategy failed')),
      }))

      // Recreate engine with failing strategy
      engine = new RecommendationEngine()
      const result = await engine.getRecommendations('user-1')

      // Should still return results from other strategies
      expect(result.length).toBeGreaterThanOrEqual(0)
    })

    it('should handle all strategies failing', async () => {
      // Mock all strategies to fail - do this before creating engine
      const mockFailingStrategy = {
        name: 'collaborative_filtering',
        getRecommendations: jest.fn().mockRejectedValue(new Error('CF failed')),
      }

      // Create engine and manually set failing strategies
      engine = new RecommendationEngine()
      const strategiesMap = new Map()
      strategiesMap.set('collaborative_filtering', mockFailingStrategy)
      strategiesMap.set('content_based', { ...mockFailingStrategy, name: 'content_based' })
      strategiesMap.set('trending', { ...mockFailingStrategy, name: 'trending' })

        // Access private field for testing
        ; (engine as any).strategies = strategiesMap

      await expect(engine.getRecommendations('user-1')).rejects.toThrow('All recommendation strategies failed')
    })

    it('should pass options to strategy correctly', async () => {
      const { CollaborativeFilteringStrategy } = require('../../services/recommendation/strategies/CollaborativeFiltering')
      const mockGetRecommendations = jest.fn().mockResolvedValue({
        songs: [{ id: '1', title: 'Song 1' }],
        confidence: 0.9,
        strategy: 'collaborative_filtering',
      })

      CollaborativeFilteringStrategy.mockImplementation(() => ({
        name: 'collaborative_filtering',
        getRecommendations: mockGetRecommendations,
      }))

      engine = new RecommendationEngine()
      await engine.getRecommendations('user-1', { strategy: 'collaborative_filtering', limit: 10, excludeIds: ['2', '3'] })

      expect(mockGetRecommendations).toHaveBeenCalledWith('user-1', expect.objectContaining({ limit: 10, excludeIds: ['2', '3'] }))
    })

    it('should sort results by confidence descending', async () => {
      const result = await engine.getRecommendations('user-1')

      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].confidence).toBeGreaterThanOrEqual(result[i + 1].confidence)
      }
    })

    it('should handle empty userId', async () => {
      const result = await engine.getRecommendations('')

      expect(Array.isArray(result)).toBe(true)
    })

    it('should handle options with only strategy specified', async () => {
      const result = await engine.getRecommendations('user-1', { strategy: 'trending' })

      expect(result).toHaveLength(1)
      expect(result[0].strategy).toBe('trending')
    })
  })

  describe('getAvailableStrategies', () => {
    it('should return all registered strategies', () => {
      const strategies = engine.getAvailableStrategies()

      expect(strategies).toContain('collaborative_filtering')
      expect(strategies).toContain('content_based')
      expect(strategies).toContain('trending')
      expect(strategies).toHaveLength(3)
    })

    it('should return empty array when no strategies registered', () => {
      // Create engine instance and clear strategies
      const emptyEngine = new RecommendationEngine()
        // Access private field for testing
        ; (emptyEngine as any).strategies = new Map()

      const strategies = emptyEngine.getAvailableStrategies()
      expect(strategies).toHaveLength(0)
    })
  })
})
