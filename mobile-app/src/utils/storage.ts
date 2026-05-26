import * as SecureStore from 'expo-secure-store'
import AsyncStorage from '@react-native-async-storage/async-storage'

class SecureStorageHelper {
  private secureKeys = [
    'auth_token',
    'refresh_token',
    'biometric_enabled',
    'user_credentials_hash',
  ]

  async get(key: string): Promise<string | null> {
    try {
      if (this.secureKeys.includes(key)) {
        return await SecureStore.getItemAsync(key)
      }
      return await AsyncStorage.getItem(key)
    } catch (error) {
      console.error(`Error getting ${key}:`, error)
      return null
    }
  }

  async set(key: string, value: string): Promise<void> {
    try {
      if (this.secureKeys.includes(key)) {
        await SecureStore.setItemAsync(key, value)
      } else {
        await AsyncStorage.setItem(key, value)
      }
    } catch (error) {
      console.error(`Error setting ${key}:`, error)
    }
  }

  async remove(key: string): Promise<void> {
    try {
      if (this.secureKeys.includes(key)) {
        await SecureStore.deleteItemAsync(key)
      } else {
        await AsyncStorage.removeItem(key)
      }
    } catch (error) {
      console.error(`Error removing ${key}:`, error)
    }
  }

  async multiRemove(keys: string[]): Promise<void> {
    try {
      const secureKeysToRemove = keys.filter((k) => this.secureKeys.includes(k))
      const regularKeysToRemove = keys.filter((k) => !this.secureKeys.includes(k))

      if (secureKeysToRemove.length > 0) {
        for (const key of secureKeysToRemove) {
          await SecureStore.deleteItemAsync(key)
        }
      }

      if (regularKeysToRemove.length > 0) {
        await AsyncStorage.multiRemove(regularKeysToRemove)
      }
    } catch (error) {
      console.error('Error in multiRemove:', error)
    }
  }

  async clearAll(): Promise<void> {
    try {
      // Clear all secure storage keys
      for (const key of this.secureKeys) {
        await SecureStore.deleteItemAsync(key).catch(() => {})
      }

      // Clear all AsyncStorage
      const allKeys = await AsyncStorage.getAllKeys()
      await AsyncStorage.multiRemove(allKeys)
    } catch (error) {
      console.error('Error clearing all storage:', error)
    }
  }
}

export const secureStorage = new SecureStorageHelper()
export default secureStorage
