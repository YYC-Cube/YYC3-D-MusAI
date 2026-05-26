import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native'
import * as LocalAuthentication from 'expo-local-authentication'
import { useAuthStore } from '@/stores/authStore'
import { secureStorage } from '@/utils/storage'

interface BiometricAuthProps {
  onSuccess: () => void
  onFallback?: () => void // Use password instead
}

export default function BiometricAuth({ onSuccess, onFallback }: BiometricAuthProps) {
  const [isSupported, setIsSupported] = useState(false)
  const [biometricType, setBiometricType] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { user } = useAuthStore()

  useEffect(() => {
    checkBiometricSupport()
  }, [])

  async function checkBiometricSupport() {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync()
      const isEnrolled = await LocalAuthentication.isEnrolledAsync()

      if (!hasHardware || !isEnrolled) {
        setIsSupported(false)
        return
      }

      // Determine biometric type
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync()

      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        setBiometricType('face-id')
      } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        setBiometricType('touch-id')
      } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        setBiometricType('iris')
      }

      setIsSupported(true)
    } catch (error) {
      console.error('Error checking biometric support:', error)
      setIsSupported(false)
    }
  }

  async function authenticate() {
    setIsLoading(true)
    setError(null)

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: '验证身份以继续',
        cancelLabel: '取消',
        disableDeviceFallback: true,
      })

      if (result.success) {
        onSuccess()
      } else {
        setError('验证失败，请重试')
      }
    } catch (error) {
      console.error('Biometric authentication error:', error)
      setError('验证过程中发生错误')
    } finally {
      setIsLoading(false)
    }
  }

  function handleFallback() {
    if (onFallback) {
      onFallback()
    } else {
      Alert.alert('提示', '请使用密码登录')
    }
  }

  if (!isSupported) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>设备不支持生物识别</Text>
        <TouchableOpacity style={styles.fallbackButton} onPress={handleFallback}>
          <Text style={styles.fallbackButtonText}>使用密码</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {biometricType === 'face-id'
          ? '面容 ID'
          : biometricType === 'touch-id'
          ? '指纹解锁'
          : '生物识别'}
      </Text>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <TouchableOpacity
        style={[styles.authButton, isLoading && styles.authButtonDisabled]}
        onPress={authenticate}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.authButtonText}>验证身份</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.fallbackButton} onPress={handleFallback}>
        <Text style={styles.fallbackButtonText}>使用密码</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  authButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  authButtonDisabled: {
    opacity: 0.6,
  },
  authButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  fallbackButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  fallbackButtonText: {
    color: '#a1a1aa',
    fontSize: 14,
  },
})
