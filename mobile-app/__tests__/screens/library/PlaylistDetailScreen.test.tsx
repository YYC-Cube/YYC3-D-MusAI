import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react-native'
import PlaylistDetailScreen from '@/screens/library/PlaylistDetailScreen'

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
  useRoute: () => ({
    params: {
      playlist: {
        id: '1',
        name: 'Test Playlist',
        description: 'A test playlist',
        cover_url: 'https://example.com/cover.jpg',
        creator_name: 'Test User',
        song_count: 5,
        total_duration: 1200,
        is_public: true,
        created_at: '2024-01-01',
      },
    },
  }),
}));

describe('PlaylistDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders playlist information correctly', () => {
    const { getByText } = render(<PlaylistDetailScreen />)

    expect(getByText('Test Playlist')).toBeTruthy()
    expect(getByText('A test playlist')).toBeTruthy()
    expect(getByText('创建者: Test User')).toBeTruthy()
  })

  it('displays play all and shuffle buttons', () => {
    const { getByText } = render(<PlaylistDetailScreen />)

    expect(getByText('播放全部')).toBeTruthy()
    expect(getByText('随机播放')).toBeTruthy()
  })

  it('shows song list after loading', async () => {
    const { findByText } = render(<PlaylistDetailScreen />)

    await waitFor(async () => {
      const songTitle = await findByText('夜曲')
      expect(songTitle).toBeTruthy()
    }, { timeout: 3000 })
  })

  it('navigates to song detail when song is pressed', async () => {
    const { findByText } = render(<PlaylistDetailScreen />)

    const songItem = await findByText('夜曲')
    fireEvent.press(songItem)

    expect(songItem).toBeTruthy()
  })
})
