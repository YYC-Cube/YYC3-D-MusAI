import { Howl } from 'howler'
import type { Track } from '@/types/music'
import type { YouTubePlayer } from '@/hooks/useYouTubeAPI'

export type AudioEngineType = 'local' | 'youtube'

interface AudioEngineOptions {
  onPlay?: () => void
  onPause?: () => void
  onStop?: () => void
  onEnd?: () => void
  onSeek?: (progress: number) => void
  onLoadError?: (error: Error) => void
}

export class AudioEngine {
  private howlInstance: Howl | null = null
  private youtubePlayer: YouTubePlayer | null = null
  private currentTrack: Track | null = null
  private isPlayingState = false
  private volumeValue = 0.8
  private progressInterval: ReturnType<typeof setInterval> | null = null
  private options: AudioEngineOptions

  constructor(options: AudioEngineOptions = {}) {
    this.options = options
  }

  get isPlaying(): boolean {
    return this.isPlayingState
  }

  get current(): Track | null {
    return this.currentTrack
  }

  get volume(): number {
    return this.volumeValue
  }

  setVolume(volume: number): void {
    this.volumeValue = Math.max(0, Math.min(1, volume))

    if (this.howlInstance) {
      this.howlInstance.volume(this.volumeValue)
    }

    if (this.youtubePlayer) {
      this.youtubePlayer.setVolume(Math.round(this.volumeValue * 100))
    }
  }

  load(track: Track): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.stop()
        this.currentTrack = track

        const engineType = this.getEngineType(track)

        if (engineType === 'youtube') {
          this.loadYouTube(track).then(resolve).catch(reject)
        } else {
          this.loadLocal(track).then(resolve).catch(reject)
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  play(track?: Track): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        if (track || !this.currentTrack) {
          await this.load(track || this.currentTrack!)
        }

        const engineType = this.getEngineType(this.currentTrack!)

        if (engineType === 'youtube') {
          await this.playYouTube()
        } else {
          await this.playLocal()
        }

        this.isPlayingState = true
        this.startProgressTracking()
        this.options.onPlay?.()
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }

  pause(): void {
    if (!this.currentTrack) return

    const engineType = this.getEngineType(this.currentTrack)

    if (engineType === 'youtube') {
      if (this.youtubePlayer) {
        this.youtubePlayer.pauseVideo()
      }
    } else {
      if (this.howlInstance) {
        this.howlInstance.pause()
      }
    }

    this.isPlayingState = false
    this.stopProgressTracking()
    this.options.onPause?.()
  }

  resume(): void {
    if (!this.currentTrack) return

    const engineType = this.getEngineType(this.currentTrack)

    if (engineType === 'youtube') {
      if (this.youtubePlayer) {
        this.youtubePlayer.playVideo()
      }
    } else {
      if (this.howlInstance) {
        this.howlInstance.play()
      }
    }

    this.isPlayingState = true
    this.startProgressTracking()
    this.options.onPlay?.()
  }

  stop(): void {
    if (this.howlInstance) {
      this.howlInstance.stop()
      this.howlInstance.unload()
      this.howlInstance = null
    }

    if (this.youtubePlayer) {
      this.youtubePlayer.stopVideo()
    }

    this.isPlayingState = false
    this.stopProgressTracking()
    this.options.onStop?.()
  }

  seek(time: number): void {
    if (!this.currentTrack) return

    const engineType = this.getEngineType(this.currentTrack)

    if (engineType === 'youtube') {
      if (this.youtubePlayer) {
        this.youtubePlayer.seekTo(time, true)
      }
    } else {
      if (this.howlInstance) {
        this.howlInstance.seek(time)
      }
    }

    this.options.onSeek?.(time)
  }

  getDuration(): number {
    if (!this.currentTrack) return 0

    const engineType = this.getEngineType(this.currentTrack)

    if (engineType === 'youtube') {
      if (this.youtubePlayer) {
        return this.youtubePlayer.getDuration() || 0
      }
      return 0
    }

    if (this.howlInstance) {
      return this.howlInstance.duration() || 0
    }

    return 0
  }

  getCurrentTime(): number {
    if (!this.currentTrack) return 0

    const engineType = this.getEngineType(this.currentTrack)

    if (engineType === 'youtube') {
      if (this.youtubePlayer) {
        return this.youtubePlayer.getCurrentTime() || 0
      }
      return 0
    }

    if (this.howlInstance) {
      return this.howlInstance.seek() || 0
    }

    return 0
  }

  destroy(): void {
    this.stop()
    this.currentTrack = null

    if (this.youtubePlayer) {
      this.youtubePlayer.destroy()
      this.youtubePlayer = null
    }
  }

  private getEngineType(track: Track): AudioEngineType {
    if (track.youtubeId) return 'youtube'
    if (track.audioUrl) return 'local'
    return 'local'
  }

  private async loadLocal(track: Track): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!track.audioUrl) {
        reject(new Error('没有本地音频URL'))
        return
      }

      this.howlInstance = new Howl({
        src: [track.audioUrl],
        html5: true,
        volume: this.volumeValue,
        onload: () => resolve(),
        onloaderror: (_id, error) => {
          reject(new Error(`加载失败: ${error}`))
        },
        onplayerror: (_id, error) => {
          reject(new Error(`播放错误: ${error}`))
        },
        onend: () => {
          this.isPlayingState = false
          this.stopProgressTracking()
          this.options.onEnd?.()
        },
      })
    })
  }

  private async playLocal(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.howlInstance) {
        reject(new Error('音频未加载'))
        return
      }

      this.howlInstance.once('play', () => resolve())
      this.howlInstance.play()

      setTimeout(() => {
        if (this.howlInstance && !this.isPlayingState) {
          resolve()
        }
      }, 100)
    })
  }

  private async loadYouTube(track: Track): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!track.youtubeId) {
        reject(new Error('没有YouTube ID'))
        return
      }

      if (!window.YT) {
        reject(new Error('YouTube API未加载'))
        return
      }

      const playerId = `youtube-player-${Date.now()}`

      let container = document.getElementById(playerId)
      if (!container) {
        container = document.createElement('div')
        container.id = playerId
        container.style.display = 'none'
        document.body.appendChild(container)
      }

      this.youtubePlayer = new window.YT.Player(playerId, {
        videoId: track.youtubeId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
        },
        events: {
          onReady: () => {
            if (this.youtubePlayer) {
              this.youtubePlayer.setVolume(Math.round(this.volumeValue * 100))
            }
            resolve()
          },
          onError: (event: { data: number }) => {
            reject(new Error(`YouTube错误: ${event.data}`))
          },
          onStateChange: (event: { data: number }) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              this.isPlayingState = false
              this.stopProgressTracking()
              this.options.onEnd?.()
            }
          },
        },
      })
    })
  }

  private async playYouTube(): Promise<void> {
    return new Promise((resolve, _reject) => {
      if (!this.youtubePlayer) {
        resolve()
        return
      }

      this.youtubePlayer.playVideo()
      this.isPlayingState = true

      const checkPlaying = setInterval(() => {
        if (this.youtubePlayer) {
          const state = this.youtubePlayer.getPlayerState()
          if (state === window.YT.PlayerState.PLAYING) {
            clearInterval(checkPlaying)
            resolve()
          }
        }
      }, 100)

      setTimeout(() => {
        clearInterval(checkPlaying)
        resolve()
      }, 2000)
    })
  }

  private startProgressTracking(): void {
    this.stopProgressTracking()

    this.progressInterval = setInterval(() => {
      if (this.isPlayingState) {
        const currentTime = this.getCurrentTime()
        this.options.onSeek?.(currentTime)
      }
    }, 250)
  }

  private stopProgressTracking(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval)
      this.progressInterval = null
    }
  }
}
