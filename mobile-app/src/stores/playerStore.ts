import { create } from 'zustand'

export interface Song {
  id: string
  title: string
  artist: string
  album?: string
  duration: number // seconds
  cover_url?: string
  audio_url: string
  genre?: string
  play_count?: number
  like_count?: number
}

export interface Playlist {
  id: string
  name: string
  description?: string
  cover_url?: string
  song_ids: string[]
  created_at?: string
}

interface PlayerState {
  currentTrack: Song | null
  queue: Song[]
  queueIndex: number
  isPlaying: boolean
  isBuffering: boolean
  currentTime: number
  duration: number
  volume: number
  shuffleMode: boolean
  repeatMode: 'off' | 'one' | 'all'

  actions: {
    playTrack: (track: Song) => void
    addToQueue: (track: Song) => void
    removeFromQueue: (index: number) => void
    clearQueue: () => void
    setQueue: (songs: Song[], startIndex?: number) => void
    togglePlayPause: () => void
    next: () => void
    previous: () => void
    seekTo: (time: number) => void
    setVolume: (volume: number) => void
    toggleShuffle: () => void
    toggleRepeat: () => void
    updateProgress: (currentTime: number, duration: number) => void
    setBuffering: (buffering: boolean) => void
  }
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  queue: [],
  queueIndex: -1,
  isPlaying: false,
  isBuffering: false,
  currentTime: 0,
  duration: 0,
  volume: 1.0,
  shuffleMode: false,
  repeatMode: 'off',

  actions: {
    playTrack: (track: Song) => {
      const { queue } = get()
      const existingIndex = queue.findIndex((s) => s.id === track.id)

      if (existingIndex >= 0) {
        set({
          currentTrack: track,
          queueIndex: existingIndex,
          isPlaying: true,
          currentTime: 0,
        })
      } else {
        set({
          currentTrack: track,
          queue: [track],
          queueIndex: 0,
          isPlaying: true,
          currentTime: 0,
        })
      }
    },

    addToQueue: (track: Song) => {
      const { queue } = get()
      const exists = queue.some((s) => s.id === track.id)

      if (!exists) {
        set({ queue: [...queue, track] })
      }
    },

    removeFromQueue: (index: number) => {
      const { queue, queueIndex } = get()

      if (index < 0 || index >= queue.length) return

      const newQueue = queue.filter((_, i) => i !== index)
      let newIndex = queueIndex

      if (index < queueIndex) {
        newIndex--
      } else if (index === queueIndex) {
        if (newQueue.length > 0) {
          newIndex = Math.min(newIndex, newQueue.length - 1)
          set({
            queue: newQueue,
            queueIndex: newIndex,
            currentTrack: newQueue[newIndex] || null,
            currentTime: 0,
          })
          return
        }
      }

      set({
        queue: newQueue,
        queueIndex: newIndex,
      })
    },

    clearQueue: () => {
      set({
        queue: [],
        queueIndex: -1,
        currentTrack: null,
        isPlaying: false,
        currentTime: 0,
      })
    },

    setQueue: (songs: Song[], startIndex = 0) => {
      if (!songs || songs.length === 0) {
        get().actions.clearQueue()
        return
      }

      set({
        queue: songs,
        queueIndex: Math.min(startIndex, songs.length - 1),
        currentTrack: songs[startIndex],
        isPlaying: true,
        currentTime: 0,
      })
    },

    togglePlayPause: () => {
      const { isPlaying, currentTrack } = get()

      if (!currentTrack) return

      set({ isPlaying: !isPlaying })
    },

    next: () => {
      const { queue, queueIndex, repeatMode, shuffleMode } = get()

      if (queue.length === 0) return

      let nextIndex: number

      if (shuffleMode) {
        nextIndex = Math.floor(Math.random() * queue.length)
      } else if (repeatMode === 'all' || repeatMode === 'off') {
        nextIndex = queueIndex + 1

        if (nextIndex >= queue.length) {
          if (repeatMode === 'all') {
            nextIndex = 0
          } else {
            set({ isPlaying: false })
            return
          }
        }
      } else {
        nextIndex = queueIndex // Repeat one stays on same track
      }

      set({
        queueIndex: nextIndex,
        currentTrack: queue[nextIndex],
        isPlaying: true,
        currentTime: 0,
      })
    },

    previous: () => {
      const { queue, queueIndex, currentTime } = get()

      if (queue.length === 0) return

      // If more than 3 seconds in, restart current track
      if (currentTime > 3) {
        set({ currentTime: 0 })
        return
      }

      let prevIndex = queueIndex - 1

      if (prevIndex < 0) {
        prevIndex = queue.length - 1 // Go to last track
      }

      set({
        queueIndex: prevIndex,
        currentTrack: queue[prevIndex],
        isPlaying: true,
        currentTime: 0,
      })
    },

    seekTo: (time: number) => {
      set({ currentTime: Math.max(0, time) })
    },

    setVolume: (volume: number) => {
      set({ volume: Math.max(0, Math.min(1, volume)) })
    },

    toggleShuffle: () => {
      set((state) => ({ shuffleMode: !state.shuffleMode }))
    },

    toggleRepeat: () => {
      set((state) => {
        const modes: Array<'off' | 'one' | 'all'> = ['off', 'one', 'all']
        const currentIndex = modes.indexOf(state.repeatMode)
        const nextIndex = (currentIndex + 1) % modes.length
        return { repeatMode: modes[nextIndex] }
      })
    },

    updateProgress: (currentTime: number, duration: number) => {
      set({
        currentTime: Math.max(0, currentTime),
        duration: Math.max(0, duration),
      })
    },

    setBuffering: (buffering: boolean) => {
      set({ isBuffering: buffering })
    },
  },
}))
