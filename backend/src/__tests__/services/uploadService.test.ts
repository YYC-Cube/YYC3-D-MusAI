import multer from 'multer'
import * as uploadService from '../../services/uploadService'

describe('uploadService', () => {
  describe('getFileUrl', () => {
    it('should generate correct file URL', () => {
      const filePath = './uploads/audio/test.mp3'
      const url = uploadService.getFileUrl(filePath)

      expect(url).toBe('/api/files/audio/test.mp3')
    })

    it('should handle Windows-style paths', () => {
      const filePath = '.\\uploads\\audio\\test.mp3'
      const url = uploadService.getFileUrl(filePath)

      expect(url).toBe('/api/files/audio/test.mp3')
    })
  })

  describe('handleUploadError', () => {
    const mockRes = () => ({
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    })

    it('should handle LIMIT_FILE_SIZE error', () => {
      const res = mockRes()
      const error = new multer.MulterError('LIMIT_FILE_SIZE')

      uploadService.handleUploadError(error, {} as any, res as any, jest.fn())

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 400,
          message: expect.stringContaining('文件大小超过限制'),
        }),
      }))
    })

    it('should handle LIMIT_FILE_COUNT error', () => {
      const res = mockRes()
      const error = new multer.MulterError('LIMIT_FILE_COUNT')

      uploadService.handleUploadError(error, {} as any, res as any, jest.fn())

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          message: '上传文件数量超过限制',
        }),
      }))
    })

    it('should handle LIMIT_UNEXPECTED_FILE error', () => {
      const res = mockRes()
      const error = new multer.MulterError('LIMIT_UNEXPECTED_FILE')

      uploadService.handleUploadError(error, {} as any, res as any, jest.fn())

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          message: '意外的文件字段',
        }),
      }))
    })

    it('should handle unsupported file type error', () => {
      const res = mockRes()
      const error = new Error('不支持的文件类型: video/mp4')

      uploadService.handleUploadError(error, {} as any, res as any, jest.fn())

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          message: '不支持的文件类型: video/mp4',
        }),
      }))
    })

    it('should pass other errors to next middleware', () => {
      const res = mockRes()
      const next = jest.fn()
      const error = new Error('Some other error')

      uploadService.handleUploadError(error, {} as any, res as any, next)

      expect(next).toHaveBeenCalledWith(error)
    })
  })

  describe('cleanupOldFiles', () => {
    it('should delete files older than maxAgeDays', async () => {
      const fs = require('fs')
      const mockFiles = ['old1.mp3', 'old2.mp3', 'new.mp3']
      fs.existsSync = jest.fn().mockReturnValue(true)
      fs.readdirSync = jest.fn().mockReturnValue(mockFiles)
      fs.statSync = jest.fn().mockImplementation((filePath: string) => ({
        isFile: () => true,
        mtime: filePath.includes('new') ? new Date() : new Date('2020-01-01'),
      }))
      fs.unlinkSync = jest.fn()

      const deletedCount = await uploadService.cleanupOldFiles(30)

      expect(deletedCount).toBe(6)
      expect(fs.unlinkSync).toHaveBeenCalledTimes(6)
    })

    it('should handle non-existent directories', async () => {
      const fs = require('fs')
      fs.existsSync = jest.fn().mockReturnValue(false)

      const deletedCount = await uploadService.cleanupOldFiles(30)

      expect(deletedCount).toBe(0)
    })

    it('should skip directories during cleanup', async () => {
      const fs = require('fs')
      fs.existsSync = jest.fn().mockReturnValue(true)
      fs.readdirSync = jest.fn().mockReturnValue(['subdir'])
      fs.statSync = jest.fn().mockReturnValue({
        isFile: () => false,
        mtime: new Date('2020-01-01'),
      })
      fs.unlinkSync = jest.fn()

      const deletedCount = await uploadService.cleanupOldFiles(30)

      expect(deletedCount).toBe(0)
      expect(fs.unlinkSync).not.toHaveBeenCalled()
    })

    it('should handle cleanup errors gracefully', async () => {
      const fs = require('fs')
      fs.existsSync = jest.fn().mockReturnValue(true)
      fs.readdirSync = jest.fn().mockImplementation(() => {
        throw new Error('Permission denied')
      })

      await expect(uploadService.cleanupOldFiles(30)).rejects.toThrow('Permission denied')
    })
  })
})
