import { describe, it, expect, beforeEach } from 'vitest'
import { usePlayerStore } from '@/stores/playerStore'
import { act, renderHook } from '@testing-library/react'

const mockTrack = {
  id: 'track-1',
  title: 'Test Track',
  artist: 'Test Artist',
  album: 'Test Album',
  cover: 'https://example.com/cover.jpg',
  audioUrl: 'https://example.com/audio.mp3',
  duration: 180,
}

const mockTrack2 = {
  id: 'track-2',
  title: 'Test Track 2',
  artist: 'Test Artist 2',
  duration: 200,
}

describe('usePlayerStore', () => {
  beforeEach(() => {
    usePlayerStore.setState({
      currentTrack: null,
      isPlaying: false,
      volume: 0.8,
      progress: 0,
      duration: 0,
      queue: [],
      currentIndex: -1,
    })
  })

  it('should initialize with default state', () => {
    const { result } = renderHook(() => usePlayerStore())

    expect(result.current.currentTrack).toBeNull()
    expect(result.current.isPlaying).toBe(false)
    expect(result.current.volume).toBe(0.8)
    expect(result.current.progress).toBe(0)
    expect(result.current.duration).toBe(0)
    expect(result.current.queue).toEqual([])
    expect(result.current.currentIndex).toBe(-1)
  })

  it('should play a track', () => {
    const { result } = renderHook(() => usePlayerStore())

    act(() => {
      result.current.actions.play(mockTrack)
    })

    expect(result.current.currentTrack).toEqual(mockTrack)
    expect(result.current.isPlaying).toBe(true)
    expect(result.current.progress).toBe(0)
    expect(result.current.duration).toBe(180)
  })

  it('should pause playback', () => {
    const { result } = renderHook(() => usePlayerStore())

    act(() => {
      result.current.actions.play(mockTrack)
      result.current.actions.pause()
    })

    expect(result.current.isPlaying).toBe(false)
    expect(result.current.currentTrack).toEqual(mockTrack)
  })

  it('should resume playback', () => {
    const { result } = renderHook(() => usePlayerStore())

    act(() => {
      result.current.actions.play(mockTrack)
      result.current.actions.pause()
      result.current.actions.resume()
    })

    expect(result.current.isPlaying).toBe(true)
  })

  it('should toggle play state', () => {
    const { result } = renderHook(() => usePlayerStore())

    act(() => {
      result.current.actions.togglePlay()
    })
    expect(result.current.isPlaying).toBe(true)

    act(() => {
      result.current.actions.togglePlay()
    })
    expect(result.current.isPlaying).toBe(false)
  })

  it('should set volume within bounds', () => {
    const { result } = renderHook(() => usePlayerStore())

    act(() => {
      result.current.actions.setVolume(0.5)
    })
    expect(result.current.volume).toBe(0.5)

    act(() => {
      result.current.actions.setVolume(1.5)
    })
    expect(result.current.volume).toBe(1)

    act(() => {
      result.current.actions.setVolume(-0.5)
    })
    expect(result.current.volume).toBe(0)
  })

  it('should set progress', () => {
    const { result } = renderHook(() => usePlayerStore())

    act(() => {
      result.current.actions.setProgress(50)
    })
    expect(result.current.progress).toBe(50)

    act(() => {
      result.current.actions.setProgress(-10)
    })
    expect(result.current.progress).toBe(0)
  })

  it('should set queue and update index', () => {
    const { result } = renderHook(() => usePlayerStore())
    const tracks = [mockTrack, mockTrack2]

    act(() => {
      result.current.actions.setQueue(tracks)
    })

    expect(result.current.queue).toEqual(tracks)
    expect(result.current.currentIndex).toBe(0)
  })

  it('should handle empty queue', () => {
    const { result } = renderHook(() => usePlayerStore())

    act(() => {
      result.current.actions.setQueue([])
    })

    expect(result.current.queue).toEqual([])
    expect(result.current.currentIndex).toBe(-1)
  })

  it('should add track to queue', () => {
    const { result } = renderHook(() => usePlayerStore())

    act(() => {
      result.current.actions.addToQueue(mockTrack)
    })

    expect(result.current.queue).toHaveLength(1)
    expect(result.current.queue[0]).toEqual(mockTrack)

    act(() => {
      result.current.actions.addToQueue(mockTrack2)
    })

    expect(result.current.queue).toHaveLength(2)
  })

  it('should navigate to next track', () => {
    const { result } = renderHook(() => usePlayerStore())

    act(() => {
      result.current.actions.setQueue([mockTrack, mockTrack2])
      result.current.actions.next()
    })

    expect(result.current.currentIndex).toBe(1)
    expect(result.current.currentTrack).toEqual(mockTrack2)
    expect(result.current.isPlaying).toBe(true)
  })

  it('should loop to first track when at end', () => {
    const { result } = renderHook(() => usePlayerStore())

    act(() => {
      result.current.actions.setQueue([mockTrack, mockTrack2])
      result.current.actions.next()
      result.current.actions.next()
    })

    expect(result.current.currentIndex).toBe(0)
    expect(result.current.currentTrack).toEqual(mockTrack)
  })

  it('should navigate to previous track', () => {
    const { result } = renderHook(() => usePlayerStore())

    act(() => {
      result.current.actions.setQueue([mockTrack, mockTrack2])
      result.current.actions.next()
      result.current.actions.previous()
    })

    expect(result.current.currentIndex).toBe(0)
    expect(result.current.currentTrack).toEqual(mockTrack)
  })

  it('should loop to last track when at beginning', () => {
    const { result } = renderHook(() => usePlayerStore())

    act(() => {
      result.current.actions.setQueue([mockTrack, mockTrack2])
      result.current.actions.previous()
    })

    expect(result.current.currentIndex).toBe(1)
    expect(result.current.currentTrack).toEqual(mockTrack2)
  })

  it('should remove track from queue', () => {
    const { result } = renderHook(() => usePlayerStore())

    act(() => {
      result.current.actions.setQueue([mockTrack, mockTrack2])
      result.current.actions.removeFromQueue(mockTrack.id)
    })

    expect(result.current.queue).toHaveLength(1)
    expect(result.current.queue[0]).toEqual(mockTrack2)
  })

  it('should handle removing current track', () => {
    const { result } = renderHook(() => usePlayerStore())

    act(() => {
      result.current.actions.setQueue([mockTrack, mockTrack2])
      result.current.actions.play(mockTrack)
      result.current.actions.removeFromQueue(mockTrack.id)
    })

    expect(result.current.currentTrack).toEqual(mockTrack2)
    expect(result.current.isPlaying).toBe(false)
  })

  it('should clear queue', () => {
    const { result } = renderHook(() => usePlayerStore())

    act(() => {
      result.current.actions.setQueue([mockTrack, mockTrack2])
      result.current.actions.clearQueue()
    })

    expect(result.current.queue).toEqual([])
    expect(result.current.currentIndex).toBe(-1)
    expect(result.current.currentTrack).toBeNull()
  })
})
