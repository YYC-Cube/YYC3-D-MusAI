import { useAuthStore } from '@/stores/authStore'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import * as ImagePicker from 'expo-image-picker'
import React, { useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function ProfileEditScreen() {
  const navigation = useNavigation()
  const user = useAuthStore((state) => state.user)
  const actions = useAuthStore((state) => state.actions)

  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: '音乐爱好者 🎵 | 分享美好旋律',
  })

  const [avatarUri, setAvatarUri] = useState<string | null>(user?.avatar_url || null)
  const [isLoading, setIsLoading] = useState(false)

  function updateField(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  async function pickImage() {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync()

      if (!permissionResult.granted) {
        Alert.alert('权限被拒绝', '需要相册权限才能选择头像')
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (!result.canceled && result.assets && result.assets[0]) {
        setAvatarUri(result.assets[0].uri)
      }
    } catch (error) {
      console.error('Error picking image:', error)
      Alert.alert('错误', '选择图片失败')
    }
  }

  async function takePhoto() {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync()

      if (!permissionResult.granted) {
        Alert.alert('权限被拒绝', '需要相机权限才能拍照')
        return
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (!result.canceled && result.assets && result.assets[0]) {
        setAvatarUri(result.assets[0].uri)
      }
    } catch (error) {
      console.error('Error taking photo:', error)
      Alert.alert('错误', '拍照失败')
    }
  }

  async function handleSave() {
    if (!formData.username.trim()) {
      Alert.alert('错误', '用户名不能为空')
      return
    }

    if (formData.username.length < 3 || formData.username.length > 20) {
      Alert.alert('错误', '用户名长度应在3-20个字符之间')
      return
    }

    setIsLoading(true)

    try {
      // Upload avatar if changed
      let avatarUrl = user?.avatar_url
      if (avatarUri && avatarUri !== user?.avatar_url) {
        avatarUrl = await actions.uploadAvatar(avatarUri)
      }

      // Update profile via API
      await actions.updateProfile({
        username: formData.username.trim(),
        bio: formData.bio,
        avatar_url: avatarUrl,
      })

      Alert.alert('成功', '个人资料已更新', [
        {
          text: '确定',
          onPress: () => navigation.goBack(),
        },
      ])
    } catch (error) {
      const message = error instanceof Error ? error.message : '更新失败'
      console.error('Save failed:', error)
      Alert.alert('保存失败', message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={26} color="#fafafa" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>编辑资料</Text>
        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.saveDisabled]}
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#6366f1" />
          ) : (
            <Text style={styles.saveButtonText}>保存</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={48} color="#6366f1" />
                <Text style={styles.avatarHint}>点击更换</Text>
              </View>
            )}

            {/* Camera Icon Overlay */}
            <View style={styles.cameraIcon}>
              <Ionicons name="camera" size={18} color="#ffffff" />
            </View>
          </TouchableOpacity>

          <Text style={styles.avatarNote}>支持 JPG、PNG 格式，最大 5MB</Text>

          <View style={styles.avatarActions}>
            <TouchableOpacity style={styles.avatarActionButton} onPress={pickImage}>
              <Ionicons name="images-outline" size={18} color="#6366f1" />
              <Text style={styles.avatarActionText}>从相册选择</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.avatarActionButton} onPress={takePhoto}>
              <Ionicons name="camera-outline" size={18} color="#6366f1" />
              <Text style={styles.avatarActionText}>拍照</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>基本信息</Text>

          {/* Username Field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>用户名 *</Text>
            <TextInput
              style={styles.input}
              value={formData.username}
              onChangeText={(text) => updateField('username', text)}
              placeholder="输入用户名"
              placeholderTextColor="#52525b"
              autoCapitalize="none"
              autoComplete="username"
              maxLength={20}
            />
            <Text style={styles.hint}>
              {formData.username.length}/20 个字符
            </Text>
          </View>

          {/* Email Field (Read-only display) */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>邮箱地址</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={formData.email}
              editable={false}
              selectTextOnFocus={false}
            />
            <Text style={styles.hint}>邮箱不可更改</Text>
          </View>

          {/* Bio Field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>个人简介</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.bio}
              onChangeText={(text) => updateField('bio', text)}
              placeholder="介绍一下自己..."
              placeholderTextColor="#52525b"
              multiline
              numberOfLines={4}
              maxLength={200}
              textAlignVertical="top"
            />
            <Text style={styles.hint}>
              {formData.bio.length}/200 个字符
            </Text>
          </View>
        </View>

        {/* Account Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>账户信息</Text>

          <InfoRow label="用户ID" value={user?.id || '-'} />
          <InfoRow label="注册时间" value={user?.created_at ? new Date(user.created_at).toLocaleDateString() : '-'} />
          <InfoRow label="账户类型" value={user?.role === 'admin' ? '管理员' : '普通用户'} />
        </View>

        {/* Danger Zone */}
        <View style={styles.dangerZone}>
          <Text style={styles.sectionTitle}>危险操作</Text>

          <TouchableOpacity
            style={styles.dangerButton}
            onPress={() =>
              Alert.alert(
                '确认注销',
                '确定要永久删除您的账户吗？此操作无法撤销！',
                [
                  { text: '取消', style: 'cancel' },
                  {
                    text: '确认注销',
                    style: 'destructive',
                    onPress: () => {
                      actions.logout()
                      navigation.navigate('Login' as never)
                    },
                  },
                ]
              )
            }
          >
            <Ionicons name="warning-outline" size={20} color="#ef4444" />
            <Text style={styles.dangerButtonText}>注销账户</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#18181b',
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fafafa',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366f1',
  },
  saveDisabled: {
    opacity: 0.5,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 28,
    borderBottomWidth: 1,
    borderBottomColor: '#18181b',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#27272a',
  },
  avatarPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#18181b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#27272a',
    borderStyle: 'dashed',
  },
  avatarHint: {
    fontSize: 11,
    color: '#6366f1',
    marginTop: 4,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#09090b',
  },
  avatarNote: {
    fontSize: 13,
    color: '#71717a',
    marginBottom: 16,
  },
  avatarActions: {
    flexDirection: 'row',
    gap: 20,
  },
  avatarActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#18181b',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  avatarActionText: {
    fontSize: 13,
    color: '#6366f1',
    fontWeight: '500',
  },
  formSection: {
    paddingHorizontal: 20,
    paddingTop: 28,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fafafa',
    marginBottom: 16,
  },
  fieldGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#d4d4d8',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#18181b',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#27272a',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#fafafa',
  },
  inputDisabled: {
    opacity: 0.5,
    backgroundColor: '#0c0c0e',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 12,
    color: '#52525b',
    marginTop: 6,
    fontFamily: 'monospace',
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingTop: 28,
    borderTopWidth: 1,
    borderTopColor: '#18181b',
    marginTop: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#18181b',
  },
  infoLabel: {
    fontSize: 15,
    color: '#a1a1aa',
  },
  infoValue: {
    fontSize: 15,
    color: '#d4d4d8',
    fontWeight: '500',
  },
  dangerZone: {
    paddingHorizontal: 20,
    paddingTop: 28,
    marginTop: 20,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#18181b',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#3f1212',
  },
  dangerButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ef4444',
  },
})
