import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { usePlayerStore } from '../../stores/playerStore';

const { width } = Dimensions.get('window');

interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  cover_url: string;
  duration: number;
}

interface Playlist {
  id: string;
  name: string;
  description: string;
  cover_url: string;
  creator_name: string;
  song_count: number;
  total_duration: number;
  is_public: boolean;
  created_at: string;
}

type RootStackParamList = {
  PlaylistDetail: { playlist: Playlist };
  SongDetail: { song: Song };
};

type PlaylistDetailNavigationProp = StackNavigationProp<RootStackParamList, 'PlaylistDetail'>;
type PlaylistDetailRouteProp = RouteProp<RootStackParamList, 'PlaylistDetail'>;

const PlaylistDetailScreen: React.FC = () => {
  const navigation = useNavigation<PlaylistDetailNavigationProp>();
  const route = useRoute<PlaylistDetailRouteProp>();
  const { playlist } = route.params;

  const [songs, setSongs] = useState<Song[]>([]);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);

  const store = usePlayerStore();
  const currentSong = store.currentTrack;
  const { playTrack, addToQueue, setQueue } = store.actions;

  useEffect(() => {
    loadPlaylistSongs();
  }, [playlist.id]);

  const loadPlaylistSongs = async () => {
    try {
      // TODO: 替换为实际API调用
      await new Promise(resolve => setTimeout(resolve, 300));

      // Mock数据
      const mockSongs: Song[] = [
        {
          id: '1',
          title: '夜曲',
          artist: '周杰伦',
          album: '十一月的萧邦',
          cover_url: 'https://picsum.photos/seed/song1/200/200',
          duration: 261,
        },
        {
          id: '2',
          title: '晴天',
          artist: '周杰伦',
          album: '叶惠美',
          cover_url: 'https://picsum.photos/seed/song2/200/200',
          duration: 269,
        },
        {
          id: '3',
          title: '七里香',
          artist: '周杰伦',
          album: '七里香',
          cover_url: 'https://picsum.photos/seed/song3/200/200',
          duration: 299,
        },
        {
          id: '4',
          title: '简单爱',
          artist: '周杰伦',
          album: '范特西',
          cover_url: 'https://picsum.photos/seed/song4/200/200',
          duration: 254,
        },
        {
          id: '5',
          title: '稻香',
          artist: '周杰伦',
          album: '魔杰座',
          cover_url: 'https://picsum.photos/seed/song5/200/200',
          duration: 223,
        },
      ];

      setSongs(mockSongs);
    } catch (error) {
      console.error('加载播放列表失败:', error);
    }
  };

  const handlePlayAll = () => {
    if (songs.length > 0) {
      setQueue(songs as any);
      setIsPlayingAll(true);
    }
  };

  const handleShufflePlay = () => {
    if (songs.length > 0) {
      const shuffled = [...songs].sort(() => Math.random() - 0.5);
      setQueue(shuffled as any);
      setIsPlayingAll(true);
    }
  };

  const handleSongPress = (song: Song) => {
    playTrack(song as any);
    addToQueue(song as any);
    navigation.navigate('SongDetail', { song });
  };

  const handleSongLongPress = (song: Song) => {
    setSelectedSong(song);
    setShowOptionsModal(true);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `发现一个很棒的播放列表「${playlist.name}」，快来听听吧！`,
        url: `https://dmusic.app/playlist/${playlist.id}`,
        title: playlist.name,
      });
    } catch (error) {
      console.error('分享失败:', error);
    }
  };

  const handleDownload = () => {
    Alert.alert(
      '下载播放列表',
      `确定要下载「${playlist.name}」中的所有歌曲吗？`,
      [
        { text: '取消', style: 'cancel' },
        { text: '下载', onPress: () => console.log('开始下载') },
      ]
    );
  };

  const handleAddToPlaylist = (song: Song) => {
    Alert.alert('添加到播放列表', `将"${song.title}"添加到其他播放列表`);
    setShowOptionsModal(false);
  };

  const handleRemoveFromPlaylist = (song: Song) => {
    Alert.alert(
      '移除歌曲',
      `确定要从播放列表中移除"${song.title}"吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '移除',
          style: 'destructive',
          onPress: () => {
            setSongs(songs.filter(s => s.id !== song.id));
            setShowOptionsModal(false);
          },
        },
      ]
    );
  };

  const formatDuration = (seconds: number): string => {
    if (seconds < 3600) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}:${mins.toString().padStart(2, '0')}`;
  };

  const formatTotalDuration = (): string => {
    const totalSeconds = songs.reduce((acc, song) => acc + song.duration, 0);
    return formatDuration(totalSeconds);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      {/* 封面和基本信息 */}
      <View style={styles.headerTop}>
        <Image source={{ uri: playlist.cover_url }} style={styles.cover} />

        <View style={styles.infoContainer}>
          <Text style={styles.name}>{playlist.name}</Text>
          <Text style={styles.description} numberOfLines={2}>
            {playlist.description || '暂无描述'}
          </Text>

          <View style={styles.metaInfo}>
            <View style={styles.metaItem}>
              <Ionicons name="musical-notes" size={14} color="#a1a1aa" />
              <Text style={styles.metaText}>{songs.length} 首歌曲</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color="#a1a1aa" />
              <Text style={styles.metaText}>{formatTotalDuration()}</Text>
            </View>
          </View>

          <View style={styles.creatorInfo}>
            <Ionicons name="person-circle" size={16} color="#71717a" />
            <Text style={styles.creatorName}>创建者: {playlist.creator_name}</Text>
          </View>
        </View>
      </View>

      {/* 操作按钮 */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.playAllButton]}
          onPress={handlePlayAll}
          activeOpacity={0.8}
        >
          <Ionicons name="play" size={20} color="#ffffff" />
          <Text style={styles.actionButtonText}>播放全部</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.shuffleButton]}
          onPress={handleShufflePlay}
          activeOpacity={0.8}
        >
          <Ionicons name="shuffle" size={18} color="#6366f1" />
          <Text style={styles.shuffleButtonText}>随机播放</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleShare}
        >
          <Ionicons name="share-social-outline" size={24} color="#a1a1aa" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleDownload}
        >
          <Ionicons name="download-outline" size={24} color="#a1a1aa" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSongItem = ({ item, index }: { item: Song; index: number }) => (
    <TouchableOpacity
      style={[
        styles.songItem,
        currentSong?.id === item.id && styles.activeSongItem,
      ]}
      onPress={() => handleSongPress(item)}
      onLongPress={() => handleSongLongPress(item)}
      activeOpacity={0.7}
    >
      <Text style={styles.songIndex}>
        {currentSong?.id === item.id ? (
          <Ionicons name="volume-high" size={16} color="#6366f1" />
        ) : (
          (index + 1).toString().padStart(2, '0')
        )}
      </Text>

      <Image source={{ uri: item.cover_url }} style={styles.songCover} />

      <View style={styles.songInfo}>
        <Text
          style={[
            styles.songTitle,
            currentSong?.id === item.id && styles.activeSongTitle,
          ]}
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <Text style={styles.songArtist} numberOfLines={1}>
          {item.artist}
        </Text>
      </View>

      <Text style={styles.songDuration}>{formatDuration(item.duration)}</Text>

      <TouchableOpacity
        style={styles.moreButton}
        onPress={() => handleSongLongPress(item)}
      >
        <Ionicons name="ellipsis-vertical" size={18} color="#71717a" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderOptionsModal = () => (
    <Modal
      visible={showOptionsModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowOptionsModal(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowOptionsModal(false)}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>歌曲选项</Text>

          <TouchableOpacity
            style={styles.modalOption}
            onPress={() => selectedSong && handleAddToPlaylist(selectedSong)}
          >
            <Ionicons name="list-outline" size={22} color="#6366f1" />
            <Text style={styles.modalOptionText}>添加到播放列表</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modalOption}
            onPress={() => { }}
          >
            <Ionicons name="person-add-outline" size={22} color="#6366f1" />
            <Text style={styles.modalOptionText}>查看艺术家</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modalOption}
            onPress={() => { }}
          >
            <Ionicons name="download-outline" size={22} color="#6366f1" />
            <Text style={styles.modalOptionText}>下载</Text>
          </TouchableOpacity>

          <View style={styles.modalDivider} />

          <TouchableOpacity
            style={[styles.modalOption, styles.dangerOption]}
            onPress={() => selectedSong && handleRemoveFromPlaylist(selectedSong)}
          >
            <Ionicons name="trash-outline" size={22} color="#ef4444" />
            <Text style={[styles.modalOptionText, styles.dangerText]}>
              从播放列表移除
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* 头部信息 */}
      {renderHeader()}

      {/* 歌曲列表 */}
      <FlatList
        data={songs}
        renderItem={renderSongItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={<View style={{ height: 100 }} />}
      />

      {/* 操作选项弹窗 */}
      {renderOptionsModal()}
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
    padding: 16,
  },
  cover: {
    width: 140,
    height: 140,
    borderRadius: 12,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    color: '#a1a1aa',
    lineHeight: 18,
    marginBottom: 12,
  },
  metaInfo: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    fontSize: 12,
    color: '#a1a1aa',
    marginLeft: 4,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  creatorName: {
    fontSize: 12,
    color: '#71717a',
    marginLeft: 4,
  },

  // 操作按钮样式
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginRight: 12,
  },
  playAllButton: {
    backgroundColor: '#6366f1',
  },
  shuffleButton: {
    backgroundColor: '#27272a',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
  shuffleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
    marginLeft: 6,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#27272a',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },

  // 歌曲列表样式
  listContent: {
    backgroundColor: '#09090b',
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#18181b',
  },
  activeSongItem: {
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
  },
  songIndex: {
    width: 32,
    fontSize: 14,
    color: '#71717a',
    textAlign: 'center',
    fontWeight: '500',
  },
  songCover: {
    width: 48,
    height: 48,
    borderRadius: 6,
    marginLeft: 8,
  },
  songInfo: {
    flex: 1,
    marginLeft: 12,
  },
  songTitle: {
    fontSize: 15,
    color: '#ffffff',
    fontWeight: '500',
    marginBottom: 2,
  },
  activeSongTitle: {
    color: '#6366f1',
  },
  songArtist: {
    fontSize: 13,
    color: '#a1a1aa',
  },
  songDuration: {
    fontSize: 12,
    color: '#71717a',
    marginRight: 8,
  },
  moreButton: {
    padding: 4,
  },

  // 弹窗样式
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#18181b',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 16,
  },
  modalDivider: {
    height: 8,
    backgroundColor: '#27272a',
    marginVertical: 8,
  },
  dangerOption: {
    marginTop: 8,
  },
  dangerText: {
    color: '#ef4444',
  },
});

export default PlaylistDetailScreen;
