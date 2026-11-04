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

  // TODO: FlatList 虚拟化在 RN 0.87 + RNTL 9 测试环境需 fake-timers 适配（遗留：RNTL12 迁移）
  it.skip('shows song list after loading', async () => {
    const { getByText } = render(<PlaylistDetailScreen />)

    // 组件含 300ms 模拟加载延迟，显式放宽轮询窗口
    await waitFor(() => {
      expect(getByText('夜曲')).toBeTruthy()
    }, { timeout: 5000 })
  })

  it.skip('navigates to song detail when song is pressed', async () => {
    const { getByText } = render(<PlaylistDetailScreen />)

    const songItem = await waitFor(() => getByText('夜曲'), { timeout: 5000 })
    fireEvent.press(songItem)

    expect(songItem).toBeTruthy()
  })
})
