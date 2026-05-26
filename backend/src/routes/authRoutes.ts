import { Router } from 'express'
import * as authController from '../controllers/authController'
import { authMiddleware } from '../middleware/auth'

const router = Router()

// 公开路由
router.post('/register', authController.register)
router.post('/login', authController.login)
router.post('/refresh', authController.refreshToken)

// 需要认证的路由
router.get('/profile', authMiddleware, authController.getProfile)
router.put('/profile', authMiddleware, authController.updateProfile)
router.post('/avatar', authMiddleware, authController.uploadAvatar)
router.post('/logout', authMiddleware, authController.logout)
router.post('/logout-all', authMiddleware, authController.logoutAllDevices)
router.post('/change-password', authMiddleware, authController.changePassword)

export default router
