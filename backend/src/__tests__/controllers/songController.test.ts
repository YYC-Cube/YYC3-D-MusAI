import { Request, Response } from 'express'
import { createSong, deleteSong, getAllSongs, getSongById, toggleLikeSong, updateSong } from '../../controllers/songController'

jest.mock('../../models', () => ({
  Song: {
    findAndCountAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
  },
  User: {
    findByPk: jest.fn(),
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

jest.mock('../../utils/redis', () => ({
  cache: {
    del: jest.fn().mockResolvedValue(undefined),
    delPattern: jest.fn().mockResolvedValue(undefined),
  },
}))

import { Song, User } from '../../models'

describe('songController', () => {
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

  describe('getAllSongs', () => {
    it('should return paginated songs list', async () => {
      mockReq = { query: { page: '1', limit: '10' } }

      const mockSongs = [
        { id: '1', title: 'Song 1', artist: 'Artist 1' },
        { id: '2', title: 'Song 2', artist: 'Artist 2' },
      ]

        ; (Song.findAndCountAll as jest.Mock).mockResolvedValue({
          count: 2,
          rows: mockSongs,
        })

      await getAllSongs(mockReq as Request, mockRes as Response)

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            songs: mockSongs,
            pagination: expect.objectContaining({
              total: 2,
              page: 1,
              limit: 10,
            }),
          }),
        })
      )
    })

    it('should filter songs by search query', async () => {
      mockReq = { query: { search: 'test', page: '1', limit: '20' } }

        ; (Song.findAndCountAll as jest.Mock).mockResolvedValue({
          count: 1,
          rows: [{ id: '1', title: 'Test Song', artist: 'Test Artist' }],
        })

      await getAllSongs(mockReq as Request, mockRes as Response)

      expect(Song.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.any(Object),
        })
      )
    })

    it('should handle database errors', async () => {
      mockReq = { query: {} }
        ; (Song.findAndCountAll as jest.Mock).mockRejectedValue(new Error('DB Error'))

      await getAllSongs(mockReq as Request, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(500)
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({ code: 500 }),
        })
      )
    })
  })

  describe('getSongById', () => {
    it('should return song details', async () => {
      mockReq = { params: { id: '1' } }

      const mockSong = {
        id: '1',
        title: 'Test Song',
        increment: jest.fn().mockResolvedValue(undefined),
      }

        ; (Song.findByPk as jest.Mock).mockResolvedValue(mockSong)

      await getSongById(mockReq as Request, mockRes as Response)

      expect(mockSong.increment).toHaveBeenCalledWith('play_count')
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({ song: mockSong }),
        })
      )
    })

    it('should return 404 for non-existent song', async () => {
      mockReq = { params: { id: '999' } }
        ; (Song.findByPk as jest.Mock).mockResolvedValue(null)

      await getSongById(mockReq as Request, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(404)
    })
  })

  describe('createSong', () => {
    it('should create song successfully', async () => {
      mockReq = {
        body: {
          title: 'New Song',
          artist: 'New Artist',
          genre: 'Pop',
        },
        user: { id: 'user-1', role: 'user' },
        files: {
          audio: [{ path: '/uploads/audio.mp3' } as any],
          cover: [{ path: '/uploads/cover.jpg' } as any],
        },
      }

      const mockSong = { id: 'song-1', title: 'New Song' }
        ; (Song.create as jest.Mock).mockResolvedValue(mockSong)

      await createSong(mockReq as any, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(201)
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({ song: mockSong }),
        })
      )
    })

    it('should return 401 for unauthenticated user', async () => {
      mockReq = { body: { title: 'New Song' }, user: undefined }

      await createSong(mockReq as any, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(401)
    })

    it('should return 400 for invalid input', async () => {
      mockReq = {
        body: { title: '', artist: '' },
        user: { id: 'user-1' },
      }

      await createSong(mockReq as any, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(400)
    })

    it('should return 400 when no file or youtube_id', async () => {
      mockReq = {
        body: { title: 'New Song', artist: 'Artist' },
        user: { id: 'user-1' },
        files: undefined,
      }

      await createSong(mockReq as any, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(400)
    })
  })

  describe('updateSong', () => {
    it('should update song successfully', async () => {
      mockReq = {
        params: { id: '1' },
        body: { title: 'Updated Song' },
        user: { id: 'user-1', role: 'user' },
      }

      const mockSong = {
        id: '1',
        title: 'Old Song',
        uploaded_by: 'user-1',
        update: jest.fn().mockResolvedValue(undefined),
      }

        ; (Song.findByPk as jest.Mock).mockResolvedValue(mockSong)

      await updateSong(mockReq as any, mockRes as Response)

      expect(mockSong.update).toHaveBeenCalledWith({ title: 'Updated Song' })
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({ success: true })
      )
    })

    it('should return 403 for non-owner non-admin', async () => {
      mockReq = {
        params: { id: '1' },
        body: { title: 'Updated Song' },
        user: { id: 'user-2', role: 'user' },
      }

      const mockSong = {
        id: '1',
        uploaded_by: 'user-1',
      }

        ; (Song.findByPk as jest.Mock).mockResolvedValue(mockSong)

      await updateSong(mockReq as any, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(403)
    })

    it('should allow admin to update any song', async () => {
      mockReq = {
        params: { id: '1' },
        body: { title: 'Admin Updated' },
        user: { id: 'admin-1', role: 'admin' },
      }

      const mockSong = {
        id: '1',
        uploaded_by: 'user-1',
        update: jest.fn().mockResolvedValue(undefined),
      }

        ; (Song.findByPk as jest.Mock).mockResolvedValue(mockSong)

      await updateSong(mockReq as any, mockRes as Response)

      expect(mockSong.update).toHaveBeenCalled()
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({ success: true })
      )
    })
  })

  describe('deleteSong', () => {
    it('should delete song successfully', async () => {
      mockReq = {
        params: { id: '1' },
        user: { id: 'user-1', role: 'user' },
      }

      const mockSong = {
        id: '1',
        uploaded_by: 'user-1',
        destroy: jest.fn().mockResolvedValue(undefined),
      }

        ; (Song.findByPk as jest.Mock).mockResolvedValue(mockSong)

      await deleteSong(mockReq as any, mockRes as Response)

      expect(mockSong.destroy).toHaveBeenCalled()
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({ success: true })
      )
    })

    it('should return 404 for non-existent song', async () => {
      mockReq = {
        params: { id: '999' },
        user: { id: 'user-1', role: 'user' },
      }

        ; (Song.findByPk as jest.Mock).mockResolvedValue(null)

      await deleteSong(mockReq as any, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(404)
    })
  })

  describe('toggleLikeSong', () => {
    it('should like a song', async () => {
      mockReq = {
        params: { id: '1' },
        user: { id: 'user-1' },
      }

      const mockSong = {
        id: '1',
        increment: jest.fn().mockResolvedValue(undefined),
        decrement: jest.fn().mockResolvedValue(undefined),
      }

      const mockUser = {
        hasLikedSongs: jest.fn().mockResolvedValue(false),
        addLikedSongs: jest.fn().mockResolvedValue(undefined),
        removeLikedSongs: jest.fn().mockResolvedValue(undefined),
      }

        ; (Song.findByPk as jest.Mock).mockResolvedValue(mockSong)
        ; (User.findByPk as jest.Mock).mockResolvedValue(mockUser)

      await toggleLikeSong(mockReq as any, mockRes as Response)

      expect(mockUser.addLikedSongs).toHaveBeenCalledWith(mockSong)
      expect(mockSong.increment).toHaveBeenCalledWith('like_count')
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({ liked: true }),
        })
      )
    })

    it('should unlike a song', async () => {
      mockReq = {
        params: { id: '1' },
        user: { id: 'user-1' },
      }

      const mockSong = {
        id: '1',
        increment: jest.fn().mockResolvedValue(undefined),
        decrement: jest.fn().mockResolvedValue(undefined),
      }

      const mockUser = {
        hasLikedSongs: jest.fn().mockResolvedValue(true),
        addLikedSongs: jest.fn().mockResolvedValue(undefined),
        removeLikedSongs: jest.fn().mockResolvedValue(undefined),
      }

        ; (Song.findByPk as jest.Mock).mockResolvedValue(mockSong)
        ; (User.findByPk as jest.Mock).mockResolvedValue(mockUser)

      await toggleLikeSong(mockReq as any, mockRes as Response)

      expect(mockUser.removeLikedSongs).toHaveBeenCalledWith(mockSong)
      expect(mockSong.decrement).toHaveBeenCalledWith('like_count')
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({ liked: false }),
        })
      )
    })
  })
})
