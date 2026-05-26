import apiService from './api'
import AsyncStorage from '@react-native-async-storage/async-storage'

export interface DownloadItem {
  id: string
  song_id: string
  title: string
  artist: string
  album: string
  cover_url: string
  file_size: number
  file_path: string
  download_progress: number
  status: 'downloading' | 'completed' | 'paused' | 'error' | 'waiting'
  quality: 'low' | 'standard' | 'high' | 'lossless'
  downloaded_at: string
}

export interface Notification {
  id: string
  type: 'system' | 'social' | 'music' | 'promotion' | 'update'
  title: string
  message: string
  image_url?: string
  timestamp: string
  is_read: boolean
  action_url?: string
  action_text?: string
}

export interface PlaybackSettings {
  audio_quality: 'low' | 'standard' | 'high' | 'lossless'
  equalizer_preset: string
  crossfade_enabled: boolean
  crossfade_duration: number
  gapless_playback: boolean
  normalize_volume: boolean
  auto_play: boolean
  lyrics_display: boolean
  lyrics_sync: boolean
  sleep_timer_minutes: number | null
}

class UserService {
  // Downloads
  async getDownloads(): Promise<DownloadItem[]> {
    const response = await apiService.get<DownloadItem[]>('/downloads')
    return response.data
  }

  async startDownload(
    songId: string,
    quality: 'low' | 'standard' | 'high' | 'lossless' = 'high'
  ): Promise<DownloadItem> {
    const response = await apiService.post<DownloadItem>('/downloads', {
      song_id: songId,
      quality,
    })
    return response.data
  }

  async pauseDownload(downloadId: string): Promise<void> {
    await apiService.put(`/downloads/${downloadId}/pause`)
  }

  async resumeDownload(downloadId: string): Promise<void> {
    await apiService.put(`/downloads/${downloadId}/resume`)
  }

  async cancelDownload(downloadId: string): Promise<void> {
    await apiService.delete(`/downloads/${downloadId}`)
  }

  async deleteDownloadedFile(downloadId: string): Promise<void> {
    await apiService.delete(`/downloads/${downloadId}/file`)
  }

  // Notifications
  async getNotifications(page: number = 1, limit: number = 20): Promise<{
    notifications: Notification[]
    total: number
    unread_count: number
    has_more: boolean
  }> {
    const response = await apiService.get<{
      notifications: Notification[]
      total: number
      unread_count: number
      has_more: boolean
    }>('/notifications', {
      params: { page, limit },
    })
    return response.data
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await apiService.put(`/notifications/${notificationId}/read`)
  }

  async markAllNotificationsAsRead(): Promise<void> {
    await apiService.put('/notifications/read-all')
  }

  async deleteNotification(notificationId: string): Promise<void> {
    await apiService.delete(`/notifications/${notificationId}`)
  }

  // Settings
  async getPlaybackSettings(): Promise<PlaybackSettings> {
    const response = await apiService.get<PlaybackSettings>('/settings/playback')
    return response.data
  }

  async updatePlaybackSettings(settings: Partial<PlaybackSettings>): Promise<PlaybackSettings> {
    const response = await apiService.put<PlaybackSettings>('/settings/playback', settings)

    // Cache settings locally
    await AsyncStorage.setItem('playback_settings', JSON.stringify(response.data))

    return response.data
  }

  async getCachedPlaybackSettings(): Promise<PlaybackSettings | null> {
    try {
      const cached = await AsyncStorage.getItem('playback_settings')
      return cached ? JSON.parse(cached) : null
    } catch (error) {
      console.error('Error getting cached playback settings:', error)
      return null
    }
  }

  // Account Security
  async enableTwoFactorAuth(code: string): Promise<void> {
    await apiService.post('/security/2fa/enable', { code })
  }

  async disableTwoFactorAuth(password: string): Promise<void> {
    await apiService.post('/security/2fa/disable', { password })
  }

  async logoutAllDevices(): Promise<void> {
    await apiService.post('/security/logout-all')
  }

  async deleteAccount(password: string, confirmation: string): Promise<void> {
    await apiService.post('/security/delete-account', {
      password,
      confirmation,
    })
  }

  // Device Management
  async getDevices(): Promise<Array<{
    id: string
    device_type: string
    device_name: string
    last_active: string
    is_current: boolean
  }>> {
    const response = await apiService.get<Array<{
      id: string
      device_type: string
      device_name: string
      last_active: string
      is_current: boolean
    }>>('/security/devices')
    return response.data
  }

  async revokeDevice(deviceId: string): Promise<void> {
    await apiService.delete(`/security/devices/${deviceId}`)
  }
}

export const userService = new UserService()
export default userService
