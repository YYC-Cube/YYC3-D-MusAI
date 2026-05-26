import { HttpResponse, http } from 'msw'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { server } from '../../mocks/server'

// 集成测试示例：验证 MSW 拦截 API 请求
describe('Auth Integration Tests', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  it('should mock login API successfully', async () => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
    })

    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.token).toBe('mock-access-token')
    expect(data.data.user.email).toBe('test@example.com')
  })

  it('should mock login API failure', async () => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'wrong@example.com',
        password: 'wrongpassword',
      }),
    })

    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
    expect(data.error.code).toBe(401)
  })

  it('should mock get current user API', async () => {
    const response = await fetch('/api/auth/me')
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.email).toBe('test@example.com')
    expect(data.data.username).toBe('testuser')
  })

  it('should mock songs list API', async () => {
    const response = await fetch('/api/songs')
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toHaveLength(2)
    expect(data.data[0].title).toBe('测试歌曲1')
  })

  it('should handle dynamic mock override', async () => {
    server.use(
      http.get('/api/songs', () => {
        return HttpResponse.json({
          success: true,
          data: [{ id: '3', title: '覆盖歌曲', artist: '覆盖艺术家', album: '', duration: 120, cover_url: null }],
        })
      })
    )

    const response = await fetch('/api/songs')
    const data = await response.json()

    expect(data.data).toHaveLength(1)
    expect(data.data[0].title).toBe('覆盖歌曲')
  })
})
