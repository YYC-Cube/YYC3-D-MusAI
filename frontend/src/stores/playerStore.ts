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

let audioEl: HTMLAudioElement | null = null
let progressTimer: ReturnType<typeof setInterval> | null = null
let isSwitchingTrack = false

function createAudio(): HTMLAudioElement {
  if (audioEl) {
    audioEl.pause()
    audioEl.removeAttribute('src')
    audioEl.load()
  }
  audioEl = new Audio()
  audioEl.preload = 'auto'
  return audioEl
}

function startProgressTracking() {
  stopProgressTracking()
  progressTimer = setInterval(() => {
    if (!audioEl || audioEl.paused) return
    const seek = audioEl.currentTime
    const dur = audioEl.duration
    if (isFinite(seek) && isFinite(dur) && dur > 0) {
      usePlayerStore.setState({
        progress: Math.floor(seek),
        duration: Math.floor(dur),
      })
    }
  }, 500)
}

function stopProgressTracking() {
  if (progressTimer) {
    clearInterval(progressTimer)
    progressTimer = null
  }
}

function playNextInQueue() {
  const { queue, currentIndex } = usePlayerStore.getState()
  if (queue.length === 0) return
  const nextIndex = currentIndex < queue.length - 1 ? currentIndex + 1 : 0
  usePlayerStore.setState({
    currentIndex: nextIndex,
    currentTrack: queue[nextIndex],
    progress: 0,
  })
  usePlayerStore.getState().actions.play(queue[nextIndex])
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
        play: (track) => {
          if (isSwitchingTrack) return
          isSwitchingTrack = true

          if (!track.audioUrl) {
            set({
              currentTrack: track,
              isPlaying: false,
              progress: 0,
              duration: track.duration || 0,
            })
            stopProgressTracking()
            isSwitchingTrack = false
            return
          }

          const audio = createAudio()
          const url = encodeURI(track.audioUrl)

          audio.volume = get().volume

          audio.oncanplay = () => {
            if (isFinite(audio.duration) && audio.duration > 0) {
              set({ duration: Math.floor(audio.duration) })
            }
          }

          audio.onplay = () => {
            set({ isPlaying: true })
            startProgressTracking()
          }

          audio.onpause = () => {
            if (!isSwitchingTrack) {
              set({ isPlaying: false })
              stopProgressTracking()
            }
          }

          audio.onended = () => {
            stopProgressTracking()
            isSwitchingTrack = false
            playNextInQueue()
          }

          audio.onerror = () => {
            console.error('[MusAI Player] Audio error:', audio.error?.code, audio.error?.message)
            set({ isPlaying: false, progress: 0 })
            stopProgressTracking()
            isSwitchingTrack = false
          }

          audio.src = url

          audio.play().catch((err) => {
            console.warn('[MusAI Player] play() rejected:', err)
            set({ isPlaying: false })
            isSwitchingTrack = false
          }).finally(() => {
            isSwitchingTrack = false
          })

          set({
            currentTrack: track,
            progress: 0,
            duration: track.duration || 0,
          })

          const { queue } = get()
          const idx = queue.findIndex(t => t.id === track.id)
          if (idx >= 0) {
            set({ currentIndex: idx })
          }
        },

        pause: () => {
          if (audioEl) audioEl.pause()
          set({ isPlaying: false })
          stopProgressTracking()
        },

        resume: () => {
          if (audioEl) {
            audioEl.play().catch(() => { })
          }
        },

        togglePlay: () => {
          const { isPlaying, currentTrack } = get()
          if (!currentTrack) return
          if (isPlaying) {
            if (audioEl) audioEl.pause()
            set({ isPlaying: false })
            stopProgressTracking()
          } else {
            if (audioEl && audioEl.src) {
              audioEl.play().catch(() => { })
            } else {
              get().actions.play(currentTrack)
            }
          }
        },

        setVolume: (volume) => {
          const clamped = Math.max(0, Math.min(1, volume))
          if (audioEl) audioEl.volume = clamped
          set({ volume: clamped })
        },

        setProgress: (progress) => {
          if (audioEl && !audioEl.paused) {
            audioEl.currentTime = progress
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
          const { currentTrack, isPlaying } = get()
          const stillInQueue = currentTrack && tracks.some(t => t.id === currentTrack.id)
          if (!stillInQueue) {
            if (audioEl) {
              audioEl.pause()
              audioEl.removeAttribute('src')
              audioEl.load()
            }
            stopProgressTracking()
          }
          set({
            queue: tracks,
            currentIndex: tracks.length > 0 ? 0 : -1,
            isPlaying: stillInQueue ? isPlaying : false,
            progress: stillInQueue ? get().progress : 0,
          })
        },

        addToQueue: (track) => {
          const { queue } = get()
          set({ queue: [...queue, track] })
        },

        removeFromQueue: (id) => {
          const { queue, currentIndex, currentTrack } = get()
          const newQueue = queue.filter((t) => t.id !== id)

          if (currentTrack?.id === id) {
            if (audioEl) {
              audioEl.pause()
              audioEl.removeAttribute('src')
              audioEl.load()
            }
            stopProgressTracking()
            const nextIndex = Math.min(currentIndex, newQueue.length - 1)
            set({
              queue: newQueue,
              currentIndex: nextIndex,
              currentTrack: newQueue[nextIndex] || null,
              isPlaying: false,
              progress: 0,
            })
          } else {
            set({
              queue: newQueue,
              currentIndex: currentIndex > newQueue.length - 1 ? newQueue.length - 1 : currentIndex,
            })
          }
        },

        clearQueue: () => {
          if (audioEl) {
            audioEl.pause()
            audioEl.removeAttribute('src')
            audioEl.load()
          }
          stopProgressTracking()
          set({
            queue: [],
            currentIndex: -1,
            currentTrack: null,
            isPlaying: false,
            progress: 0,
          })
        },
      },
    }),
    {
      name: 'player-storage',
      partialize: (state) => ({
        volume: state.volume,
      }),
    }
  )
)
