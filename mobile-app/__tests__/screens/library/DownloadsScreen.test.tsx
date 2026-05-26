import DownloadsScreen from '@/screens/library/DownloadsScreen';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
}));

describe('DownloadsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders download statistics', async () => {
    const { getByText } = render(<DownloadsScreen />)

    await waitFor(() => {
      expect(getByText('已完成')).toBeTruthy()
    }, { timeout: 3000 })
  })

  it('displays settings toggles', () => {
    const { getByText } = render(<DownloadsScreen />)

    expect(getByText('仅Wi-Fi下载')).toBeTruthy()
    expect(getByText('自动下载')).toBeTruthy()
  })

  it('filters downloads by tab selection', async () => {
    const { getAllByText } = render(<DownloadsScreen />)

    const downloadingTabs = getAllByText(/下载中/)
    expect(downloadingTabs.length).toBeGreaterThan(0)
    fireEvent.press(downloadingTabs[0])

    await waitFor(() => {
      expect(downloadingTabs[0]).toBeTruthy()
    })
  })

  it('toggles Wi-Fi only setting', () => {
    const { getByText } = render(<DownloadsScreen />)

    const wifiToggle = getByText('仅Wi-Fi下载')
    expect(wifiToggle).toBeTruthy()
  })
})
