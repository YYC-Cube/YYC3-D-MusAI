import { Router } from 'express'
import { authMiddleware } from '../middleware/auth'
import {
  getRecommendations,
  getAvailableStrategies,
} from '../controllers/recommendationController'

const router = Router()

// 所有推荐接口都需要认证
router.use(authMiddleware)

// 获取个性化推荐
router.get('/', getRecommendations)

// 获取可用推荐策略列表
router.get('/strategies', getAvailableStrategies)

export default router
