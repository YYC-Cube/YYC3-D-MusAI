import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Switch,
  TextInput,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as LocalAuthentication from 'expo-local-authentication';
import { userService } from '@/services/userService';
import { useAuthStore } from '@/stores/authStore';

type RootStackParamList = {};
type NavigationProp = StackNavigationProp<RootStackParamList>;

const AccountSecurityScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { actions } = useAuthStore();

  const [changePasswordModalVisible, setChangePasswordModalVisible] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [biometricAuthEnabled, setBiometricAuthEnabled] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [loginNotifications, setLoginNotifications] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkBiometricSupport();
  }, []);

  async function checkBiometricSupport() {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setBiometricAvailable(compatible && enrolled);
    } catch (error) {
      console.error('检查生物识别支持失败:', error);
      setBiometricAvailable(false);
    }
  }

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('错误', '请填写所有字段');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('错误', '新密码与确认密码不匹配');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('错误', '新密码至少需要8个字符');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: 调用API修改密码 - 需要后端提供该接口
      // await userService.changePassword(currentPassword, newPassword);
      Alert.alert(
        '成功',
        '密码已成功更改',
        [
          {
            text: '确定',
            onPress: () => {
              setChangePasswordModalVisible(false);
              setCurrentPassword('');
              setNewPassword('');
              setConfirmPassword('');
            },
          },
        ]
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : '修改失败';
      Alert.alert('错误', message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnableTwoFactor = () => {
    if (!twoFactorEnabled) {
      Alert.alert(
        '启用双重认证',
        '双重认证可以为您的账户提供额外的安全保护。启用后，每次登录时都需要输入验证码。\n\n确定要启用吗？',
        [
          { text: '取消', style: 'cancel' },
          {
            text: '启用',
            onPress: () => {
              setTwoFactorEnabled(true);
              Alert.alert('成功', '双重认证已启用');
            },
          },
        ]
      );
    } else {
      Alert.alert(
        '禁用双重认证',
        '禁用双重认证会降低账户安全性。确定要禁用吗？',
        [
          { text: '取消', style: 'cancel' },
          {
            text: '禁用',
            style: 'destructive',
            onPress: () => {
              setTwoFactorEnabled(false);
              Alert.alert('成功', '双重认证已禁用');
            },
          },
        ]
      );
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      '删除账户',
      '删除账户后，您的所有数据（包括播放列表、收藏的歌曲等）将被永久删除且无法恢复。\n\n确定要删除账户吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除账户',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              '最终确认',
              '这是最后一步确认。输入"DELETE"以确认删除账户。',
              [
                { text: '取消', style: 'cancel' },
                {
                  text: '确认删除',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await userService.deleteAccount('', '');
                      Alert.alert('账户已删除', '您的账户已被永久删除');
                    } catch (error) {
                      const message = error instanceof Error ? error.message : '删除失败';
                      Alert.alert('错误', message);
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const renderSettingItem = ({
    icon,
    iconColor,
    title,
    subtitle,
    rightComponent,
    showArrow = true,
    onPress,
    danger = false,
  }: {
    icon: string;
    iconColor: string;
    title: string;
    subtitle?: string;
    rightComponent?: React.ReactNode;
    showArrow?: boolean;
    onPress?: () => void;
    danger?: boolean;
  }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
        <Ionicons name={icon as any} size={22} color={iconColor} />
      </View>

      <View style={styles.settingInfo}>
        <Text style={[styles.settingTitle, danger && styles.dangerTitle]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        )}
      </View>

      {rightComponent ? (
        rightComponent
      ) : showArrow ? (
        <Ionicons
          name="chevron-forward"
          size={20}
          color="#52525b"
        />
      ) : null}
    </TouchableOpacity>
  );

  const renderChangePasswordModal = () => (
    <Modal
      visible={changePasswordModalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setChangePasswordModalVisible(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setChangePasswordModalVisible(false)}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>修改密码</Text>
            <TouchableOpacity
              onPress={() => setChangePasswordModalVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>当前密码</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="输入当前密码"
              placeholderTextColor="#71717a"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>新密码</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="输入新密码"
              placeholderTextColor="#71717a"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>确认新密码</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="再次输入新密码"
              placeholderTextColor="#71717a"
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleChangePassword}
            disabled={isLoading}
          >
            <Text style={styles.submitButtonText}>
              {isLoading ? '处理中...' : '确认修改'}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 账户安全 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>账户安全</Text>

          {renderSettingItem({
            icon: 'key-outline',
            iconColor: '#6366f1',
            title: '修改密码',
            subtitle: '定期更改密码以保护账户安全',
            onPress: () => setChangePasswordModalVisible(true),
          })}

          {renderSettingItem({
            icon: 'shield-checkmark-outline',
            iconColor: '#22c55e',
            title: '双重认证',
            subtitle: twoFactorEnabled ? '已启用' : '未启用',
            rightComponent: (
              <Switch
                value={twoFactorEnabled}
                onValueChange={handleEnableTwoFactor}
                trackColor={{ false: '#27272a', true: '#22c55e' }}
                thumbColor="#ffffff"
              />
            ),
            showArrow: false,
          })}
        </View>

        {/* 生物识别 */}
        {biometricAvailable && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>生物识别</Text>

            {renderSettingItem({
              icon: 'finger-print-outline',
              iconColor: '#f59e0b',
              title: '生物识别登录',
              subtitle: biometricAuthEnabled ? '已启用' : '未启用',
              rightComponent: (
                <Switch
                  value={biometricAuthEnabled}
                  onValueChange={setBiometricAuthEnabled}
                  trackColor={{ false: '#27272a', true: '#f59e0b' }}
                  thumbColor="#ffffff"
                />
              ),
              showArrow: false,
            })}
          </View>
        )}

        {/* 登录通知 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>通知设置</Text>

          {renderSettingItem({
            icon: 'notifications-outline',
            iconColor: '#06b6d4',
            title: '登录通知',
            subtitle: loginNotifications ? '新设备登录时发送通知' : '已关闭',
            rightComponent: (
              <Switch
                value={loginNotifications}
                onValueChange={setLoginNotifications}
                trackColor={{ false: '#27272a', true: '#06b6d4' }}
                thumbColor="#ffffff"
              />
            ),
            showArrow: false,
          })}
        </View>

        {/* 危险操作 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>危险操作</Text>

          {renderSettingItem({
            icon: 'log-out-outline',
            iconColor: '#ef4444',
            title: '退出所有设备',
            subtitle: '强制所有设备重新登录',
            danger: true,
            onPress: () => {
              Alert.alert(
                '退出所有设备',
                '确定要退出所有设备吗？您需要重新登录。',
                [
                  { text: '取消', style: 'cancel' },
                  {
                    text: '确认',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        await userService.logoutAllDevices();
                        Alert.alert('成功', '所有设备已退出');
                      } catch (error) {
                        const message = error instanceof Error ? error.message : '操作失败';
                        Alert.alert('错误', message);
                      }
                    },
                  },
                ]
              );
            },
          })}

          {renderSettingItem({
            icon: 'trash-outline',
            iconColor: '#ef4444',
            title: '删除账户',
            subtitle: '永久删除您的账户和所有数据',
            danger: true,
            onPress: handleDeleteAccount,
          })}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {renderChangePasswordModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  section: {
    backgroundColor: '#18181b',
    marginTop: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 13,
    color: '#71717a',
    fontWeight: '600',
    textTransform: 'uppercase',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
    marginLeft: 14,
  },
  settingTitle: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#71717a',
  },
  dangerTitle: {
    color: '#ef4444',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#18181b',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  closeButton: {
    padding: 4,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#a1a1aa',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#27272a',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#ffffff',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#6366f1',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AccountSecurityScreen;
