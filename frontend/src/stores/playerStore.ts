import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Track {
  id: string
  title: string
  artist: string
  album?: string
  cover?: string
  audioUrl?: string
  youtubeId?: string
  duration?: number
}

interface PlayerState {
  currentTrack: Track | null
  isPlaying: boolean
  volume: number
  progress: number
  duration: number
  queue: Track[]
  currentIndex: number
  
  actions: {
    play: (track: Track) => void
    pause: () => void
    resume: () => void
    togglePlay: () => void
    setVolume: (volume: number) => void
    setProgress: (progress: number) => void
    next: () => void
    previous: () => void
    setQueue: (tracks: Track[]) => void
    addToQueue: (track: Track) => void
    removeFromQueue: (id: string) => void
    clearQueue: () => void
  }
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      currentTrack: null,
      isPlaying: false,
      volume: 0.8,
      progress: 0,
      duration: 0,
      queue: [],
      currentIndex: -1,

      actions: {
        play: (track) =>
          set({
            currentTrack: track,
            isPlaying: true,
            progress: 0,
            duration: track.duration || 0,
          }),

        pause: () =>
          set({ isPlaying: false }),

        resume: () =>
          set({ isPlaying: true }),

        togglePlay: () => {
          const { isPlaying } = get()
          set({ isPlaying: !isPlaying })
        },

        setVolume: (volume) =>
          set({ volume: Math.max(0, Math.min(1, volume)) }),

        setProgress: (progress) =>
          set({ progress: Math.max(0, progress) }),

        next: () => {
          const { queue, currentIndex } = get()
          if (queue.length === 0) return

          const nextIndex = currentIndex < queue.length - 1 ? currentIndex + 1 : 0
          set({
            currentIndex: nextIndex,
            currentTrack: queue[nextIndex],
            isPlaying: true,
            progress: 0,
          })
        },

        previous: () => {
          const { queue, currentIndex } = get()
          if (queue.length === 0) return

          const prevIndex = currentIndex > 0 ? currentIndex - 1 : queue.length - 1
          set({
            currentIndex: prevIndex,
            currentTrack: queue[prevIndex],
            isPlaying: true,
            progress: 0,
          })
        },

        setQueue: (tracks) =>
          set({
            queue: tracks,
            currentIndex: tracks.length > 0 ? 0 : -1,
          }),

        addToQueue: (track) => {
          const { queue } = get()
          set({ queue: [...queue, track] })
        },

        removeFromQueue: (id) => {
          const { queue, currentIndex, currentTrack } = get()
          const newQueue = queue.filter((t) => t.id !== id)
          
          if (currentTrack?.id === id) {
            const nextIndex = Math.min(currentIndex, newQueue.length - 1)
            set({
              queue: newQueue,
              currentIndex: nextIndex,
              currentTrack: newQueue[nextIndex] || null,
              isPlaying: false,
            })
          } else {
            set({
              queue: newQueue,
              currentIndex: currentIndex > newQueue.length - 1 ? newQueue.length - 1 : currentIndex,
            })
          }
        },

        clearQueue: () =>
          set({
            queue: [],
            currentIndex: -1,
            currentTrack: null,
            isPlaying: false,
            progress: 0,
          }),
      },
    }),
    {
      name: 'player-storage',
      partialize: (state) => ({
        volume: state.volume,
        queue: state.queue,
        currentIndex: state.currentIndex,
      }),
    }
  )
)
