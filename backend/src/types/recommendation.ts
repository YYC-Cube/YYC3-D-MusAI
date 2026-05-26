export interface RecommendationOptions {
  count?: number
  timeWindow?: 'day' | 'week' | 'month'
  genres?: string[]
  excludeIds?: string[]
  strategy?: string
}

export interface RecommendationResult {
  strategy: string
  songs: unknown[]
  confidence: number
  metadata?: Record<string, unknown>
}

export interface RecommendationSong {
  id: string
  title: string
  artist: string
  album_id?: string
  duration?: number
  cover_url?: string
  audio_url?: string
  youtube_id?: string
  genre?: string
  year?: number
  play_count: number
  like_count: number
  uploaded_by: string
  is_public: boolean
  createdAt: Date
  updatedAt: Date
}

export interface RecommendationStrategy {
  name: string
  getRecommendations(userId: string, options: RecommendationOptions): Promise<RecommendationResult>
}
