import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import PlayerPage from '@/pages/PlayerPage'
import { MemoryRouter } from 'react-router-dom'

const mockTrack = {
  id: 'track-1',
  title: 'Test Track',
  artist: 'Test Artist',
  cover: 'https://example.com/cover.jpg',
  duration: 180,
}

let mockStoreState = {
  currentTrack: null as any,
  isPlaying: false,
  volume: 0.8,
  progress: 0,
  duration: 0,
  queue: [],
  currentIndex: -1,
}

vi.mock('@/stores/playerStore', () => ({
  usePlayerStore: () => mockStoreState,
}))

describe('PlayerPage', () => {
  beforeEach(() => {
    mockStoreState = {
      currentTrack: null,
      isPlaying: false,
      volume: 0.8,
      progress: 0,
      duration: 0,
      queue: [],
      currentIndex: -1,
    }
    vi.clearAllMocks()
  })

  it('should render empty state when no track', () => {
    render(
      <MemoryRouter>
        <PlayerPage />
      </MemoryRouter>
    )

    expect(screen.getByText(/暂无正在播放的歌曲/i)).toBeInTheDocument()
  })

  it('should render track info when track is playing', () => {
    mockStoreState = {
      ...mockStoreState,
      currentTrack: mockTrack,
      isPlaying: true,
      progress: 30,
      duration: 180,
    }

    render(
      <MemoryRouter>
        <PlayerPage />
      </MemoryRouter>
    )

    expect(screen.getByText(mockTrack.title)).toBeInTheDocument()
    expect(screen.getByText(mockTrack.artist)).toBeInTheDocument()
  })
})
