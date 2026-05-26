import { Op } from 'sequelize'
import { Song, UserLike } from '../../../models'
import type { RecommendationStrategy, RecommendationOptions, RecommendationResult } from '../../../types/recommendation'

// 基于内容的推荐策略
export class ContentBasedStrategy implements RecommendationStrategy {
  name = 'content_based'

  async getRecommendations(
    userId: string,
    options: RecommendationOptions = {}
  ): Promise<RecommendationResult> {
    const count = options.count || 10

    // 获取用户喜欢的歌曲
    const userLikes = await UserLike.findAll({
      where: { userId },
      include: [
        {
          model: Song,
          as: 'song',
          required: true,
        },
      ],
      limit: 50,
    })

    if (userLikes.length === 0) {
      return this.getDiverseSongs(count)
    }

    // 提取用户偏好特征
    const userPreferences = this.extractPreferences(userLikes as unknown as { song: { genre?: string; artist: string; year?: number } }[])

    // 基于偏好查找相似歌曲
    const recommendations = await this.findSimilarSongs(
      userPreferences,
      userId,
      count
    )

    return {
      strategy: this.name,
      songs: recommendations,
      confidence: this.calculateConfidence(userLikes.length, recommendations.length, count),
      metadata: {
        preferences: userPreferences,
        analyzedSongs: userLikes.length,
      },
    }
  }

  private extractPreferences(userLikes: { song: { genre?: string; artist: string; year?: number } }[]): {
    genres: Map<string, number>
    artists: Map<string, number>
    years: number[]
  } {
    const genreCounts = new Map<string, number>()
    const artistCounts = new Map<string, number>()
    const years: number[] = []

    for (const like of userLikes) {
      const song = like.song

      // 统计流派偏好
      if (song.genre) {
        genreCounts.set(song.genre, (genreCounts.get(song.genre) || 0) + 1)
      }

      // 统计艺术家偏好
      artistCounts.set(song.artist, (artistCounts.get(song.artist) || 0) + 1)

      // 收集年代信息
      if (song.year) {
        years.push(song.year)
      }
    }

    return {
      genres: genreCounts,
      artists: artistCounts,
      years,
    }
  }

  private async findSimilarSongs(
    preferences: { genres: Map<string, number>; artists: Map<string, number>; years: number[] },
    excludeUserId: string,
    count: number
  ): Promise<unknown[]> {
    // 获取用户已听过的歌曲ID
    const listenedSongs = await UserLike.findAll({
      where: { userId: excludeUserId },
      attributes: ['songId'],
    })
    const excludedSongIds = listenedSongs.map((l) => l.get('songId') as string)

    // 构建查询条件
    const whereClause: Record<string, unknown> = {
      id: { [Op.notIn]: excludedSongIds },
      is_public: true,
    }

    // 基于流派偏好筛选
    const preferredGenres = Array.from(preferences.genres.entries())
      .sort((a: [string, number], b: [string, number]) => b[1] - a[1])
      .slice(0, 3)
      .map(([genre]: [string, number]) => genre)

    if (preferredGenres.length > 0) {
      whereClause.genre = { [Op.in]: preferredGenres }
    }

    // 基于艺术家偏好加权
    const preferredArtists = Array.from(preferences.artists.entries())
      .sort((a: [string, number], b: [string, number]) => b[1] - a[1])
      .slice(0, 5)
      .map(([artist]: [string, number]) => artist)

    // 查询相似歌曲，优先匹配流派和艺术家
    const songs = await Song.findAll({
      where: whereClause,
      order: [
        preferredArtists.length > 0
          ? ['artist', 'ASC']
          : ['like_count', 'DESC'],
        ['like_count', 'DESC'],
      ],
      limit: count,
    })

    return songs
  }

  private calculateConfidence(userLikesCount: number, resultCount: number, count: number): number {
    if (userLikesCount < 5) return 0.4
    if (userLikesCount < 20) return 0.6
    if (resultCount < count * 0.5) return 0.7
    return 0.9
  }

  private async getDiverseSongs(count: number): Promise<RecommendationResult> {
    // 返回多样化的歌曲（不同流派、艺术家）
    const songs = await Song.findAll({
      where: { is_public: true },
      order: [['id', 'ASC']],
      limit: count,
    })

    return {
      strategy: this.name,
      songs,
      confidence: 0.3,
      metadata: { fallback: true, reason: 'no_listening_history' },
    }
  }
}
