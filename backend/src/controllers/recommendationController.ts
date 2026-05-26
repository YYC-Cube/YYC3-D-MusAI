import { Request, Response } from 'express'
import { recommendationEngine } from '../services/recommendation'
import type { RecommendationOptions } from '../types/recommendation'
import logger from '../utils/logger'

export async function getRecommendations(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as unknown as { user?: { id: string } }).user?.id

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { code: 401, message: '请先登录' },
      })
      return
    }

    const options: RecommendationOptions = {
      count: parseInt(req.query.count as string) || 10,
      strategy: req.query.strategy as string | undefined,
      timeWindow: req.query.timeWindow as 'day' | 'week' | 'month' | undefined,
    }

    // 验证参数范围
    if (options.count && (options.count < 1 || options.count > 50)) {
      res.status(400).json({
        success: false,
        error: { code: 400, message: '推荐数量必须在1-50之间' },
      })
      return
    }

    const results = await recommendationEngine.getRecommendations(userId, options)

    res.json({
      success: true,
      data: { recommendations: results },
      message: '获取推荐成功',
    })
  } catch (error) {
    logger.error('获取推荐失败', { error: error instanceof Error ? error.message : String(error) })
    res.status(500).json({
      success: false,
      error: { code: 500, message: '获取推荐失败，请稍后重试' },
    })
  }
}

export async function getAvailableStrategies(_req: Request, res: Response): Promise<void> {
  try {
    const strategies = recommendationEngine.getAvailableStrategies()

    res.json({
      success: true,
      data: { strategies },
      message: '获取策略列表成功',
    })
  } catch (error) {
    logger.error('获取策略列表失败', { error: error instanceof Error ? error.message : String(error) })
    res.status(500).json({
      success: false,
      error: { code: 500, message: '获取策略列表失败' },
    })
  }
}
