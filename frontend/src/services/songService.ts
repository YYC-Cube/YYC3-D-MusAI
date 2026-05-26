import api from './api'
import type { Track } from '@/types/music'

export interface SongFilters {
  search?: string
  genre?: string
  artist?: string
  page?: number
  limit?: number
  sort_by?: string
  order?: 'ASC' | 'DESC'
}

export interface SongResponse {
  songs: Track[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface CreateSongData {
  title: string
  artist: string
  album_id?: string
  duration?: number
  genre?: string
  year?: number
  youtube_id?: string
  is_public?: boolean
  audio?: File
  cover?: File
}

export const songService = {
  async getSongs(filters?: SongFilters): Promise<SongResponse> {
    const params = new URLSearchParams()
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value))
        }
      })
    }

    const response = await api.get(`/songs?${params.toString()}`)
    return response.data
  },

  async getSongById(id: string): Promise<Track> {
    const response = await api.get(`/songs/${id}`)
    return response.data.song
  },

  async getHotSongs(): Promise<Track[]> {
    const response = await api.get('/songs/hot')
    return response.data.songs
  },

  async createSong(data: CreateSongData): Promise<Track> {
    const formData = new FormData()
    
    // 添加文本字段
    Object.entries(data).forEach(([key, value]) => {
      if (value instanceof File) {
        formData.append(key, value)
      } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        formData.append(key, String(value))
      }
    })

    const response = await api.post('/songs', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return response.data.song
  },

  async updateSong(id: string, data: Partial<CreateSongData>): Promise<Track> {
    const formData = new FormData()
    
    Object.entries(data).forEach(([key, value]) => {
      if (value instanceof File) {
        formData.append(key, value)
      } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        formData.append(key, String(value))
      }
    })

    const response = await api.put(`/songs/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return response.data.song
  },

  async deleteSong(id: string): Promise<void> {
    await api.delete(`/songs/${id}`)
  },

  async toggleLike(id: string): Promise<{ liked: boolean }> {
    const response = await api.post(`/songs/${id}/like`)
    return response.data
  },
}
