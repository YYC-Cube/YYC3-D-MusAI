import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  Alert,
  Switch,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { userService, DownloadItem } from '@/services/userService';

type RootStackParamList = {};
type NavigationProp = StackNavigationProp<RootStackParamList>;

const DownloadsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [wifiOnly, setWifiOnly] = useState(true);
  const [autoDownload, setAutoDownload] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'downloading' | 'completed'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDownloads();
  }, []);

  const loadDownloads = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await userService.getDownloads();
      setDownloads(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : '加载失败';
      setError(message);
      console.error('加载下载列表失败:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getFilteredDownloads = (): DownloadItem[] => {
    switch (activeTab) {
      case 'downloading':
        return downloads.filter(d => d.status === 'downloading' || d.status === 'waiting');
      case 'completed':
        return downloads.filter(d => d.status === 'completed');
      default:
        return downloads;
    }
  };

  const handlePauseResume = async (item: DownloadItem) => {
    try {
      if (item.status === 'downloading') {
        await userService.pauseDownload(item.id);
        setDownloads(downloads.map(d =>
          d.id === item.id ? { ...d, status: 'paused' as const } : d
        ));
      } else if (item.status === 'paused' || item.status === 'waiting') {
        await userService.resumeDownload(item.id);
        setDownloads(downloads.map(d =>
          d.id === item.id ? { ...d, status: 'downloading' as const } : d
        ));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '操作失败';
      Alert.alert('错误', message);
    }
  };

  const handleCancel = (item: DownloadItem) => {
    Alert.alert(
      '取消下载',
      `确定要取消"${item.title}"的下载吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          style: 'destructive',
          onPress: async () => {
            try {
              await userService.cancelDownload(item.id);
              setDownloads(downloads.filter(d => d.id !== item.id));
            } catch (err) {
              const message = err instanceof Error ? err.message : '取消失败';
              Alert.alert('错误', message);
            }
          },
        },
      ]
    );
  };

  const handleDelete = (item: DownloadItem) => {
    Alert.alert(
      '删除文件',
      `确定要删除"${item.title}"吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              await userService.deleteDownloadedFile(item.id);
              setDownloads(downloads.filter(d => d.id !== item.id));
            } catch (err) {
              const message = err instanceof Error ? err.message : '删除失败';
              Alert.alert('错误', message);
            }
          },
        },
      ]
    );
  };

  const handleRetry = async (item: DownloadItem) => {
    try {
      await userService.resumeDownload(item.id);
      setDownloads(downloads.map(d =>
        d.id === item.id ? { ...d, status: 'downloading' as const, download_progress: 0 } : d
      ));
    } catch (err) {
      const message = err instanceof Error ? err.message : '重试失败';
      Alert.alert('错误', message);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes >= 1073741824) {
      return `${(bytes / 1073741824).toFixed(2)} GB`;
    }
    if (bytes >= 1048576) {
      return `${(bytes / 1048576).toFixed(1)} MB`;
    }
    if (bytes >= 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${bytes} B`;
  };

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'downloading': return 'download-outline';
      case 'completed': return 'checkmark-circle';
      case 'paused': return 'pause-circle';
      case 'error': return 'alert-circle';
      case 'waiting': return 'time-outline';
      default: return 'document';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'downloading': return '#6366f1';
      case 'completed': return '#22c55e';
      case 'paused': return '#f59e0b';
      case 'error': return '#ef4444';
      case 'waiting': return '#71717a';
      default: return '#a1a1aa';
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'downloading': return '下载中...';
      case 'completed': return '已完成';
      case 'paused': return '已暂停';
      case 'error': return '下载失败';
      case 'waiting': return '等待中';
      default: return '未知状态';
    }
  };

  const renderProgressBar = (progress: number, status: string) => {
    if (status === 'completed') return null;

    return (
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${progress}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>{progress}%</Text>
      </View>
    );
  };

  const renderDownloadItem = ({ item }: { item: DownloadItem }) => (
    <View style={styles.downloadItem}>
      <Image source={{ uri: item.cover_url }} style={styles.cover} />

      <View style={styles.downloadInfo}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.artist} numberOfLines={1}>{item.artist}</Text>

        {/* 状态和进度 */}
        <View style={styles.statusRow}>
          <Ionicons
            name={getStatusIcon(item.status)}
            size={14}
            color={getStatusColor(item.status)}
          />
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusText(item.status)}
          </Text>
          <Text style={styles.fileSize}>· {formatFileSize(item.file_size)}</Text>
        </View>

        {/* 进度条 */}
        {renderProgressBar(item.download_progress, item.status)}
      </View>

      {/* 操作按钮 */}
      <View style={styles.actionButtons}>
        {(item.status === 'downloading' || item.status === 'paused' || item.status === 'waiting') && (
          <>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => handlePauseResume(item)}
            >
              <Ionicons
                name={item.status === 'downloading' ? 'pause' : 'play'}
                size={22}
                color="#6366f1"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => handleCancel(item)}
            >
              <Ionicons name="close-circle" size={22} color="#ef4444" />
            </TouchableOpacity>
          </>
        )}

        {item.status === 'completed' && (
          <>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="play-circle" size={24} color="#22c55e" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => handleDelete(item)}
            >
              <Ionicons name="trash-outline" size={22} color="#ef4444" />
            </TouchableOpacity>
          </>
        )}

        {item.status === 'error' && (
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => handleRetry(item)}
          >
            <Ionicons name="refresh" size={18} color="#ffffff" />
            <Text style={styles.retryButtonText}>重试</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const getTotalStats = () => {
    const completed = downloads.filter(d => d.status === 'completed').length;
    const downloading = downloads.filter(
      d => d.status === 'downloading' || d.status === 'waiting'
    ).length;
    const totalSize = downloads
      .filter(d => d.status === 'completed')
      .reduce((acc, d) => acc + d.file_size, 0);

    return { completed, downloading, totalSize };
  };

  const stats = getTotalStats();

  return (
    <SafeAreaView style={styles.container}>
      {/* 统计信息 */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.completed}</Text>
          <Text style={styles.statLabel}>已完成</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.downloading}</Text>
          <Text style={styles.statLabel}>下载中</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatFileSize(stats.totalSize)}</Text>
          <Text style={styles.statLabel}>已用空间</Text>
        </View>
      </View>

      {/* 设置选项 */}
      <View style={styles.settingsSection}>
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="wifi" size={20} color="#6366f1" />
            <Text style={styles.settingTitle}>仅Wi-Fi下载</Text>
          </View>
          <Switch
            value={wifiOnly}
            onValueChange={setWifiOnly}
            trackColor={{ false: '#27272a', true: '#6366f1' }}
            thumbColor="#ffffff"
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="cloud-download-outline" size={20} color="#6366f1" />
            <Text style={styles.settingTitle}>自动下载</Text>
          </View>
          <Switch
            value={autoDownload}
            onValueChange={setAutoDownload}
            trackColor={{ false: '#27272a', true: '#6366f1' }}
            thumbColor="#ffffff"
          />
        </View>
      </View>

      {/* 标签切换 */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            全部 ({downloads.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'downloading' && styles.activeTab]}
          onPress={() => setActiveTab('downloading')}
        >
          <Text style={[styles.tabText, activeTab === 'downloading' && styles.activeTabText]}>
            下载中 ({stats.downloading})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>
            已完成 ({stats.completed})
          </Text>
        </TouchableOpacity>
      </View>

      {/* 下载列表 */}
      <FlatList
        data={getFilteredDownloads()}
        renderItem={renderDownloadItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadDownloads}
            tintColor="#6366f1"
            colors={['#6366f1']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cloud-offline-outline" size={64} color="#3f3f46" />
            <Text style={styles.emptyTitle}>暂无下载</Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'all'
                ? '开始下载你喜欢的歌曲吧'
                : `暂无${activeTab === 'downloading' ? '正在下载' : '已完成'}的内容`}
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

  // 统计信息样式
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#18181b',
    margin: 16,
    borderRadius: 12,
    paddingVertical: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#a1a1aa',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#27272a',
  },

  // 设置选项样式
  settingsSection: {
    backgroundColor: '#18181b',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: 15,
    color: '#ffffff',
    marginLeft: 12,
  },

  // 标签切换样式
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
    backgroundColor: '#09090b',
    marginHorizontal: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#6366f1',
  },
  tabText: {
    fontSize: 14,
    color: '#a1a1aa',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#6366f1',
    fontWeight: '600',
  },

  // 列表样式
  listContent: {
    padding: 16,
    paddingTop: 12,
  },

  // 下载项样式
  downloadItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181b',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  cover: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  downloadInfo: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 4,
  },
  artist: {
    fontSize: 13,
    color: '#a1a1aa',
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  statusText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  fileSize: {
    fontSize: 12,
    color: '#71717a',
    marginLeft: 6,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#27272a',
    borderRadius: 2,
    marginRight: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 11,
    color: '#6366f1',
    fontWeight: '600',
    minWidth: 36,
    textAlign: 'right',
  },

  // 操作按钮样式
  actionButtons: {
    marginLeft: 8,
  },
  iconButton: {
    padding: 6,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  retryButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 4,
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
  },
});

export default DownloadsScreen;
