import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/auth/me', () => {
    return HttpResponse.json({
      success: true,
      data: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'test@example.com',
        username: 'testuser',
        avatar: null,
        role: 'user',
      },
    })
  }),

  http.post('/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string }

    if (body.email === 'test@example.com' && body.password === 'password123') {
      return HttpResponse.json({
        success: true,
        data: {
          token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
          expires_in: 900,
          user: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            email: body.email,
            username: 'testuser',
            avatar: null,
            role: 'user',
          },
        },
      })
    }

    return HttpResponse.json(
      {
        success: false,
        error: {
          code: 401,
          message: '邮箱或密码错误',
        },
      },
      { status: 401 }
    )
  }),

  http.get('/api/songs', () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: '1',
          title: '测试歌曲1',
          artist: '测试艺术家',
          album: '测试专辑',
          duration: 180,
          cover_url: null,
        },
        {
          id: '2',
          title: '测试歌曲2',
          artist: '测试艺术家2',
          album: '测试专辑2',
          duration: 240,
          cover_url: null,
        },
      ],
    })
  }),

  http.get('/api/playlists', () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: '1',
          name: '我喜欢的音乐',
          description: '收藏的歌曲',
          cover_url: null,
          song_count: 10,
        },
      ],
    })
  }),
]
