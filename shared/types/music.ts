export interface Track {
  id: string
  title: string
  artist: string
  album?: string
  cover?: string
  audioUrl?: string
  youtubeId?: string
  duration?: number
  genre?: string
  playCount?: number
}

export interface Playlist {
  id: string
  name: string
  description?: string
  cover?: string
  userId: string
  tracks: Track[]
  createdAt: string
  updatedAt: string
}

export interface Album {
  id: string
  title: string
  artist: string
  cover?: string
  releaseDate?: string
  tracks: Track[]
}

export interface LyricLine {
  time: number
  text: string
}
