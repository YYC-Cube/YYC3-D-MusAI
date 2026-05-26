import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
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
  album: string;
  cover_url: string;
  duration: number;
  plays_count: number;
}

interface Album {
  id: string;
  title: string;
  cover_url: string;
  year: number;
  song_count: number;
}

interface Artist {
  id: string;
  name: string;
  avatar_url: string;
  bio: string;
  followers_count: number;
  following: boolean;
  genres: string[];
}

type RootStackParamList = {
  ArtistDetail: { artist: Artist };
  SongDetail: { song: Song };
  AlbumDetail: { album: Album };
};

type ArtistDetailNavigationProp = StackNavigationProp<RootStackParamList, 'ArtistDetail'>;
type ArtistDetailRouteProp = RouteProp<RootStackParamList, 'ArtistDetail'>;

const ArtistDetailScreen: React.FC = () => {
  const navigation = useNavigation<ArtistDetailNavigationProp>();
  const route = useRoute<ArtistDetailRouteProp>();
  const { artist: initialArtist } = route.params;

  const [artist, setArtist] = useState<Artist>(initialArtist);
  const [activeTab, setActiveTab] = useState<'songs' | 'albums' | 'about'>('songs');
  const [topSongs, setTopSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);

  const { addToQueue, playTrack } = usePlayerStore().actions;

  useEffect(() => {
    loadArtistData();
  }, [artist.id]);

  const loadArtistData = async () => {
    try {
      // TODO: 替换为实际API调用
      await new Promise(resolve => setTimeout(resolve, 300));

      // Mock数据 - 热门歌曲
      const mockSongs: Song[] = [
        {
          id: '1',
          title: '夜曲',
          album: '十一月的萧邦',
          cover_url: 'https://picsum.photos/seed/song1/200/200',
          duration: 261,
          plays_count: 10000000,
        },
        {
          id: '2',
          title: '晴天',
          album: '叶惠美',
          cover_url: 'https://picsum.photos/seed/song2/200/200',
          duration: 269,
          plays_count: 9500000,
        },
        {
          id: '3',
          title: '七里香',
          album: '七里香',
          cover_url: 'https://picsum.photos/seed/song3/200/200',
          duration: 299,
          plays_count: 8800000,
        },
        {
          id: '4',
          title: '简单爱',
          album: '范特西',
          cover_url: 'https://picsum.photos/seed/song4/200/200',
          duration: 254,
          plays_count: 8200000,
        },
        {
          id: '5',
          title: '稻香',
          album: '魔杰座',
          cover_url: 'https://picsum.photos/seed/song5/200/200',
          duration: 223,
          plays_count: 7900000,
        },
      ];

      // Mock数据 - 专辑
      const mockAlbums: Album[] = [
        {
          id: '1',
          title: '十一月的萧邦',
          cover_url: 'https://picsum.photos/seed/album1/300/300',
          year: 2005,
          song_count: 12,
        },
        {
          id: '2',
          title: '叶惠美',
          cover_url: 'https://picsum.photos/seed/album2/300/300',
          year: 2003,
          song_count: 11,
        },
        {
          id: '3',
          title: '七里香',
          cover_url: 'https://picsum.photos/seed/album3/300/300',
          year: 2004,
          song_count: 10,
        },
        {
          id: '4',
          title: '范特西',
          cover_url: 'https://picsum.photos/seed/album4/300/300',
          year: 2001,
          song_count: 10,
        },
      ];

      setTopSongs(mockSongs);
      setAlbums(mockAlbums);
    } catch (error) {
      console.error('加载艺术家数据失败:', error);
    }
  };

  const handleFollowToggle = () => {
    setArtist({
      ...artist,
      following: !artist.following,
      followers_count: artist.following
        ? artist.followers_count - 1
        : artist.followers_count + 1,
    });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `发现一位很棒的音乐人「${artist.name}」，快来听听TA的作品吧！`,
        url: `https://dmusic.app/artist/${artist.id}`,
        title: artist.name,
      });
    } catch (error) {
      console.error('分享失败:', error);
    }
  };

  const handleSongPress = (song: Song) => {
    playTrack(song as any);
    addToQueue(song as any);
    navigation.navigate('SongDetail', { song });
  };

  const handleAlbumPress = (album: Album) => {
    navigation.navigate('AlbumDetail', { album });
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

  const renderHeader = () => (
    <View style={styles.header}>
      {/* 艺术家信息卡片 */}
      <View style={styles.artistCard}>
        <Image source={{ uri: artist.avatar_url }} style={styles.avatar} />

        <View style={styles.artistInfo}>
          <Text style={styles.artistName}>{artist.name}</Text>
          <Text style={styles.followerCount}>
            {formatPlayCount(artist.followers_count)} 粉丝
          </Text>

          {/* 标签 */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.genresContainer}
            contentContainerStyle={styles.genresContent}
          >
            {artist.genres.map((genre, index) => (
              <View key={index} style={styles.genreTag}>
                <Text style={styles.genreText}>{genre}</Text>
              </View>
            ))}
          </ScrollView>

          {/* 操作按钮 */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[
                styles.followButton,
                artist.following && styles.followingButton,
              ]}
              onPress={handleFollowToggle}
              activeOpacity={0.8}
            >
              <Ionicons
                name={artist.following ? 'checkmark' : 'add'}
                size={18}
                color="#ffffff"
              />
              <Text style={styles.followButtonText}>
                {artist.following ? '已关注' : '关注'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleShare}
            >
              <Ionicons name="share-social-outline" size={22} color="#a1a1aa" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  const renderSongItem = ({ item, index }: { item: Song; index: number }) => (
    <TouchableOpacity
      style={styles.songItem}
      onPress={() => handleSongPress(item)}
      activeOpacity={0.7}
    >
      <Text style={styles.songIndex}>
        {(index + 1).toString().padStart(2, '0')}
      </Text>

      <View style={styles.songInfo}>
        <Text style={styles.songTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.songMeta} numberOfLines={1}>
          {item.album} · {formatPlayCount(item.plays_count)}次播放
        </Text>
      </View>

      <Text style={styles.songDuration}>{formatDuration(item.duration)}</Text>

      <TouchableOpacity style={styles.moreButton}>
        <Ionicons name="ellipsis-vertical" size={18} color="#71717a" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderAlbumItem = ({ item }: { item: Album }) => (
    <TouchableOpacity
      style={styles.albumItem}
      onPress={() => handleAlbumPress(item)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.cover_url }} style={styles.albumCover} />
      <View style={styles.albumInfo}>
        <Text style={styles.albumTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.albumMeta}>
          {item.year} · {item.song_count} 首歌曲
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderAboutSection = () => (
    <View style={styles.aboutSection}>
      <Text style={styles.aboutTitle}>简介</Text>
      <Text style={styles.aboutContent}>{artist.bio || '暂无简介'}</Text>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatPlayCount(artist.followers_count)}</Text>
          <Text style={styles.statLabel}>粉丝</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{topSongs.length}</Text>
          <Text style={styles.statLabel}>热门歌曲</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{albums.length}</Text>
          <Text style={styles.statLabel}>专辑</Text>
        </View>
      </View>
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'songs':
        return (
          <FlatList
            data={topSongs}
            renderItem={renderSongItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <View style={styles.sectionTitle}>
                <Text style={styles.sectionTitleText}>热门歌曲</Text>
                <TouchableOpacity>
                  <Text style={styles.viewAllText}>查看全部</Text>
                </TouchableOpacity>
              </View>
            }
          />
        );
      case 'albums':
        return (
          <FlatList
            data={albums}
            renderItem={renderAlbumItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.albumRow}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <View style={styles.sectionTitle}>
                <Text style={styles.sectionTitleText}>专辑</Text>
              </View>
            }
          />
        );
      case 'about':
        return renderAboutSection();
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 头部艺术家信息 */}
      {renderHeader()}

      {/* 标签切换 */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'songs' && styles.activeTab]}
          onPress={() => setActiveTab('songs')}
        >
          <Text style={[styles.tabText, activeTab === 'songs' && styles.activeTabText]}>
            热门歌曲
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'albums' && styles.activeTab]}
          onPress={() => setActiveTab('albums')}
        >
          <Text style={[styles.tabText, activeTab === 'albums' && styles.activeTabText]}>
            专辑
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'about' && styles.activeTab]}
          onPress={() => setActiveTab('about')}
        >
          <Text style={[styles.tabText, activeTab === 'about' && styles.activeTabText]}>
            简介
          </Text>
        </TouchableOpacity>
      </View>

      {/* 内容区域 */}
      <View style={styles.contentContainer}>
        {renderContent()}
      </View>
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
  artistCard: {
    flexDirection: 'row',
    padding: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  artistInfo: {
    flex: 1,
    marginLeft: 20,
    justifyContent: 'space-between',
  },
  artistName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 6,
  },
  followerCount: {
    fontSize: 14,
    color: '#a1a1aa',
    marginBottom: 12,
  },
  genresContainer: {
    marginBottom: 12,
  },
  genresContent: {
    paddingRight: 20,
  },
  genreTag: {
    backgroundColor: '#27272a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginRight: 8,
  },
  genreText: {
    fontSize: 12,
    color: '#a1a1aa',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 22,
    marginRight: 12,
  },
  followingButton: {
    backgroundColor: '#27272a',
  },
  followButtonText: {
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
  },

  // 标签切换样式
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
    backgroundColor: '#09090b',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
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

  // 内容区域样式
  contentContainer: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  sectionTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  sectionTitleText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  viewAllText: {
    fontSize: 14,
    color: '#6366f1',
  },

  // 歌曲项样式
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#18181b',
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
    marginBottom: 4,
  },
  songMeta: {
    fontSize: 13,
    color: '#a1a1aa',
  },
  songDuration: {
    fontSize: 13,
    color: '#71717a',
    marginRight: 8,
  },
  moreButton: {
    padding: 4,
  },

  // 专辑项样式
  albumRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  albumItem: {
    width: (width - 48) / 2,
    marginBottom: 16,
  },
  albumCover: {
    width: (width - 48) / 2,
    height: (width - 48) / 2,
    borderRadius: 10,
    marginBottom: 8,
  },
  albumInfo: {
    paddingHorizontal: 4,
  },
  albumTitle: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
    marginBottom: 4,
  },
  albumMeta: {
    fontSize: 13,
    color: '#a1a1aa',
  },

  // 简介部分样式
  aboutSection: {
    padding: 20,
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  aboutContent: {
    fontSize: 14,
    color: '#a1a1aa',
    lineHeight: 22,
    marginBottom: 30,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#18181b',
    borderRadius: 12,
    paddingVertical: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
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
});

export default ArtistDetailScreen;
