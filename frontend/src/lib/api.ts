import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'

export interface ApiErrorResponse {
  status: number
  message: string
  data?: unknown
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:25101/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器 - 添加JWT令牌
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 处理错误和令牌刷新
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response) {
      const { status, data } = error.response

      // 401 未认证 - 尝试刷新令牌
      if (status === 401 && !originalRequest._retry) {
        originalRequest._retry = true

        try {
          const refreshToken = localStorage.getItem('refresh_token')

          if (!refreshToken) {
            throw new Error('No refresh token')
          }

          // 调用刷新令牌接口
          const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          })

          const { token, expires_in } = refreshResponse.data.data

          // 保存新令牌
          localStorage.setItem('auth_token', token)
          localStorage.setItem('token_expires_at', String(Date.now() + expires_in * 1000))

          // 重试原始请求
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`
          }
          return api(originalRequest)
        } catch (refreshError) {
          // 刷新失败，清除所有令牌并跳转登录页
          localStorage.removeItem('auth_token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('token_expires_at')
          localStorage.removeItem('user')

          // 如果不是登录/注册页面，跳转到登录页
          if (!window.location.pathname.includes('/login') &&
              !window.location.pathname.includes('/register')) {
            window.location.href = '/login'
          }

          return Promise.reject<ApiErrorResponse>({
            status: 401,
            message: '会话已过期，请重新登录',
          })
        }
      }

      const errorData = data as { error?: { message?: string } } | undefined

      return Promise.reject<ApiErrorResponse>({
        status,
        message: errorData?.error?.message || '请求失败',
        data,
      })
    } else if (error.request) {
      return Promise.reject<ApiErrorResponse>({
        status: 0,
        message: '网络连接失败，请检查网络',
      })
    } else {
      return Promise.reject<ApiErrorResponse>({
        status: 0,
        message: error.message || '未知错误',
      })
    }
  }
)

export default api
