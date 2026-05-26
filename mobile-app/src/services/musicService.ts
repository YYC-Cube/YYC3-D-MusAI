import apiService from './api'

export interface Song {
  id: string
  title: string
  artist: string
  artist_id: string
  album: string
  album_id: string
  cover_url: string
  audio_url: string
  duration: number
  plays_count: number
  likes_count: number
  is_liked: boolean
  genre: string
  year: number
  created_at: string
}

export interface SearchParams {
  query: string
  type?: 'songs' | 'artists' | 'albums'
  page?: number
  limit?: number
  genre?: string
  sort_by?: 'relevance' | 'popularity' | 'newest' | 'oldest'
}

export interface SearchResult {
  songs: Song[]
  artists: Artist[]
  albums: Album[]
  total: number
  page: number
  has_more: boolean
}

export interface Artist {
  id: string
  name: string
  avatar_url: string
  bio: string
  followers_count: number
  following: boolean
  genres: string[]
  top_songs: Song[]
  albums: Album[]
}

export interface Album {
  id: string
  title: string
  artist: string
  artist_id: string
  cover_url: string
  year: number
  genre: string
  description: string
  song_count: number
  total_duration: number
  songs: Song[]
}

export interface Playlist {
  id: string
  name: string
  description: string
  cover_url: string
  creator_id: string
  creator_name: string
  song_count: number
  total_duration: number
  is_public: boolean
  is_liked: boolean
  created_at: string
  updated_at: string
  songs: Song[]
}

class MusicService {
  // Search
  async search(params: SearchParams): Promise<SearchResult> {
    const response = await apiService.get<SearchResult>('/search', {
      params,
    })
    return response.data
  }

  // Songs
  async getSong(id: string): Promise<Song> {
    const response = await apiService.get<Song>(`/songs/${id}`)
    return response.data
  }

  async getTrendingSongs(limit: number = 20): Promise<Song[]> {
    const response = await apiService.get<Song[]>('/songs/trending', {
      params: { limit },
    })
    return response.data
  }

  async getRecommendedSongs(limit: number = 20): Promise<Song[]> {
    const response = await apiService.get<Song[]>('/songs/recommended', {
      params: { limit },
    })
    return response.data
  }

  async likeSong(songId: string): Promise<void> {
    await apiService.post(`/songs/${songId}/like`)
  }

  async unlikeSong(songId: string): Promise<void> {
    await apiService.delete(`/songs/${songId}/like`)
  }

  async incrementPlayCount(songId: string): Promise<void> {
    await apiService.put(`/songs/${songId}/play`)
  }

  // Artists
  async getArtist(id: string): Promise<Artist> {
    const response = await apiService.get<Artist>(`/artists/${id}`)
    return response.data
  }

  async followArtist(artistId: string): Promise<void> {
    await apiService.post(`/artists/${artistId}/follow`)
  }

  async unfollowArtist(artistId: string): Promise<void> {
    await apiService.delete(`/artists/${artistId}/follow`)
  }

  async getTopArtists(limit: number = 10): Promise<Artist[]> {
    const response = await apiService.get<Artist[]>('/artists/top', {
      params: { limit },
    })
    return response.data
  }

  // Albums
  async getAlbum(id: string): Promise<Album> {
    const response = await apiService.get<Album>(`/albums/${id}`)
    return response.data
  }

  async getNewReleases(limit: number = 10): Promise<Album[]> {
    const response = await apiService.get<Album[]>('/albums/new-releases', {
      params: { limit },
    })
    return response.data
  }

  async likeAlbum(albumId: string): Promise<void> {
    await apiService.post(`/albums/${albumId}/like`)
  }

  async unlikeAlbum(albumId: string): Promise<void> {
    await apiService.delete(`/albums/${albumId}/like`)
  }

  // Playlists
  async getPlaylists(): Promise<Playlist[]> {
    const response = await apiService.get<Playlist[]>('/playlists')
    return response.data
  }

  async getPlaylist(id: string): Promise<Playlist> {
    const response = await apiService.get<Playlist>(`/playlists/${id}`)
    return response.data
  }

  async createPlaylist(data: {
    name: string
    description?: string
    is_public?: boolean
  }): Promise<Playlist> {
    const response = await apiService.post<Playlist>('/playlists', data)
    return response.data
  }

  async updatePlaylist(
    id: string,
    data: Partial<Pick<Playlist, 'name' | 'description' | 'cover_url' | 'is_public'>>
  ): Promise<Playlist> {
    const response = await apiService.put<Playlist>(`/playlists/${id}`, data)
    return response.data
  }

  async deletePlaylist(id: string): Promise<void> {
    await apiService.delete(`/playlists/${id}`)
  }

  async addSongToPlaylist(playlistId: string, songId: string): Promise<void> {
    await apiService.post(`/playlists/${playlistId}/songs`, { songId })
  }

  async removeSongFromPlaylist(playlistId: string, songId: string): Promise<void> {
    await apiService.delete(`/playlists/${playlistId}/songs/${songId}`)
  }

  async likePlaylist(playlistId: string): Promise<void> {
    await apiService.post(`/playlists/${playlistId}/like`)
  }

  async unlikePlaylist(playlistId: string): Promise<void> {
    await apiService.delete(`/playlists/${playlistId}/like`)
  }

  // Genres
  async getGenres(): Promise<string[]> {
    const response = await apiService.get<string[]>('/genres')
    return response.data
  }

  async getSongsByGenre(genre: string, limit: number = 20): Promise<Song[]> {
    const response = await apiService.get<Song[]>(`/genres/${genre}/songs`, {
      params: { limit },
    })
    return response.data
  }
}

export const musicService = new MusicService()
export default musicService
