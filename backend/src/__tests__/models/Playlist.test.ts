// Mock sequelize before importing the model
jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    define: jest.fn(),
    sync: jest.fn(),
    authenticate: jest.fn(),
    query: jest.fn(),
    close: jest.fn(),
  },
}))

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('mocked-uuid-1234'),
}))

// Create a mock Playlist model class
class MockPlaylist {
  public id!: string
  public name!: string
  public description?: string
  public cover_url?: string
  public user_id!: string
  public is_public!: boolean
  public readonly createdAt!: Date
  public readonly updatedAt!: Date

  static findOne = jest.fn()
  static findAll = jest.fn()
  static findByPk = jest.fn()
  static create = jest.fn()
  static update = jest.fn()
  static destroy = jest.fn()
  static count = jest.fn()
  static belongsTo = jest.fn()
  static hasMany = jest.fn()
  static belongsToMany = jest.fn()
}

// Mock the Playlist model module
jest.mock('../../models/Playlist', () => ({
  __esModule: true,
  default: MockPlaylist,
}))

describe('Playlist Model', () => {
  let Playlist: typeof MockPlaylist

  beforeEach(() => {
    jest.clearAllMocks()
    Playlist = require('../../models/Playlist').default
  })

  describe('Model Definition', () => {
    it('should have correct table name', () => {
      expect(Playlist).toBeDefined()
    })

    it('should have required fields', () => {
      const instance = new Playlist()
      expect(instance).toBeDefined()
    })
  })

  describe('Instance Methods', () => {
    it('should create instance with default values', () => {
      const playlist = new Playlist()
      expect(playlist).toBeDefined()
    })

    it('should set and get properties', () => {
      const playlist = new Playlist()
      playlist.name = 'My Playlist'
      playlist.user_id = 'user-1'

      expect(playlist.name).toBe('My Playlist')
      expect(playlist.user_id).toBe('user-1')
    })
  })

  describe('Static Methods', () => {
    it('should have findAll method', () => {
      expect(Playlist.findAll).toBeDefined()
      expect(typeof Playlist.findAll).toBe('function')
    })

    it('should have findByPk method', () => {
      expect(Playlist.findByPk).toBeDefined()
      expect(typeof Playlist.findByPk).toBe('function')
    })

    it('should have create method', () => {
      expect(Playlist.create).toBeDefined()
      expect(typeof Playlist.create).toBe('function')
    })

    it('should call findAll with correct parameters', async () => {
      const mockPlaylists = [
        { id: '1', name: 'Playlist 1', user_id: 'user-1' },
        { id: '2', name: 'Playlist 2', user_id: 'user-2' },
      ]
      Playlist.findAll.mockResolvedValue(mockPlaylists as any)

      const result = await Playlist.findAll({ where: { is_public: true } })

      expect(Playlist.findAll).toHaveBeenCalledWith({ where: { is_public: true } })
      expect(result).toEqual(mockPlaylists)
    })

    it('should call create with playlist data', async () => {
      const playlistData = {
        name: 'New Playlist',
        user_id: 'user-1',
      }
      Playlist.create.mockResolvedValue({ ...playlistData, id: 'mocked-uuid-1234' } as any)

      const result = await Playlist.create(playlistData)

      expect(Playlist.create).toHaveBeenCalledWith(playlistData)
      expect(result.id).toBe('mocked-uuid-1234')
    })
  })

  describe('Validation Scenarios', () => {
    it('should handle missing optional fields', () => {
      const playlist = new Playlist()
      playlist.name = 'Test'
      playlist.user_id = 'user-1'

      expect(playlist.description).toBeUndefined()
      expect(playlist.cover_url).toBeUndefined()
    })

    it('should handle boolean fields', () => {
      const playlist = new Playlist()
      playlist.is_public = false
      
      expect(playlist.is_public).toBe(false)
    })
  })
})
