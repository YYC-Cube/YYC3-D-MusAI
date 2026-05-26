import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '@/stores/authStore'

export default function RegisterScreen({ navigation }: any) {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { actions: authActions, error } = useAuthStore()

  function updateField(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  function validateForm(): boolean {
    if (!formData.email.trim()) {
      Alert.alert('错误', '请输入邮箱地址')
      return false
    }
    if (!formData.email.includes('@')) {
      Alert.alert('错误', '请输入有效的邮箱地址')
      return false
    }
    if (!formData.username.trim()) {
      Alert.alert('错误', '请输入用户名')
      return false
    }
    if (formData.username.length < 3) {
      Alert.alert('错误', '用户名至少需要3个字符')
      return false
    }
    if (!formData.password) {
      Alert.alert('错误', '请输入密码')
      return false
    }
    if (formData.password.length < 6) {
      Alert.alert('错误', '密码至少需要6个字符')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('错误', '两次输入的密码不一致')
      return false
    }
    return true
  }

  async function handleRegister() {
    if (!validateForm()) return

    setIsLoading(true)
    try {
      await authActions.register(
        formData.email,
        formData.username,
        formData.password
      )
      // 注册成功后跳转到生物识别设置（可选）
      navigation.navigate('BiometricSetup')
    } catch (err) {
      Alert.alert('注册失败', error || '注册过程中发生错误')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#fafafa" />
            </TouchableOpacity>
            <Text style={styles.title}>创建账户</Text>
            <Text style={styles.subtitle}>加入 D-Music 开始音乐之旅</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Username Input */}
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#a1a1aa" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="用户名"
                placeholderTextColor="#71717a"
                value={formData.username}
                onChangeText={(text) => updateField('username', text)}
                autoCapitalize="none"
                autoComplete="username"
                editable={!isLoading}
              />
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#a1a1aa" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="邮箱地址"
                placeholderTextColor="#71717a"
                value={formData.email}
                onChangeText={(text) => updateField('email', text)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!isLoading}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#a1a1aa" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="密码"
                placeholderTextColor="#71717a"
                value={formData.password}
                onChangeText={(text) => updateField('password', text)}
                secureTextEntry={!showPassword}
                autoComplete="new-password"
                editable={!isLoading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="#a1a1aa"
                />
              </TouchableOpacity>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#a1a1aa" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="确认密码"
                placeholderTextColor="#71717a"
                value={formData.confirmPassword}
                onChangeText={(text) => updateField('confirmPassword', text)}
                secureTextEntry={!showPassword}
                autoComplete="new-password"
                editable={!isLoading}
              />
            </View>

            {/* Password Strength Indicator */}
            {formData.password.length > 0 && (
              <View style={styles.strengthContainer}>
                <View style={styles.strengthBar}>
                  {[...Array(4)].map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.strengthSegment,
                        i < getPasswordStrength(formData.password)
                          ? getStrengthColor(formData.password)
                          : styles.strengthEmpty,
                      ]}
                    />
                  ))}
                </View>
                <Text style={styles.strengthText}>
                  {getStrengthLabel(formData.password)}
                </Text>
              </View>
            )}

            {/* Terms */}
            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                注册即表示您同意我们的{' '}
                <Text style={styles.termsLink}>服务条款</Text> 和{' '}
                <Text style={termsLink}>隐私政策</Text>
              </Text>
            </View>

            {/* Register Button */}
            <TouchableOpacity
              style={[styles.registerButton, isLoading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.registerButtonText}>注册</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Login Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>已有账户？</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>立即登录</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

function getPasswordStrength(password: string): number {
  let strength = 0
  if (password.length >= 6) strength++
  if (password.length >= 10) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) strength++
  return strength
}

function getStrengthColor(password: string): any {
  const strength = getPasswordStrength(password)
  if (strength <= 1) return { backgroundColor: '#ef4444' }
  if (strength === 2) return { backgroundColor: '#f59e0b' }
  if (strength === 3) return { backgroundColor: '#22c55e' }
  return { backgroundColor: '#6366f1' }
}

function getStrengthLabel(password: string): string {
  const strength = getPasswordStrength(password)
  if (strength <= 1) return '弱'
  if (strength === 2) return '一般'
  if (strength === 3) return '强'
  return '非常强'
}

const termsLink = StyleSheet.create({
  link: { color: '#6366f1' }
}).link

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  header: {
    marginBottom: 32,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#18181b',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fafafa',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#a1a1aa',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#27272a',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#fafafa',
  },
  passwordInput: {
    marginRight: 8,
  },
  strengthContainer: {
    marginBottom: 20,
  },
  strengthBar: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  strengthSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthEmpty: {
    backgroundColor: '#27272a',
  },
  strengthText: {
    fontSize: 13,
    color: '#a1a1aa',
  },
  termsContainer: {
    marginBottom: 24,
  },
  termsText: {
    fontSize: 13,
    color: '#71717a',
    lineHeight: 18,
  },
  termsLink: {
    color: '#6366f1',
    fontWeight: '500',
  },
  registerButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 15,
    color: '#a1a1aa',
    marginRight: 6,
  },
  loginLink: {
    fontSize: 15,
    color: '#6366f1',
    fontWeight: '600',
  },
})
