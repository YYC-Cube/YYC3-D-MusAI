import LoginPage from '@/pages/LoginPage'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock authStore
vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn(() => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    actions: {
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    },
  })),
}))

function renderWithRouter(ui: ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>)
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders login form correctly', () => {
    renderWithRouter(<LoginPage />)

    // 检查关键元素存在
    expect(screen.getByText('欢迎回来')).toBeInTheDocument()
    expect(screen.getByLabelText(/邮箱地址/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/密码/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /登录/i })).toBeInTheDocument()
  })

  it('shows email and password input fields', () => {
    renderWithRouter(<LoginPage />)

    const emailInput = screen.getByPlaceholderText('your@email.com')
    const passwordInput = screen.getByPlaceholderText('••••••••')

    expect(emailInput).toHaveAttribute('type', 'email')
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('disables submit button when loading', async () => {
    const { useAuthStore } = await import('@/stores/authStore')

      // Mock加载状态
      ; (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: true,
        actions: { login: vi.fn() },
      })

    renderWithRouter(<LoginPage />)

    const submitButton = screen.getByRole('button', { name: /登录中/i })
    expect(submitButton).toBeDisabled()
  })

  it('calls login action with correct credentials', async () => {
    const user = userEvent.setup()
    const mockLogin = vi.fn().mockResolvedValue({ token: 'test-token', user: {} })
    const { useAuthStore } = await import('@/stores/authStore')

      ; (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        actions: { login: mockLogin },
      })

    renderWithRouter(<LoginPage />)

    // 填写表单
    await user.type(screen.getByPlaceholderText('your@email.com'), 'test@example.com')
    await user.type(screen.getByPlaceholderText('••••••••'), 'password123')

    // 提交表单
    await user.click(screen.getByRole('button', { name: /登录/i }))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
    })
  })

  it('displays error message when login fails', async () => {
    const user = userEvent.setup()
    const mockLogin = vi.fn().mockRejectedValue(new Error('Invalid credentials'))
    const { useAuthStore } = await import('@/stores/authStore')

      ; (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        actions: { login: mockLogin },
      })

    renderWithRouter(<LoginPage />)

    await user.type(screen.getByPlaceholderText('your@email.com'), 'wrong@email.com')
    await user.type(screen.getByPlaceholderText('••••••••'), 'wrongpass')

    await user.click(screen.getByRole('button', { name: /登录/i }))

    await waitFor(() => {
      expect(screen.getByText(/Invalid credentials|登录失败/i)).toBeInTheDocument()
    })
  })

  it('navigates to register page when clicking register link', () => {
    renderWithRouter(<LoginPage />)

    const registerLink = screen.getByText('立即注册')
    expect(registerLink).toHaveAttribute('href', '/register')
  })

  it('validates required fields before submission', async () => {
    const user = userEvent.setup()
    const mockLogin = vi.fn()
    const { useAuthStore } = await import('@/stores/authStore')

      ; (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        actions: { login: mockLogin },
      })

    renderWithRouter(<LoginPage />)

    // 不填写任何内容直接提交
    await user.click(screen.getByRole('button', { name: /登录/i }))

    // HTML5验证会阻止提交（required属性）
    expect(mockLogin).not.toHaveBeenCalled()
  })
})
