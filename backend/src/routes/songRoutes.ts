import { Router } from 'express'
import * as songController from '../controllers/songController'
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth'
import { uploadAudio, handleUploadError } from '../services/uploadService'
import { cacheMiddleware } from '../utils/redis'

const router = Router()

// 公开路由 - 带缓存
router.get('/', optionalAuthMiddleware, cacheMiddleware(300), songController.getAllSongs)
router.get('/hot', optionalAuthMiddleware, cacheMiddleware(600), songController.getHotSongs)
router.get('/:id', optionalAuthMiddleware, cacheMiddleware(600), songController.getSongById)

// 需要认证的路由
router.post(
  '/',
  authMiddleware,
  uploadAudio,
  handleUploadError,
  songController.createSong
)

router.put(
  '/:id',
  authMiddleware,
  uploadAudio,
  handleUploadError,
  songController.updateSong
)

router.delete('/:id', authMiddleware, songController.deleteSong)
router.post('/:id/like', authMiddleware, songController.toggleLikeSong)

export default router
