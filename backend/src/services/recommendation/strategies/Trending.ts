import { Op } from 'sequelize'
import { Song } from '../../../models'
import type { RecommendationOptions, RecommendationResult, RecommendationStrategy } from '../../../types/recommendation'

// 热门趋势推荐策略
export class TrendingStrategy implements RecommendationStrategy {
  name = 'trending'

  async getRecommendations(
    _userId: string,
    options: RecommendationOptions = {}
  ): Promise<RecommendationResult> {
    const count = options.count || 10
    const timeWindow = options.timeWindow || 'week' // day, week, month

    // 计算时间窗口
    const now = new Date()
    let startDate: Date

    switch (timeWindow) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      default: // week
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    }

    // 获取最近热门歌曲（基于播放量和点赞量的综合得分）
    const songs: Song[] = await Song.findAll({
      where: {
        is_public: true,
      },
      order: [
        ['play_count', 'DESC'],
        ['like_count', 'DESC'],
      ],
      limit: count,
    })

    // 如果最近新歌不够，补充历史热门
    if (songs.length < count) {
      const remaining = count - songs.length
      const existingIds = songs.map((s) => s.id)

      const historicalHot = await Song.findAll({
        where: {
          is_public: true,
          id: { [Op.notIn]: existingIds },
        },
        order: [['play_count', 'DESC']],
        limit: remaining,
      })

      songs.push(...historicalHot)
    }

    return {
      strategy: this.name,
      songs: songs.slice(0, count),
      confidence: 0.85,
      metadata: {
        timeWindow,
        periodStart: startDate.toISOString(),
        totalSongsAnalyzed: songs.length,
      },
    }
  }
}
