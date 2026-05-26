import { Op } from 'sequelize'
import { Song, UserLike } from '../../../models'
import type { RecommendationStrategy, RecommendationOptions, RecommendationResult } from '../../../types/recommendation'

// 协同过滤推荐策略
export class CollaborativeFilteringStrategy implements RecommendationStrategy {
  name = 'collaborative_filtering'

  async getRecommendations(
    userId: string,
    options: RecommendationOptions = {}
  ): Promise<RecommendationResult> {
    const count = options.count || 10

    // 找到与当前用户有相似喜好的其他用户
    const currentUserLikes = await UserLike.findAll({
      where: { userId },
      attributes: ['songId'],
    })

    const currentUserSongIds = currentUserLikes.map((like) => like.get('songId') as string)

    if (currentUserSongIds.length === 0) {
      return this.getPopularSongs(count)
    }

    // 查找也喜欢这些歌曲的其他用户
    const similarUsers = await UserLike.findAll({
      where: {
        songId: currentUserSongIds,
        userId: { [Op.ne]: userId },
      },
      attributes: ['userId'],
      group: ['userId'],
      limit: 20,
    })

    const similarUserIds = similarUsers.map((u) => u.get('userId') as string)

    // 获取这些用户喜欢但当前用户未听过的歌曲
    const recommendations = await UserLike.findAll({
      where: {
        userId: similarUserIds,
        songId: { [Op.notIn]: currentUserSongIds },
      },
      attributes: [
        'songId',
      ],
      group: ['songId'],
      order: [['songId', 'DESC']],
      limit: count,
      include: [
        {
          model: Song,
          as: 'song',
          where: { is_public: true },
          required: true,
        },
      ],
    })

    return {
      strategy: this.name,
      songs: recommendations.map((r) => r.get('song')),
      confidence: Math.min(recommendations.length / count, 1),
      metadata: {
        similarUsersCount: similarUserIds.length,
        basedOnLikes: currentUserSongIds.length,
      },
    }
  }

  private async getPopularSongs(count: number): Promise<RecommendationResult> {
    const songs = await Song.findAll({
      where: { is_public: true },
      order: [['like_count', 'DESC']],
      limit: count,
    })

    return {
      strategy: this.name,
      songs,
      confidence: 0.5,
      metadata: { fallback: true, reason: 'insufficient_data' },
    }
  }
}
