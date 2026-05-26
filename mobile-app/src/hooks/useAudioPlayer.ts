import { usePlayerStore } from '@/stores/playerStore'
import { Audio } from 'expo-av'
import { useEffect, useRef } from 'react'

export function useAudioPlayer() {
  const soundRef = useRef<Audio.Sound | null>(null)

  const currentTrack = usePlayerStore((state) => state.currentTrack)
  const isPlaying = usePlayerStore((state) => state.isPlaying)
  const actions = usePlayerStore((state) => state.actions)

  // Load and play audio when track changes
  useEffect(() => {
    async function loadAndPlay() {
      try {
        // Unload previous sound
        if (soundRef.current) {
          await soundRef.current.unloadAsync()
          soundRef.current = null
        }

        if (!currentTrack?.audio_url) {
          console.log('No audio URL provided')
          return
        }

        actions.setBuffering(true)

        // Create and load new sound
        const { sound } = await Audio.Sound.createAsync(
          { uri: currentTrack.audio_url },
          {
            shouldPlay: isPlaying,
            progressUpdateIntervalMillis: 1000,
          },
          onPlaybackStatusUpdate
        )

        soundRef.current = sound
        actions.setBuffering(false)

      } catch (error) {
        console.error('Error loading audio:', error)
        actions.setBuffering(false)
      }
    }

    loadAndPlay()

    // Cleanup on unmount or track change
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(console.error)
      }
    }
  }, [currentTrack?.id])

  // Control playback state based on store
  useEffect(() => {
    if (!soundRef.current || !currentTrack) return

    if (isPlaying) {
      soundRef.current.playAsync().catch(console.error)
    } else {
      soundRef.current.pauseAsync().catch(console.error)
    }
  }, [isPlaying, currentTrack?.id])

  // Playback status update handler
  function onPlaybackStatusUpdate(status: any) {
    if (!status.isLoaded) return

    // Update progress in store
    if (status.positionMillis !== undefined && status.durationMillis !== undefined) {
      actions.updateProgress(
        status.positionMillis / 1000,
        status.durationMillis / 1000
      )
    }

    // Handle track end
    if (status.didJustFinish) {
      actions.next()
    }
  }

  async function seekTo(seconds: number): Promise<void> {
    if (soundRef.current) {
      try {
        await soundRef.current.setPositionAsync(seconds * 1000)
      } catch (error) {
        console.error('Seek failed:', error)
      }
    }
  }

  async function setVolume(volume: number): Promise<void> {
    if (soundRef.current) {
      try {
        await soundRef.current.setVolumeAsync(Math.max(0, Math.min(1, volume)))
      } catch (error) {
        console.error('Set volume failed:', error)
      }
    }
  }

  function cleanup(): void {
    if (soundRef.current) {
      soundRef.current.unloadAsync().catch(console.error)
      soundRef.current = null
    }
  }

  return {
    seekTo,
    setVolume,
    cleanup,
  }
}

export default useAudioPlayer
