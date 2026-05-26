import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { usePlayerStore } from '../../stores/playerStore';

const { width } = Dimensions.get('window');

interface Song {
  id: string;
  title: string;
  artist: string;
  duration: number;
  plays_count: number;
  is_liked?: boolean;
}

interface Album {
  id: string;
  title: string;
  artist: string;
  artist_id: string;
  cover_url: string;
  year: number;
  genre: string;
  description: string;
  song_count: number;
  total_duration: number;
}

type RootStackParamList = {
  AlbumDetail: { album: Album };
  SongDetail: { song: Song };
  ArtistDetail: { artist: any };
};

type AlbumDetailNavigationProp = StackNavigationProp<RootStackParamList, 'AlbumDetail'>;
type AlbumDetailRouteProp = RouteProp<RootStackParamList, 'AlbumDetail'>;

const AlbumDetailScreen: React.FC = () => {
  const navigation = useNavigation<AlbumDetailNavigationProp>();
  const route = useRoute<AlbumDetailRouteProp>();
  const { album } = route.params;

  const [songs, setSongs] = useState<Song[]>([]);
  const [isLiked, setIsLiked] = useState(false);

  const store = usePlayerStore();
  const currentSong = store.currentTrack;
  const { playTrack, addToQueue, setQueue } = store.actions;

  useEffect(() => {
    loadAlbumSongs();
  }, [album.id]);

  const loadAlbumSongs = async () => {
    try {
      // TODO: 替换为实际API调用
      await new Promise(resolve => setTimeout(resolve, 300));

      // Mock数据
      const mockSongs: Song[] = [
        {
          id: '1',
          title: '序曲',
          artist: album.artist,
          duration: 89,
          plays_count: 5000000,
        },
        {
          id: '2',
          title: '第一乐章',
          artist: album.artist,
          duration: 245,
          plays_count: 8200000,
        },
        {
          id: '3',
          title: '第二乐章',
          artist: album.artist,
          duration: 312,
          plays_count: 7800000,
        },
        {
          id: '4',
          title: '间奏曲',
          artist: album.artist,
          duration: 156,
          plays_count: 6500000,
        },
        {
          id: '5',
          title: '第三乐章',
          artist: album.artist,
          duration: 278,
          plays_count: 9100000,
        },
        {
          id: '6',
          title: '终曲',
          artist: album.artist,
          duration: 342,
          plays_count: 7500000,
        },
      ];

      setSongs(mockSongs);
    } catch (error) {
      console.error('加载专辑歌曲失败:', error);
    }
  };

  const handlePlayAll = () => {
    if (songs.length > 0) {
      setQueue(songs as any);
    }
  };

  const handleShufflePlay = () => {
    if (songs.length > 0) {
      const shuffled = [...songs].sort(() => Math.random() - 0.5);
      setQueue(shuffled as any);
    }
  };

  const handleSongPress = (song: Song) => {
    playTrack(song as any);
    addToQueue(song as any);
    navigation.navigate('SongDetail', { song });
  };

  const handleLikeToggle = () => {
    setIsLiked(!isLiked);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `发现一张很棒的专辑「${album.title}」，快来听听吧！`,
        url: `https://dmusic.app/album/${album.id}`,
        title: `${album.title} - ${album.artist}`,
      });
    } catch (error) {
      console.error('分享失败:', error);
    }
  };

  const handleDownload = () => {
    // TODO: 实现下载功能
    console.log('下载专辑');
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

  const getTotalDuration = (): string => {
    const totalSeconds = songs.reduce((acc, song) => acc + song.duration, 0);
    return formatDuration(totalSeconds);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      {/* 专辑封面和信息 */}
      <View style={styles.albumInfoContainer}>
        <Image source={{ uri: album.cover_url }} style={styles.cover} />

        <View style={styles.infoContainer}>
          <Text style={styles.title}>{album.title}</Text>

          <TouchableOpacity
            style={styles.artistLink}
            onPress={() =>
              navigation.navigate('ArtistDetail', {
                artist: { id: album.artist_id, name: album.artist },
              })
            }
          >
            <Text style={styles.artistName}>{album.artist}</Text>
            <Ionicons name="chevron-forward" size={14} color="#6366f1" />
          </TouchableOpacity>

          <View style={styles.metaInfo}>
            <Text style={styles.metaText}>{album.year}</Text>
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.metaText}>{album.genre}</Text>
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.metaText}>{songs.length} 首歌曲</Text>
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.metaText}>{getTotalDuration()}</Text>
          </View>

          <Text style={styles.description} numberOfLines={3}>
            {album.description || '暂无描述'}
          </Text>
        </View>
      </View>

      {/* 操作按钮 */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.playButton]}
          onPress={handlePlayAll}
          activeOpacity={0.8}
        >
          <Ionicons name="play" size={20} color="#ffffff" />
          <Text style={styles.buttonText}>播放全部</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.shuffleButton]}
          onPress={handleShufflePlay}
          activeOpacity={0.8}
        >
          <Ionicons name="shuffle" size={18} color="#6366f1" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.iconButton, isLiked && styles.likedButton]}
          onPress={handleLikeToggle}
        >
          <Ionicons
            name={isLiked ? 'heart' : 'heart-outline'}
            size={24}
            color={isLiked ? '#ef4444' : '#a1a1aa'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleShare}
        >
          <Ionicons name="share-social-outline" size={22} color="#a1a1aa" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleDownload}
        >
          <Ionicons name="download-outline" size={22} color="#a1a1aa" />
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
      activeOpacity={0.7}
    >
      <Text style={styles.songIndex}>
        {currentSong?.id === item.id ? (
          <Ionicons name="volume-high" size={16} color="#6366f1" />
        ) : (
          (index + 1).toString().padStart(2, '0')
        )}
      </Text>

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
        <Text style={styles.songPlays}>
          {formatPlayCount(item.plays_count)} 次播放
        </Text>
      </View>

      <Text style={styles.songDuration}>{formatDuration(item.duration)}</Text>

      <TouchableOpacity style={styles.moreButton}>
        <Ionicons name="ellipsis-vertical" size={18} color="#71717a" />
      </TouchableOpacity>
    </TouchableOpacity>
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
    </SafeAreaView>
  );
};

const formatPlayCount = (count: number): string => {
  if (count >= 100000000) {
    return `${(count / 100000000).toFixed(1)}亿`;
  }
  if (count >= 10000) {
    return `${(count / 10000).toFixed(1)}万`;
  }
  return count.toString();
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
  albumInfoContainer: {
    flexDirection: 'row',
    padding: 20,
  },
  cover: {
    width: 160,
    height: 160,
    borderRadius: 12,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 20,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  artistLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  artistName: {
    fontSize: 15,
    color: '#6366f1',
    fontWeight: '500',
    marginRight: 4,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  metaText: {
    fontSize: 13,
    color: '#a1a1aa',
  },
  metaDot: {
    fontSize: 13,
    color: '#71717a',
    marginHorizontal: 6,
  },
  description: {
    fontSize: 13,
    color: '#a1a1aa',
    lineHeight: 19,
  },

  // 操作按钮样式
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  playButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 25,
  },
  shuffleButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#27272a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
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
  likedButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },

  // 歌曲列表样式
  listContent: {
    paddingTop: 8,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
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
  songInfo: {
    flex: 1,
    marginLeft: 12,
  },
  songTitle: {
    fontSize: 15,
    color: '#ffffff',
    fontWeight: '500',
    marginBottom: 3,
  },
  activeSongTitle: {
    color: '#6366f1',
  },
  songPlays: {
    fontSize: 13,
    color: '#71717a',
  },
  songDuration: {
    fontSize: 13,
    color: '#71717a',
    marginRight: 8,
  },
  moreButton: {
    padding: 4,
  },
});

export default AlbumDetailScreen;
