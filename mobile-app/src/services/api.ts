import AsyncStorage from '@react-native-async-storage/async-storage'
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import * as SecureStore from 'expo-secure-store'

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:25101/api'

export interface ApiResponse<T = unknown> {
  success: boolean
  data: T
  message?: string
  error?: string
}

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

class ApiService {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors(): void {
    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const token = await SecureStore.getItemAsync('auth_token')

        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }

        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor - handle errors
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config as RetryableRequestConfig

        // Handle 401 Unauthorized - Token expired
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            const refreshToken = await SecureStore.getItemAsync('refresh_token')

            if (!refreshToken) {
              throw new Error('No refresh token')
            }

            const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
              refreshToken,
            })

            const { token } = response.data.data
            await SecureStore.setItemAsync('auth_token', token)

            originalRequest.headers.Authorization = `Bearer ${token}`
            return this.client(originalRequest)
          } catch (refreshError) {
            // Clear tokens and redirect to login
            await SecureStore.deleteItemAsync('auth_token')
            await SecureStore.deleteItemAsync('refresh_token')
            await AsyncStorage.removeItem('user_data')

            return Promise.reject(refreshError)
          }
        }

        return Promise.reject(error)
      }
    )
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.get(url, config)
      return response.data
    } catch (error: unknown) {
      throw this.handleError(error)
    }
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.post(url, data, config)
      return response.data
    } catch (error: unknown) {
      throw this.handleError(error)
    }
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.put(url, data, config)
      return response.data
    } catch (error: unknown) {
      throw this.handleError(error)
    }
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.delete(url, config)
      return response.data
    } catch (error: unknown) {
      throw this.handleError(error)
    }
  }

  async uploadFile<T>(url: string, fileUri: string, fieldName: string = 'file', additionalData?: Record<string, string>): Promise<ApiResponse<T>> {
    try {
      const formData = new FormData()

      // Get file name from uri
      const fileName = fileUri.split('/').pop() || 'file'
      const fileType = fileName.endsWith('.png') ? 'image/png' : fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') ? 'image/jpeg' : 'application/octet-stream'

      formData.append(fieldName, {
        uri: fileUri,
        name: fileName,
        type: fileType,
      } as unknown as Blob)

      // Append additional data if provided
      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, value)
        })
      }

      const response: AxiosResponse<ApiResponse<T>> = await this.client.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      return response.data
    } catch (error: unknown) {
      throw this.handleError(error)
    }
  }

  private handleError(error: unknown): Error {
    if (axios.isAxiosError(error) && error.response) {
      const { status, data } = error.response

      switch (status) {
        case 400:
          return new Error(data.message || '请求参数错误')
        case 401:
          return new Error(data.message || '未授权，请重新登录')
        case 403:
          return new Error(data.message || '没有权限访问此资源')
        case 404:
          return new Error(data.message || '资源不存在')
        case 429:
          return new Error('请求过于频繁，请稍后再试')
        case 500:
          return new Error('服务器内部错误，请稍后重试')
        default:
          return new Error(data.message || `服务器错误 (${status})`)
      }
    } else if (axios.isAxiosError(error) && error.request) {
      return new Error('网络连接失败，请检查您的网络设置')
    } else if (error instanceof Error) {
      return new Error(error.message || '发生未知错误')
    } else {
      return new Error('发生未知错误')
    }
  }
}

export const apiService = new ApiService()
export default apiService
