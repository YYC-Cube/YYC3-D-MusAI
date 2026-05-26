import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Howl } from 'howler'

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
  howl: Howl | null

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

let progressTimer: ReturnType<typeof setInterval> | null = null

function startProgressTracking(get: () => PlayerState) {
  stopProgressTracking()
  progressTimer = setInterval(() => {
    const state = get()
    if (!state.isPlaying || !state.howl) return
    const seek = state.howl.seek() as number
    const dur = state.howl.duration() as number
    if (typeof seek === 'number' && typeof dur === 'number' && dur > 0) {
      state.actions.setProgress(Math.floor(seek))
    }
  }, 1000)
}

function stopProgressTracking() {
  if (progressTimer) {
    clearInterval(progressTimer)
    progressTimer = null
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
      howl: null,

      actions: {
        play: (track) => {
          const { howl } = get()
          if (howl) {
            howl.unload()
          }

          if (!track.audioUrl) {
            set({
              currentTrack: track,
              isPlaying: false,
              progress: 0,
              duration: track.duration || 0,
              howl: null,
            })
            stopProgressTracking()
            return
          }

          const newHowl = new Howl({
            src: [track.audioUrl],
            html5: true,
            volume: get().volume,
            onplay: () => {
              set({ isPlaying: true })
              startProgressTracking(get)
            },
            onpause: () => {
              set({ isPlaying: false })
              stopProgressTracking()
            },
            onstop: () => {
              set({ isPlaying: false })
              stopProgressTracking()
            },
            onend: () => {
              set({ isPlaying: false, progress: 0 })
              stopProgressTracking()
              const { queue, currentIndex } = get()
              if (queue.length > 0) {
                const nextIndex = currentIndex < queue.length - 1 ? currentIndex + 1 : 0
                set({
                  currentIndex: nextIndex,
                  currentTrack: queue[nextIndex],
                  isPlaying: true,
                  progress: 0,
                })
                get().actions.play(queue[nextIndex])
              }
            },
            onload: () => {
              const dur = newHowl.duration() as number
              if (typeof dur === 'number' && dur > 0) {
                set({ duration: Math.floor(dur) })
              }
            },
            onloaderror: () => {
              set({ isPlaying: false })
              stopProgressTracking()
            },
          })

          newHowl.play()

          set({
            currentTrack: track,
            isPlaying: true,
            progress: 0,
            duration: track.duration || 0,
            howl: newHowl,
          })

          const { queue } = get()
          const idx = queue.findIndex(t => t.id === track.id)
          if (idx >= 0) {
            set({ currentIndex: idx })
          }
        },

        pause: () => {
          const { howl } = get()
          if (howl) howl.pause()
          set({ isPlaying: false })
          stopProgressTracking()
        },

        resume: () => {
          const { howl } = get()
          if (howl) {
            howl.play()
          } else {
            set({ isPlaying: true })
          }
        },

        togglePlay: () => {
          const { isPlaying, howl, currentTrack } = get()
          if (!currentTrack) return
          if (isPlaying) {
            if (howl) howl.pause()
            set({ isPlaying: false })
            stopProgressTracking()
          } else {
            if (howl) {
              howl.play()
            } else {
              get().actions.play(currentTrack)
            }
          }
        },

        setVolume: (volume) => {
          const clamped = Math.max(0, Math.min(1, volume))
          const { howl } = get()
          if (howl) howl.volume(clamped)
          set({ volume: clamped })
        },

        setProgress: (progress) => {
          const { howl } = get()
          if (howl && howl.playing()) {
            howl.seek(progress)
          }
          set({ progress: Math.max(0, progress) })
        },

        next: () => {
          const { queue, currentIndex } = get()
          if (queue.length === 0) return
          const nextIndex = currentIndex < queue.length - 1 ? currentIndex + 1 : 0
          const track = queue[nextIndex]
          set({ currentIndex: nextIndex, currentTrack: track })
          get().actions.play(track)
        },

        previous: () => {
          const { queue, currentIndex } = get()
          if (queue.length === 0) return
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : queue.length - 1
          const track = queue[prevIndex]
          set({ currentIndex: prevIndex, currentTrack: track })
          get().actions.play(track)
        },

        setQueue: (tracks) => {
          const { howl } = get()
          if (howl) howl.unload()
          stopProgressTracking()
          set({
            queue: tracks,
            currentIndex: tracks.length > 0 ? 0 : -1,
            howl: null,
            isPlaying: false,
            progress: 0,
          })
        },

        addToQueue: (track) => {
          const { queue } = get()
          set({ queue: [...queue, track] })
        },

        removeFromQueue: (id) => {
          const { queue, currentIndex, currentTrack, howl } = get()
          const newQueue = queue.filter((t) => t.id !== id)

          if (currentTrack?.id === id) {
            if (howl) howl.unload()
            stopProgressTracking()
            const nextIndex = Math.min(currentIndex, newQueue.length - 1)
            set({
              queue: newQueue,
              currentIndex: nextIndex,
              currentTrack: newQueue[nextIndex] || null,
              isPlaying: false,
              progress: 0,
              howl: null,
            })
          } else {
            set({
              queue: newQueue,
              currentIndex: currentIndex > newQueue.length - 1 ? newQueue.length - 1 : currentIndex,
            })
          }
        },

        clearQueue: () => {
          const { howl } = get()
          if (howl) howl.unload()
          stopProgressTracking()
          set({
            queue: [],
            currentIndex: -1,
            currentTrack: null,
            isPlaying: false,
            progress: 0,
            howl: null,
          })
        },
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
