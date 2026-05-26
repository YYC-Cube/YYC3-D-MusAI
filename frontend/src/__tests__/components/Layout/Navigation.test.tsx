import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Navigation from '@/components/Layout/Navigation'

const mockUseAuthStore = vi.fn()

vi.mock('@/stores/authStore', () => ({
  useAuthStore: (...args: any[]) => mockUseAuthStore(...args),
}))

describe('Navigation', () => {
  it('should render navigation links', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: { username: 'TestUser' },
      actions: { logout: vi.fn() },
    })

    render(
      <MemoryRouter>
        <Navigation />
      </MemoryRouter>
    )

    expect(screen.getByText(/首页/i)).toBeInTheDocument()
    expect(screen.getByText(/发现/i)).toBeInTheDocument()
    expect(screen.getByText(/歌单/i)).toBeInTheDocument()
  })

  it('should render user info when authenticated', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: { username: 'TestUser' },
      actions: { logout: vi.fn() },
    })

    render(
      <MemoryRouter>
        <Navigation />
      </MemoryRouter>
    )

    expect(screen.getByText('TestUser')).toBeInTheDocument()
  })

  it('should render login link when not authenticated', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: false,
      user: null,
      actions: { logout: vi.fn() },
    })

    render(
      <MemoryRouter>
        <Navigation />
      </MemoryRouter>
    )

    expect(screen.getByText(/登录/i)).toBeInTheDocument()
  })

  it('should call logout when logout button clicked', () => {
    const mockLogout = vi.fn()
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: { username: 'TestUser' },
      actions: { logout: mockLogout },
    })

    render(
      <MemoryRouter>
        <Navigation />
      </MemoryRouter>
    )

    const logoutButton = screen.getByTitle(/退出登录/i)
    fireEvent.click(logoutButton)

    expect(mockLogout).toHaveBeenCalled()
  })
})