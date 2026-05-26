import { PlayerControls } from '@/components/features/PlayerControls'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

describe('PlayerControls', () => {
  const defaultProps = {
    isPlaying: false,
    onPlayPause: vi.fn(),
    onNext: vi.fn(),
    onPrev: vi.fn(),
    onSeek: vi.fn(),
    progress: 30,
    duration: 180,
    volume: 0.8,
    onVolumeChange: vi.fn(),
    mode: 'audio' as const,
    onToggleMode: vi.fn(),
    mValue: 0,
    onLike: vi.fn(),
    songTitle: 'Test Song',
    artist: 'Test Artist',
    onPlaylistToggle: vi.fn(),
    shuffleEnabled: false,
    onShuffleToggle: vi.fn(),
    repeatMode: 'off' as const,
    onRepeatCycle: vi.fn(),
    audioMode: 'file' as const,
  }

  it('should render component', () => {
    render(<PlayerControls {...defaultProps} />)
    expect(screen.getByRole('toolbar')).toBeInTheDocument()
  })

  it('should display song title and artist', () => {
    render(<PlayerControls {...defaultProps} songTitle="Test Song" artist="Test Artist" />)
    expect(screen.getByText('Test Song')).toBeInTheDocument()
    expect(screen.getByText('Test Artist')).toBeInTheDocument()
  })

  it('should render sliders', () => {
    render(<PlayerControls {...defaultProps} />)
    const sliders = screen.getAllByRole('slider')
    expect(sliders.length).toBeGreaterThanOrEqual(1)
  })
})
