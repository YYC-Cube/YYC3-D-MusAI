import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { useAuthStore } from '@/stores/authStore'

export default function SettingsScreen() {
  const navigation = useNavigation()
  
  const user = useAuthStore((state) => state.user)
  const actions = useAuthStore((state) => state.actions)

  const [notifications, setNotifications] = useState(true)
  const [autoPlay, setAutoPlay] = useState(true)
  const [highQualityAudio, setHighQualityAudio] = useState(false)
  const [darkMode, setDarkMode] = useState(true)

  function handleLogout() {
    Alert.alert(
      '确认退出',
      '确定要退出登录吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '退出',
          style: 'destructive',
          onPress: async () => {
            await actions.logout()
            // Navigation will handle redirect to login
          },
        },
      ]
    )
  }

  function renderSettingItem({
    icon,
    title,
    subtitle,
    onPress,
    rightComponent,
    showArrow = true,
  }: {
    icon: string
    title: string
    subtitle?: string
    onPress?: () => void
    rightComponent?: React.ReactNode
    showArrow?: boolean
  }) {
    return (
      <TouchableOpacity
        style={styles.settingItem}
        onPress={onPress}
        disabled={!onPress}
        activeOpacity={0.7}
      >
        <View style={styles.settingLeft}>
          <Ionicons name={icon as any} size={22} color="#6366f1" />
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>{title}</Text>
            {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
          </View>
        </View>
        
        <View style={styles.settingRight}>
          {rightComponent}
          {showArrow && onPress && !rightComponent && (
            <Ionicons name="chevron-forward" size={20} color="#71717a" />
          )}
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <TouchableOpacity
          style={styles.profileCard}
          onPress={() => navigation.navigate('ProfileEdit' as never)}
          activeOpacity={0.7}
        >
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color="#6366f1" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.username || '用户'}</Text>
            <Text style={styles.profileEmail}>{user?.email || ''}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#71717a" />
        </TouchableOpacity>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>账户</Text>

          {renderSettingItem({
            icon: 'person-outline',
            title: '个人资料',
            subtitle: '编辑头像、用户名等',
            onPress: () => navigation.navigate('ProfileEdit' as never),
          })}

          {renderSettingItem({
            icon: 'lock-closed-outline',
            title: '修改密码',
            subtitle: '更新您的登录密码',
            onPress: () => Alert.alert('提示', '密码修改功能开发中'),
          })}

          {renderSettingItem({
            icon: 'finger-print-outline',
            title: '生物识别登录',
            subtitle: 'Face ID / Touch ID',
            onPress: () => Alert.alert('提示', '请在登录页设置生物识别'),
          })}
        </View>

        {/* Playback Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>播放</Text>

          {renderSettingItem({
            icon: 'play-circle-outline',
            title: '自动播放',
            subtitle: '当前歌曲结束后自动播放下一首',
            rightComponent: (
              <Switch
                value={autoPlay}
                onValueChange={setAutoPlay}
                trackColor={{ false: '#27272a', true: '#6366f1' }}
                thumbColor="#ffffff"
              />
            ),
            showArrow: false,
          })}

          {renderSettingItem({
            icon: 'musical-notes-outline',
            title: '高品质音频',
            subtitle: '使用更高比特率，消耗更多流量',
            rightComponent: (
              <Switch
                value={highQualityAudio}
                onValueChange={setHighQualityAudio}
                trackColor={{ false: '#27272a', true: '#6366f1' }}
                thumbColor="#ffffff"
              />
            ),
            showArrow: false,
          })}
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>通知</Text>

          {renderSettingItem({
            icon: 'notifications-outline',
            title: '推送通知',
            subtitle: '接收新歌、推荐等通知',
            rightComponent: (
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: '#27272a', true: '#6366f1' }}
                thumbColor="#ffffff"
              />
            ),
            showArrow: false,
          })}
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>外观</Text>

          {renderSettingItem({
            icon: 'moon-outline',
            title: '深色模式',
            subtitle: '当前已启用',
            rightComponent: (
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: '#27272a', true: '#6366f1' }}
                thumbColor="#ffffff"
              />
            ),
            showArrow: false,
          })}
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>关于</Text>

          {renderSettingItem({
            icon: 'information-circle-outline',
            title: '关于 D-Music',
            subtitle: '版本 1.0.0 (Build 2024)',
            onPress: () => Alert.alert('D-Music', '智能音乐平台 v1.0.0\n\n© 2024 D-Music Team'),
          })}

          {renderSettingItem({
            icon: 'document-text-outline',
            title: '服务条款与隐私政策',
            onPress: () => Alert.alert('法律文件', '即将跳转到相关页面'),
          })}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#ef4444" />
          <Text style={styles.logoutButtonText}>退出登录</Text>
        </TouchableOpacity>

        {/* Version Info */}
        <Text style={styles.versionText}>D-Music v1.0.0 · Made with ❤️</Text>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181b',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#27272a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fafafa',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#a1a1aa',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#71717a',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#18181b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  settingText: {
    marginLeft: 14,
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#fafafa',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#71717a',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#18181b',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: '#3f1212',
    marginTop: 8,
    gap: 10,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#52525b',
    marginTop: 32,
  },
})
