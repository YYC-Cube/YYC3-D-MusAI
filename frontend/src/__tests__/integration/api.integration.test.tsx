import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../../mocks/server'

describe('API Integration Tests with MSW', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  it('should fetch playlists successfully', async () => {
    const response = await fetch('/api/playlists')
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data[0].name).toBe('我喜欢的音乐')
  })

  it('should handle server error gracefully', async () => {
    server.use(
      http.get('/api/songs', () => {
        return HttpResponse.json(
          { success: false, error: { code: 500, message: '服务器内部错误' } },
          { status: 500 }
        )
      })
    )

    const response = await fetch('/api/songs')
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error.code).toBe(500)
  })

  it('should handle network error simulation', async () => {
    server.use(
      http.get('/api/auth/me', () => {
        return HttpResponse.error()
      })
    )

    await expect(fetch('/api/auth/me')).rejects.toThrow()
  })
})
