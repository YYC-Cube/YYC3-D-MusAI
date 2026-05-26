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
  year?: number
}

export interface Playlist {
  id: string
  name: string
  description?: string
  cover?: string
  tracks: Track[]
  createdAt?: Date
}
