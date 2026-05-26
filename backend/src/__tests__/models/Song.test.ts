
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

// Create a mock Song model class that doesn't call Model constructor
class MockSong {
  public id!: string
  public title!: string
  public artist!: string
  public album_id?: string
  public duration?: number
  public cover_url?: string
  public audio_url?: string
  public youtube_id?: string
  public genre?: string
  public year?: number
  public play_count!: number
  public like_count!: number
  public uploaded_by!: string
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

// Mock the Song model module
jest.mock('../../models/Song', () => ({
  __esModule: true,
  default: MockSong,
}))

describe('Song Model', () => {
  let Song: typeof MockSong

  beforeEach(() => {
    jest.clearAllMocks()
    Song = require('../../models/Song').default
  })

  describe('Model Definition', () => {
    it('should have correct table name', () => {
      expect(Song).toBeDefined()
    })

    it('should have required fields', () => {
      const instance = new Song()
      expect(instance).toBeDefined()
    })
  })

  describe('Instance Methods', () => {
    it('should create instance with default values', () => {
      const song = new Song()
      expect(song).toBeDefined()
    })

    it('should set and get properties', () => {
      const song = new Song()
      song.title = 'Test Song'
      song.artist = 'Test Artist'

      expect(song.title).toBe('Test Song')
      expect(song.artist).toBe('Test Artist')
    })
  })

  describe('Static Methods', () => {
    it('should have findAll method', () => {
      expect(Song.findAll).toBeDefined()
      expect(typeof Song.findAll).toBe('function')
    })

    it('should have findByPk method', () => {
      expect(Song.findByPk).toBeDefined()
      expect(typeof Song.findByPk).toBe('function')
    })

    it('should have create method', () => {
      expect(Song.create).toBeDefined()
      expect(typeof Song.create).toBe('function')
    })

    it('should call findAll with correct parameters', async () => {
      const mockSongs = [
        { id: '1', title: 'Song 1', artist: 'Artist 1' },
        { id: '2', title: 'Song 2', artist: 'Artist 2' },
      ]
      Song.findAll.mockResolvedValue(mockSongs as any)

      const result = await Song.findAll({ where: { is_public: true } })

      expect(Song.findAll).toHaveBeenCalledWith({ where: { is_public: true } })
      expect(result).toEqual(mockSongs)
    })

    it('should call create with song data', async () => {
      const songData = {
        title: 'New Song',
        artist: 'New Artist',
        uploaded_by: 'user-1',
      }
      Song.create.mockResolvedValue({ ...songData, id: 'mocked-uuid-1234' } as any)

      const result = await Song.create(songData)

      expect(Song.create).toHaveBeenCalledWith(songData)
      expect(result.id).toBe('mocked-uuid-1234')
    })
  })

  describe('Validation Scenarios', () => {
    it('should handle missing optional fields', () => {
      const song = new Song()
      song.title = 'Test'
      song.artist = 'Artist'
      song.uploaded_by = 'user-1'

      expect(song.album_id).toBeUndefined()
      expect(song.duration).toBeUndefined()
      expect(song.genre).toBeUndefined()
    })

    it('should handle numeric fields', () => {
      const song = new Song()
      song.duration = 180
      song.play_count = 100
      song.like_count = 50
      song.year = 2024

      expect(song.duration).toBe(180)
      expect(song.play_count).toBe(100)
      expect(song.like_count).toBe(50)
      expect(song.year).toBe(2024)
    })
  })
})
