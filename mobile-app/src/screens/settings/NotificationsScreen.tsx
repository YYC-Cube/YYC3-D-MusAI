import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface Notification {
  id: string;
  type: 'system' | 'social' | 'music' | 'promotion' | 'update';
  title: string;
  message: string;
  image_url?: string;
  timestamp: string;
  is_read: boolean;
  action_url?: string;
  action_text?: string;
}

type RootStackParamList = {};
type NavigationProp = StackNavigationProp<RootStackParamList>;

const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      // TODO: 替换为实际API调用
      await new Promise(resolve => setTimeout(resolve, 300));

      // Mock数据
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'social',
          title: '新的粉丝',
          message: '用户 MusicLover99 开始关注你了',
          image_url: 'https://picsum.photos/seed/user1/100/100',
          timestamp: '2分钟前',
          is_read: false,
          action_url: '/user/MusicLover99',
          action_text: '查看主页',
        },
        {
          id: '2',
          type: 'music',
          title: '新歌发布',
          message: '你关注的艺术家「周杰伦」发布了新单曲《夜曲2024》',
          image_url: 'https://picsum.photos/seed/album1/200/200',
          timestamp: '15分钟前',
          is_read: false,
          action_url: '/song/new-song-id',
          action_text: '立即收听',
        },
        {
          id: '3',
          type: 'system',
          title: '系统更新',
          message: 'D-Music 已更新至 v2.5.0，新增歌词同步功能',
          timestamp: '1小时前',
          is_read: true,
          action_url: '/settings/updates',
          action_text: '查看详情',
        },
        {
          id: '4',
          type: 'social',
          title: '评论回复',
          message: '用户 MelodyMaster 回复了你的评论："完全同意！这首歌太棒了"',
          timestamp: '3小时前',
          is_read: true,
          action_url: '/song/comment-song-id',
          action_text: '查看评论',
        },
        {
          id: '5',
          type: 'promotion',
          title: '限时优惠',
          message: 'VIP会员年享7折优惠，仅剩最后3天！',
          image_url: 'https://picsum.photos/seed/promo1/200/200',
          timestamp: '5小时前',
          is_read: false,
          action_url: '/vip/promotion',
          action_text: '立即开通',
        },
        {
          id: '6',
          type: 'music',
          title: '播放列表被收藏',
          message: '你的播放列表「我的最爱」已被 128 人收藏',
          timestamp: '昨天',
          is_read: true,
          action_url: '/playlist/my-favorites',
          action_text: '查看列表',
        },
        {
          id: '7',
          type: 'update',
          title: '应用更新提醒',
          message: '发现新版本 v2.6.0，修复已知问题并优化性能',
          timestamp: '2天前',
          is_read: true,
          action_url: '/app/update',
          action_text: '立即更新',
        },
        {
          id: '8',
          type: 'social',
          title: '好友邀请',
          message: '你的朋友 SongBird 邀请你一起听歌',
          image_url: 'https://picsum.photos/seed/user2/100/100',
          timestamp: '3天前',
          is_read: true,
          action_url: '/invite/SongBird',
          action_text: '接受邀请',
        },
      ];

      setNotifications(mockNotifications);
    } catch (error) {
      console.error('加载通知失败:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadNotifications();
    setIsRefreshing(false);
  };

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(notifications.map(n =>
      n.id === notificationId ? { ...n, is_read: true } : n
    ));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
  };

  const handleDelete = (notificationId: string) => {
    setNotifications(notifications.filter(n => n.id !== notificationId));
  };

  const handleActionPress = (notification: Notification) => {
    if (!notification.is_read) {
      handleMarkAsRead(notification.id);
    }

    // TODO: 根据action_url导航到相应页面
    console.log('导航到:', notification.action_url);
  };

  const getFilteredNotifications = (): Notification[] => {
    if (activeFilter === 'unread') {
      return notifications.filter(n => !n.is_read);
    }
    return notifications;
  };

  const getUnreadCount = (): number => {
    return notifications.filter(n => !n.is_read).length;
  };

  const getNotificationIcon = (type: string): { icon: string; color: string } => {
    switch (type) {
      case 'system':
        return { icon: 'settings-outline', color: '#6366f1' };
      case 'social':
        return { icon: 'people-outline', color: '#22c55e' };
      case 'music':
        return { icon: 'musical-notes', color: '#ef4444' };
      case 'promotion':
        return { icon: 'gift-outline', color: '#f59e0b' };
      case 'update':
        return { icon: 'cloud-upload-outline', color: '#06b6d4' };
      default:
        return { icon: 'notifications-outline', color: '#a1a1aa' };
    }
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => {
    const { icon, color } = getNotificationIcon(item.type);

    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          !item.is_read && styles.unreadItem,
        ]}
        onPress={() => handleActionPress(item)}
        activeOpacity={0.7}
        onLongPress={() => handleDelete(item.id)}
      >
        {/* 未读指示器 */}
        {!item.is_read && <View style={styles.unreadIndicator} />}

        {/* 图标或图片 */}
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.notificationImage} />
        ) : (
          <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
            <Ionicons name={icon as any} size={24} color={color} />
          </View>
        )}

        {/* 内容 */}
        <View style={styles.content}>
          <Text
            style={[
              styles.title,
              !item.is_read && styles.unreadTitle,
            ]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text
            style={[
              styles.message,
              !item.is_read && styles.unreadMessage,
            ]}
            numberOfLines={2}
          >
            {item.message}
          </Text>

          <View style={styles.footer}>
            <Text style={styles.timestamp}>{item.timestamp}</Text>
            {item.action_text && (
              <TouchableOpacity onPress={() => handleActionPress(item)}>
                <Text style={styles.actionText}>{item.action_text}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 删除按钮 */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id)}
        >
          <Ionicons name="close" size={18} color="#71717a" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      {/* 标题和操作 */}
      <View style={styles.headerTop}>
        <Text style={styles.headerTitle}>通知</Text>
        {getUnreadCount() > 0 && (
          <TouchableOpacity onPress={handleMarkAllAsRead}>
            <Text style={styles.markAllRead}>全部已读</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 筛选标签 */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, activeFilter === 'all' && styles.activeFilter]}
          onPress={() => setActiveFilter('all')}
        >
          <Text style={[styles.filterText, activeFilter === 'all' && styles.activeFilterText]}>
            全部 ({notifications.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, activeFilter === 'unread' && styles.activeFilter]}
          onPress={() => setActiveFilter('unread')}
        >
          <Text style={[styles.filterText, activeFilter === 'unread' && styles.activeFilterText]}>
            未读 ({getUnreadCount()})
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* 头部 */}
      {renderHeader()}

      {/* 通知列表 */}
      <FlatList
        data={getFilteredNotifications()}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#6366f1"
            colors={['#6366f1']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="notifications-off-outline"
              size={64}
              color="#3f3f46"
            />
            <Text style={styles.emptyTitle}>暂无通知</Text>
            <Text style={styles.emptySubtitle}>
              {activeFilter === 'unread'
                ? '所有通知都已阅读'
                : '当有新消息时会在这里显示'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },

  // 头部样式
  header: {
    backgroundColor: '#18181b',
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  markAllRead: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '500',
  },

  // 筛选样式
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 18,
    marginRight: 12,
    backgroundColor: '#27272a',
  },
  activeFilter: {
    backgroundColor: '#6366f1',
  },
  filterText: {
    fontSize: 14,
    color: '#a1a1aa',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#ffffff',
  },

  // 列表样式
  listContent: {
    padding: 16,
  },

  // 通知项样式
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#18181b',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  unreadItem: {
    borderLeftWidth: 3,
    borderLeftColor: '#6366f1',
  },
  unreadIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#6366f1',
    marginTop: 8,
    marginRight: 8,
  },
  notificationImage: {
    width: 56,
    height: 56,
    borderRadius: 10,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#a1a1aa',
    marginBottom: 4,
  },
  unreadTitle: {
    color: '#ffffff',
  },
  message: {
    fontSize: 14,
    color: '#71717a',
    lineHeight: 20,
    marginBottom: 8,
  },
  unreadMessage: {
    color: '#a1a1aa',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timestamp: {
    fontSize: 12,
    color: '#52525b',
  },
  actionText: {
    fontSize: 13,
    color: '#6366f1',
    fontWeight: '500',
  },
  deleteButton: {
    padding: 4,
    marginLeft: 8,
    marginTop: 4,
  },

  // 空状态样式
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#71717a',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default NotificationsScreen;