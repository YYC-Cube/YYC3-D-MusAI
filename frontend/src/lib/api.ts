import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'

export interface ApiErrorResponse {
  status: number
  message: string
  code?: string
  data?: unknown
}

export interface ApiRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
  _requestId?: string
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:25101/api'

const MAX_RETRY = 2
const RETRYABLE_STATUS = [408, 429, 500, 502, 503, 504]
const RETRY_DELAY_BASE = 1000

function generateRequestId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

function getRetryDelay(attempt: number): number {
  const jitter = Math.random() * 500
  return Math.min(RETRY_DELAY_BASE * Math.pow(2, attempt) + jitter, 10000)
}

function classifyError(error: AxiosError): string {
  if (!error.response) {
    if (error.code === 'ECONNABORTED' || error.code === 'ERR_CANCELED') return 'TIMEOUT'
    if (!error.request) return 'CLIENT_ERROR'
    return 'NETWORK_ERROR'
  }
  const status = error.response.status
  if (status === 401) return 'UNAUTHORIZED'
  if (status === 403) return 'FORBIDDEN'
  if (status === 404) return 'NOT_FOUND'
  if (status === 429) return 'RATE_LIMITED'
  if (status >= 500) return 'SERVER_ERROR'
  if (status >= 400) return 'CLIENT_ERROR'
  return 'UNKNOWN'
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    config.headers['X-Request-ID'] = generateRequestId()
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as ApiRequestConfig
    const errorCode = classifyError(error)

    if (error.response) {
      const { status, data } = error.response

      if (status === 401 && !originalRequest._retry) {
        originalRequest._retry = true

        try {
          const refreshToken = localStorage.getItem('refresh_token')
          if (!refreshToken) throw new Error('No refresh token')

          const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          }, { withCredentials: true })

          const { token, expires_in } = refreshResponse.data.data
          localStorage.setItem('auth_token', token)
          localStorage.setItem('token_expires_at', String(Date.now() + expires_in * 1000))

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`
          }
          return api(originalRequest)
        } catch {
          localStorage.removeItem('auth_token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('token_expires_at')
          localStorage.removeItem('user')

          if (!window.location.pathname.includes('/login') &&
            !window.location.pathname.includes('/register')) {
            window.location.href = '/login'
          }

          return Promise.reject<ApiErrorResponse>({
            status: 401,
            message: '会话已过期，请重新登录',
            code: 'UNAUTHORIZED',
          })
        }
      }

      const retryCount = originalRequest._retry ? 1 : 0
      if (RETRYABLE_STATUS.includes(status) && retryCount < MAX_RETRY) {
        originalRequest._retry = true
        const delay = getRetryDelay(retryCount)
        await new Promise(resolve => setTimeout(resolve, delay))
        return api(originalRequest)
      }

      const errorData = data as { error?: { message?: string } } | undefined

      return Promise.reject<ApiErrorResponse>({
        status,
        message: errorData?.error?.message || '请求失败',
        code: errorCode,
        data,
      })
    } else if (error.request) {
      return Promise.reject<ApiErrorResponse>({
        status: 0,
        message: '网络连接失败，请检查网络',
        code: 'NETWORK_ERROR',
      })
    } else {
      return Promise.reject<ApiErrorResponse>({
        status: 0,
        message: error.message || '未知错误',
        code: errorCode,
      })
    }
  }
)

export default api
