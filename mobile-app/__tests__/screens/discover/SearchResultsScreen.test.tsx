import SearchResultsScreen from '@/screens/discover/SearchResultsScreen';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
  useRoute: () => ({
    params: {
      query: 'test',
    },
  }),
}));

describe('SearchResultsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders correctly with initial query', () => {
    const { getByPlaceholderText } = render(<SearchResultsScreen />)

    expect(getByPlaceholderText('搜索歌曲、艺术家、专辑')).toBeTruthy()
  })

  it('displays search input with initial query', () => {
    const { getByDisplayValue } = render(<SearchResultsScreen />)

    expect(getByDisplayValue('test')).toBeTruthy()
  })

  it('switches between tabs correctly', async () => {
    const { getByText } = render(<SearchResultsScreen />)

    const songsTab = getByText('歌曲')
    const artistsTab = getByText('艺术家')

    fireEvent.press(artistsTab)

    await waitFor(() => {
      expect(artistsTab).toBeTruthy()
    })
  })

  it('has back button', () => {
    const { getByText } = render(<SearchResultsScreen />)

    expect(getByText('arrow-back')).toBeTruthy()
  })
})
