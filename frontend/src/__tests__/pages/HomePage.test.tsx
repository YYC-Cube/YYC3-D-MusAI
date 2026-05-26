import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import HomePage from '@/pages/HomePage'

const mockPlay = vi.fn()

vi.mock('@/stores/playerStore', () => ({
  usePlayerStore: () => ({
    actions: {
      play: mockPlay,
    },
  }),
}))

vi.mock('@/components/CoverFlow/CoverFlow', () => ({
  CoverFlow: ({ tracks, onTrackSelect }: any) => (
    <div data-testid="coverflow">
      {tracks.map((track: any) => (
        <button
          key={track.id}
          data-testid={`track-${track.id}`}
          onClick={() => onTrackSelect(track)}
        >
          {track.title}
        </button>
      ))}
    </div>
  ),
}))

describe('HomePage', () => {
  it('should render hero section', () => {
    render(<HomePage />)

    expect(screen.getByText('发现音乐')).toBeInTheDocument()
    expect(screen.getByText('探索无限可能，让音乐点亮生活')).toBeInTheDocument()
  })

  it('should render quick action cards', () => {
    render(<HomePage />)

    expect(screen.getByText('随机播放')).toBeInTheDocument()
    expect(screen.getByText('我喜欢')).toBeInTheDocument()
  })

  it('should render CoverFlow component', () => {
    render(<HomePage />)

    expect(screen.getByTestId('coverflow')).toBeInTheDocument()
  })

  it('should call play action when track is selected', () => {
    mockPlay.mockClear()
    render(<HomePage />)

    const trackButton = screen.getByTestId('track-1')
    fireEvent.click(trackButton)

    expect(mockPlay).toHaveBeenCalled()
  })
})
