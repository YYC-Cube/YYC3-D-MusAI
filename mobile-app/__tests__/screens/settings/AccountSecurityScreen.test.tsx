import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react-native'
import AccountSecurityScreen from '@/screens/settings/AccountSecurityScreen'

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
}));

describe('AccountSecurityScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders security status card', () => {
    const { getByText } = render(<AccountSecurityScreen />)

    expect(getByText('修改密码')).toBeTruthy()
    expect(getByText('双重认证')).toBeTruthy()
  })

  it('displays change password option', () => {
    const { getByText } = render(<AccountSecurityScreen />)

    expect(getByText('修改密码')).toBeTruthy()
  })

  it('displays two-factor auth toggle', () => {
    const { getByText } = render(<AccountSecurityScreen />)

    expect(getByText('双重认证')).toBeTruthy()
  })

  it('shows delete account option in danger zone', () => {
    const { getByText } = render(<AccountSecurityScreen />)

    expect(getByText('删除账户')).toBeTruthy()
  })
})
