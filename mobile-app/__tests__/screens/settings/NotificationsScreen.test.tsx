import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react-native'
import NotificationsScreen from '@/screens/settings/NotificationsScreen'

const mockNavigation = {
  navigate: jest.fn(),
}

describe('NotificationsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders notifications header', () => {
    const { getByText } = render(
      <NotificationsScreen navigation={mockNavigation} />
    )

    expect(getByText('通知')).toBeTruthy()
  })

  it('displays filter tabs', () => {
    const { getByText } = render(
      <NotificationsScreen navigation={mockNavigation} />
    )

    expect(getByText(/全部/)).toBeTruthy()
    expect(getByText(/未读/)).toBeTruthy()
  })

  // TODO: FlatList 头部按钮在 RN 0.87 + RNTL 9 测试环境需 fake-timers 适配（遗留：RNTL12 迁移）
  it.skip('shows mark all as read button when unread exist', async () => {
    const { getByText } = render(
      <NotificationsScreen navigation={mockNavigation} />
    )

    await waitFor(() => {
      expect(getByText('全部已读')).toBeTruthy()
    }, { timeout: 5000 })
  })
})