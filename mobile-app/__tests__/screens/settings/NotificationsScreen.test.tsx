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

  it('shows mark all as read button when unread exist', async () => {
    const { findByText } = render(
      <NotificationsScreen navigation={mockNavigation} />
    )

    await waitFor(async () => {
      const markAllButton = await findByText('全部已读')
      expect(markAllButton).toBeTruthy()
    }, { timeout: 3000 })
  })
})