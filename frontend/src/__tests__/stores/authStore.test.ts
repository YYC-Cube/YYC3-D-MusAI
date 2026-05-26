import { useAuthStore } from '@/stores/authStore'
import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock api module (default export)
vi.mock('@/lib/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}))

describe('useAuthStore', () => {
  beforeEach(() => {
    // 清除localStorage
    localStorage.clear()
    // 重置store状态
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    })
  })

  it('initializes with default state', () => {
    const { result } = renderHook(() => useAuthStore())

    expect(result.current.user).toBeNull()
    expect(result.current.token).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.actions).toBeDefined()
  })

  it('updates state on successful login', async () => {
    const { result } = renderHook(() => useAuthStore())

    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      username: 'TestUser',
      role: 'user' as const,
    }

    const mockToken = 'jwt-token-xyz'

    // Mock API响应 - authService.login 直接返回 { token, user }
    const api = await import('@/lib/api')
      ; (api.default.post as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        token: mockToken,
        user: mockUser,
      })

    await act(async () => {
      await result.current.actions.login('test@example.com', 'password123')
    })

    expect(result.current.user).toEqual(mockUser)
    expect(result.current.token).toBe(mockToken)
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.isLoading).toBe(false)
  })

  it('sets loading state during login', async () => {
    const { result } = renderHook(() => useAuthStore())

    let resolvePromise: (value: unknown) => void
    const api = await import('@/lib/api')
      ; (api.default.post as unknown as ReturnType<typeof vi.fn>).mockImplementationOnce(
        () => new Promise((resolve) => { resolvePromise = resolve; })
      )

    let loadingFinished = false

    act(() => {
      result.current.actions.login('test@example.com', 'pass').finally(() => {
        loadingFinished = true
      })
    })

    expect(result.current.isLoading).toBe(true)

    // 完成请求
    await act(async () => {
      resolvePromise!({
        token: 'token',
        user: {},
      })
    })

    expect(result.current.isLoading).toBe(false)
    expect(loadingFinished).toBe(true)
  })

  it('clears state on logout', async () => {
    const { result } = renderHook(() => useAuthStore())

    // 先设置已登录状态
    await act(async () => {
      useAuthStore.setState({
        user: { id: '123', email: 'a@b.com', username: 'u', role: 'user' as const },
        token: 'token-abc',
        isAuthenticated: true,
        isLoading: false,
      })
    })

    expect(result.current.isAuthenticated).toBe(true)

    // 执行登出
    act(() => {
      result.current.actions.logout()
    })

    expect(result.current.user).toBeNull()
    expect(result.current.token).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('persists state to localStorage', async () => {
    const { result } = renderHook(() => useAuthStore())

    const mockUser = { id: '456', email: 'p@q.com', username: 'p', role: 'user' as const }
    const mockToken = 'token-persist'

    const api = await import('@/lib/api')
      ; (api.default.post as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        token: mockToken,
        user: mockUser,
      })

    await act(async () => {
      await result.current.actions.login('p@q.com', 'pass')
    })

    // 验证localStorage被更新
    const storedData = localStorage.getItem('auth-storage')
    expect(storedData).not.toBeNull()

    const parsed = JSON.parse(storedData!)
    expect(parsed.state.user).toEqual(mockUser)
    expect(parsed.state.token).toBe(mockToken)
    expect(parsed.state.isAuthenticated).toBe(true)
  })

  it('handles registration correctly', async () => {
    const { result } = renderHook(() => useAuthStore())

    const newUser = {
      id: 'new-user-id',
      email: 'new@example.com',
      username: 'NewUser',
      role: 'user' as const,
    }

    const api = await import('@/lib/api')
      ; (api.default.post as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        token: 'new-token',
        user: newUser,
      })

    await act(async () => {
      await result.current.actions.register('new@example.com', 'NewUser', 'newpass123')
    })

    expect(result.current.user).toEqual(newUser)
    expect(result.current.isAuthenticated).toBe(true)
    expect(api.default.post).toHaveBeenCalledWith('/auth/register', {
      email: 'new@example.com',
      username: 'NewUser',
      password: 'newpass123',
    })
  })

  it('throws error on login failure', async () => {
    const { result } = renderHook(() => useAuthStore())

    const api = await import('@/lib/api')
      ; (api.default.post as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'))

    await expect(
      act(async () => {
        await result.current.actions.login('fail@test.com', 'wrong')
      })
    ).rejects.toThrow('Network error')

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.isLoading).toBe(false)
  })
})
