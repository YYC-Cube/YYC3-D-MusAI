import ArtistDetailScreen from '@/screens/discover/ArtistDetailScreen';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
  useRoute: () => ({
    params: {
      artist: {
        id: '1',
        name: '周杰伦',
        avatar_url: 'https://example.com/avatar.jpg',
        bio: '华语流行音乐天王',
        followers_count: 1000000,
        following: false,
        genres: ['流行', 'R&B'],
      },
    },
  }),
}));

describe('ArtistDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders artist information correctly', () => {
    const { getByText } = render(<ArtistDetailScreen />)

    expect(getByText('周杰伦')).toBeTruthy()
    expect(getByText('100.0万 粉丝')).toBeTruthy()
  })

  it('displays follow button', () => {
    const { getByText } = render(<ArtistDetailScreen />)

    expect(getByText('关注')).toBeTruthy()
  })

  it('toggles follow status when button pressed', async () => {
    const { getByText, queryByText } = render(<ArtistDetailScreen />)

    const followButton = getByText('关注')
    fireEvent.press(followButton)

    await waitFor(() => {
      expect(queryByText('已关注')).toBeTruthy()
    })
  })

  it('displays genre tags', () => {
    const { getByText } = render(<ArtistDetailScreen />)

    expect(getByText('流行')).toBeTruthy()
    expect(getByText('R&B')).toBeTruthy()
  })

  it('displays tabs', () => {
    const { getByText, getAllByText } = render(<ArtistDetailScreen />)

    expect(getAllByText('热门歌曲').length).toBeGreaterThanOrEqual(1)
    expect(getByText('专辑')).toBeTruthy()
    expect(getByText('简介')).toBeTruthy()
  })

  it('shows bio in about tab', async () => {
    const { getByText, queryByText } = render(<ArtistDetailScreen />)

    const aboutTab = getByText('简介')
    fireEvent.press(aboutTab)

    await waitFor(() => {
      expect(queryByText('华语流行音乐天王')).toBeTruthy()
    })
  })
})
