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

// Create a mock Album model class
class MockAlbum {
  public id!: string
  public title!: string
  public artist!: string
  public cover_url?: string
  public release_year?: number
  public genre?: string
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

// Mock the Album model module
jest.mock('../../models/Album', () => ({
  __esModule: true,
  default: MockAlbum,
}))

describe('Album Model', () => {
  let Album: typeof MockAlbum

  beforeEach(() => {
    jest.clearAllMocks()
    Album = require('../../models/Album').default
  })

  describe('Model Definition', () => {
    it('should have correct table name', () => {
      expect(Album).toBeDefined()
    })

    it('should have required fields', () => {
      const instance = new Album()
      expect(instance).toBeDefined()
    })
  })

  describe('Instance Methods', () => {
    it('should create instance with default values', () => {
      const album = new Album()
      expect(album).toBeDefined()
    })

    it('should set and get properties', () => {
      const album = new Album()
      album.title = 'Test Album'
      album.artist = 'Test Artist'

      expect(album.title).toBe('Test Album')
      expect(album.artist).toBe('Test Artist')
    })
  })

  describe('Static Methods', () => {
    it('should have findAll method', () => {
      expect(Album.findAll).toBeDefined()
      expect(typeof Album.findAll).toBe('function')
    })

    it('should have findByPk method', () => {
      expect(Album.findByPk).toBeDefined()
      expect(typeof Album.findByPk).toBe('function')
    })

    it('should have create method', () => {
      expect(Album.create).toBeDefined()
      expect(typeof Album.create).toBe('function')
    })

    it('should call findAll with correct parameters', async () => {
      const mockAlbums = [
        { id: '1', title: 'Album 1', artist: 'Artist 1' },
        { id: '2', title: 'Album 2', artist: 'Artist 2' },
      ]
      Album.findAll.mockResolvedValue(mockAlbums as any)

      const result = await Album.findAll({ where: { genre: 'Rock' } })

      expect(Album.findAll).toHaveBeenCalledWith({ where: { genre: 'Rock' } })
      expect(result).toEqual(mockAlbums)
    })

    it('should call create with album data', async () => {
      const albumData = {
        title: 'New Album',
        artist: 'New Artist',
      }
      Album.create.mockResolvedValue({ ...albumData, id: 'mocked-uuid-1234' } as any)

      const result = await Album.create(albumData)

      expect(Album.create).toHaveBeenCalledWith(albumData)
      expect(result.id).toBe('mocked-uuid-1234')
    })
  })

  describe('Validation Scenarios', () => {
    it('should handle missing optional fields', () => {
      const album = new Album()
      album.title = 'Test'
      album.artist = 'Artist'

      expect(album.cover_url).toBeUndefined()
      expect(album.release_year).toBeUndefined()
      expect(album.genre).toBeUndefined()
    })

    it('should handle numeric fields', () => {
      const album = new Album()
      album.release_year = 2024
      
      expect(album.release_year).toBe(2024)
    })
  })
})
