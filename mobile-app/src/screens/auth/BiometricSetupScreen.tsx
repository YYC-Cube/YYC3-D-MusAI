import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as LocalAuthentication from 'expo-local-authentication'
import { secureStorage } from '@/utils/storage'

export default function BiometricSetupScreen({ navigation }: any) {
  const [isSupported, setIsSupported] = useState(false)
  const [biometricType, setBiometricType] = useState<string | null>(null)
  const [isEnabled, setIsEnabled] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [isSettingUp, setIsSettingUp] = useState(false)

  useEffect(() => {
    checkBiometricSupport()
  }, [])

  async function checkBiometricSupport() {
    try {
      setIsChecking(true)
      
      const hasHardware = await LocalAuthentication.hasHardwareAsync()
      const isEnrolled = await LocalAuthentication.isEnrolledAsync()

      if (!hasHardware || !isEnrolled) {
        setIsSupported(false)
        return
      }

      const types = await LocalAuthentication.supportedAuthenticationTypesAsync()

      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        setBiometricType('face-id')
      } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        setBiometricType('touch-id')
      } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        setBiometricType('iris')
      }

      setIsSupported(true)

      // Check current setting
      const saved = await secureStorage.get('biometric_enabled')
      setIsEnabled(saved === 'true')

    } catch (error) {
      console.error('Error checking biometrics:', error)
      setIsSupported(false)
    } finally {
      setIsChecking(false)
    }
  }

  async function toggleBiometricAuth() {
    if (isEnabled) {
      // Disable
      await secureStorage.set('biometric_enabled', 'false')
      setIsEnabled(false)
      Alert.alert('已关闭', '生物识别登录已禁用')
      return
    }

    // Enable - require authentication first to verify
    setIsSettingUp(true)
    
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: '验证您的身份以启用生物识别登录',
        cancelLabel: '取消',
        fallbackLabel: '使用密码',
      })

      if (result.success) {
        await secureStorage.set('biometric_enabled', 'true')
        setIsEnabled(true)
        Alert.alert('✅ 已启用', `已成功启用${getBiometricName()}登录`)
      } else {
        Alert.alert('验证失败', '无法验证身份，请重试')
      }
    } catch (error) {
      console.error('Error setting up biometrics:', error)
      Alert.alert('错误', '设置生物识别时出错')
    } finally {
      setIsSettingUp(false)
    }
  }

  function getBiometricName(): string {
    switch (biometricType) {
      case 'face-id': return 'Face ID'
      case 'touch-id': return 'Touch ID'
      case 'iris': return 'Iris Scan'
      default: return '生物识别'
    }
  }

  function handleSkip() {
    navigation.replace('MainApp')
  }

  function handleContinue() {
    navigation.replace('MainApp')
  }

  if (isChecking) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>正在检测生物识别支持...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (!isSupported) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="warning-outline" size={64} color="#f59e0b" />
          </View>
          <Text style={styles.title}>不支持生物识别</Text>
          <Text style={styles.description}>
            您的设备未配置生物识别功能，或者尚未录入指纹/面部数据。
            您可以继续使用密码登录。
          </Text>
          
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>继续</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          {biometricType === 'face-id' && (
            <Ionicons name="happy-outline" size={80} color="#6366f1" />
          )}
          {(biometricType === 'touch-id' || biometricType === 'iris') && (
            <Ionicons name="finger-print-outline" size={80} color="#6366f1" />
          )}
        </View>

        {/* Title */}
        <Text style={styles.title}>启用{getBiometricName()}</Text>
        <Text style={styles.description}>
          使用{getBiometricName()}快速安全地登录D-Music，
          无需每次输入密码。
        </Text>

        {/* Toggle */}
        <TouchableOpacity
          style={[
            styles.toggleButton,
            isEnabled && styles.toggleButtonEnabled,
            isSettingUp && styles.toggleButtonDisabled,
          ]}
          onPress={toggleBiometricAuth}
          disabled={isSettingUp}
          activeOpacity={0.8}
        >
          {isSettingUp ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Ionicons
                name={isEnabled ? 'checkmark-circle' : 'ellipse-outline'}
                size={24}
                color="#ffffff"
              />
              <Text style={styles.toggleButtonText}>
                {isEnabled ? `${getBiometricName()} 已启用` : `启用 ${getBiometricName()}`}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Benefits List */}
        <View style={styles.benefitsList}>
          <BenefitItem icon="flash-outline" text="快速登录，无需输入密码" />
          <BenefitItem icon="shield-checkmark-outline" text="比传统密码更安全" />
          <BenefitItem icon="phone-portrait-outline" text="一键解锁应用" />
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>稍后再说</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>完成设置</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

function BenefitItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.benefitItem}>
      <Ionicons name={icon as any} size={20} color="#22c55e" />
      <Text style={styles.benefitText}>{text}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#a1a1aa',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#18181b',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 32,
    borderWidth: 2,
    borderColor: '#27272a',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fafafa',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#a1a1aa',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#27272a',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#3f3f46',
  },
  toggleButtonEnabled: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  toggleButtonDisabled: {
    opacity: 0.6,
  },
  toggleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 10,
  },
  benefitsList: {
    marginBottom: 40,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#18181b',
  },
  benefitText: {
    marginLeft: 14,
    fontSize: 15,
    color: '#d4d4d8',
  },
  actions: {
    gap: 12,
  },
  skipButton: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  skipButtonText: {
    fontSize: 16,
    color: '#a1a1aa',
    fontWeight: '500',
  },
  continueButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
})
