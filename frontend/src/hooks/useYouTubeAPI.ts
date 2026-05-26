import { useEffect, useRef } from 'react'

export interface YouTubePlayer {
  playVideo: () => void
  pauseVideo: () => void
  stopVideo: () => void
  seekTo: (seconds: number, allowSeekAhead: boolean) => void
  setVolume: (volume: number) => void
  getDuration: () => number
  getCurrentTime: () => number
  getPlayerState: () => number
  destroy: () => void
}

declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        options: Record<string, unknown>
      ) => YouTubePlayer
      PlayerState: {
        ENDED: number
        PLAYING: number
      }
    }
    onYouTubeIframeAPIReady?: (() => void) | undefined
  }
}

export function useYouTubeAPI() {
  const isLoaded = useRef(false)
  const isLoading = useRef(false)

  useEffect(() => {
    if (window.YT || isLoading.current) return

    isLoading.current = true

    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    tag.async = true

    window.onYouTubeIframeAPIReady = () => {
      isLoaded.current = true
      isLoading.current = false
    }

    const firstScriptTag = document.getElementsByTagName('script')[0]
    firstScriptTag.parentNode!.insertBefore(tag, firstScriptTag)

    return () => {
      window.onYouTubeIframeAPIReady = undefined
    }
  }, [])

  return { isLoaded: isLoaded.current, isLoading: isLoading.current }
}
