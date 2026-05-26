import PlaybackSettingsScreen from '@/screens/settings/PlaybackSettingsScreen';
import { render } from '@testing-library/react-native';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
}));

describe('PlaybackSettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders audio quality options', () => {
    const { getByText } = render(<PlaybackSettingsScreen />)

    expect(getByText('低音质')).toBeTruthy()
    expect(getByText('标准')).toBeTruthy()
    expect(getByText('高音质')).toBeTruthy()
    expect(getByText('无损')).toBeTruthy()
  })

  it('displays equalizer presets', () => {
    const { getByText } = render(<PlaybackSettingsScreen />)

    expect(getByText('均衡器')).toBeTruthy()
  })

  it('shows crossfade setting', () => {
    const { getByText } = render(<PlaybackSettingsScreen />)

    expect(getByText('交叉淡入淡出')).toBeTruthy()
  })

  it('displays sleep timer option', () => {
    const { getByText } = render(<PlaybackSettingsScreen />)

    expect(getByText('睡眠定时器')).toBeTruthy()
    expect(getByText('15分钟')).toBeTruthy()
  })
})
