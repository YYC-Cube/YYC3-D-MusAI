import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
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

interface Artist {
  id: string;
  name: string;
  avatar_url: string;
  followers_count: number;
}

interface Album {
  id: string;
  title: string;
  artist: string;
  cover_url: string;
  year: number;
}

type RootStackParamList = {
  SearchResults: { query: string };
  SongDetail: { song: Song };
  ArtistDetail: { artist: Artist };
  AlbumDetail: { album: Album };
};

type SearchResultsNavigationProp = StackNavigationProp<RootStackParamList, 'SearchResults'>;
type SearchResultsRouteProp = RouteProp<RootStackParamList, 'SearchResults'>;

const SearchResultsScreen: React.FC = () => {
  const navigation = useNavigation<SearchResultsNavigationProp>();
  const route = useRoute<SearchResultsRouteProp>();
  const { query: initialQuery } = route.params;

  const [query, setQuery] = useState(initialQuery);
  const [searchText, setSearchText] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<'songs' | 'artists' | 'albums'>('songs');
  const [isLoading, setIsLoading] = useState(false);
  const [songs, setSongs] = useState<Song[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);

  const { addToQueue, playTrack } = usePlayerStore().actions;

  useEffect(() => {
    performSearch(initialQuery);
  }, [initialQuery]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setQuery(searchQuery);

    try {
      // TODO: 替换为实际API调用
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock数据
      const mockSongs: Song[] = [
        {
          id: '1',
          title: `${searchQuery} - 歌曲一`,
          artist: '艺术家A',
          album: '专辑X',
          cover_url: 'https://picsum.photos/seed/song1/200/200',
          duration: 240,
        },
        {
          id: '2',
          title: `${searchQuery} - 歌曲二`,
          artist: '艺术家B',
          album: '专辑Y',
          cover_url: 'https://picsum.photos/seed/song2/200/200',
          duration: 180,
        },
        {
          id: '3',
          title: `关于${searchQuery}`,
          artist: '艺术家C',
          album: '专辑Z',
          cover_url: 'https://picsum.photos/seed/song3/200/200',
          duration: 200,
        },
      ];

      const mockArtists: Artist[] = [
        {
          id: '1',
          name: `${searchQuery} 艺术家`,
          avatar_url: 'https://picsum.photos/seed/artist1/200/200',
          followers_count: 1000000,
        },
        {
          id: '2',
          name: `DJ ${searchQuery}`,
          avatar_url: 'https://picsum.photos/seed/artist2/200/200',
          followers_count: 500000,
        },
      ];

      const mockAlbums: Album[] = [
        {
          id: '1',
          title: `${searchQuery} 专辑`,
          artist: '艺术家A',
          cover_url: 'https://picsum.photos/seed/album1/200/200',
          year: 2024,
        },
        {
          id: '2',
          title: `最佳 ${searchQuery}`,
          artist: 'Various Artists',
          cover_url: 'https://picsum.photos/seed/album2/200/200',
          year: 2023,
        },
      ];

      setSongs(mockSongs);
      setArtists(mockArtists);
      setAlbums(mockAlbums);
    } catch (error) {
      console.error('搜索失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchText.trim()) {
      performSearch(searchText);
    }
  };

  const handleSongPress = (song: Song) => {
    playTrack(song as any);
    addToQueue(song as any);
    navigation.navigate('SongDetail', { song });
  };

  const handleArtistPress = (artist: Artist) => {
    navigation.navigate('ArtistDetail', { artist });
  };

  const handleAlbumPress = (album: Album) => {
    navigation.navigate('AlbumDetail', { album });
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderSongItem = ({ item }: { item: Song }) => (
    <TouchableOpacity
      style={styles.songItem}
      onPress={() => handleSongPress(item)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.cover_url }} style={styles.songCover} />
      <View style={styles.songInfo}>
        <Text style={styles.songTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.songMeta} numberOfLines={1}>
          {item.artist} · {item.album}
        </Text>
      </View>
      <Text style={styles.songDuration}>{formatDuration(item.duration)}</Text>
      <TouchableOpacity style={styles.moreButton}>
        <Ionicons name="ellipsis-vertical" size={20} color="#a1a1aa" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderArtistItem = ({ item }: { item: Artist }) => (
    <TouchableOpacity
      style={styles.artistItem}
      onPress={() => handleArtistPress(item)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.avatar_url }} style={styles.artistAvatar} />
      <Text style={styles.artistName} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.artistFollowers}>
        {(item.followers_count / 10000).toFixed(1)}万粉丝
      </Text>
    </TouchableOpacity>
  );

  const renderAlbumItem = ({ item }: { item: Album }) => (
    <TouchableOpacity
      style={styles.albumItem}
      onPress={() => handleAlbumPress(item)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.cover_url }} style={styles.albumCover} />
      <Text style={styles.albumTitle} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.albumArtist} numberOfLines={1}>
        {item.artist} · {item.year}
      </Text>
    </TouchableOpacity>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>搜索中...</Text>
        </View>
      );
    }

    const getData = () => {
      switch (activeTab) {
        case 'songs': return songs;
        case 'artists': return artists;
        case 'albums': return albums;
        default: return [];
      }
    };

    const getRenderItem = () => {
      switch (activeTab) {
        case 'songs': return renderSongItem;
        case 'artists': return renderArtistItem;
        case 'albums': return renderAlbumItem;
        default: return renderSongItem;
      }
    };

    const getKey = (item: any) => item.id;

    const getNumColumns = () => {
      return activeTab === 'albums' ? 2 : 1;
    };

    const data = getData();

    if (data.length === 0 && !isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={64} color="#3f3f46" />
          <Text style={styles.emptyTitle}>未找到结果</Text>
          <Text style={styles.emptySubtitle}>
            尝试使用不同的关键词搜索
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={data as any[]}
        renderItem={getRenderItem() as any}
        keyExtractor={getKey}
        numColumns={getNumColumns()}
        key={activeTab}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.resultHeader}>
            <Text style={styles.resultText}>
              找到 {data.length} 个"{query}"相关结果
            </Text>
          </View>
        }
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 搜索栏 */}
      <View style={styles.searchBarContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>

        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#71717a" />
          <TextInput
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
            placeholder="搜索歌曲、艺术家、专辑"
            placeholderTextColor="#71717a"
            returnKeyType="search"
            autoCorrect={false}
            autoFocus
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={20} color="#71717a" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 标签切换 */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'songs' && styles.activeTab]}
          onPress={() => setActiveTab('songs')}
        >
          <Text style={[styles.tabText, activeTab === 'songs' && styles.activeTabText]}>
            歌曲
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'artists' && styles.activeTab]}
          onPress={() => setActiveTab('artists')}
        >
          <Text style={[styles.tabText, activeTab === 'artists' && styles.activeTabText]}>
            艺术家
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
      </View>

      {/* 内容区域 */}
      {renderContent()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },

  // 搜索栏样式
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  backButton: {
    marginRight: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181b',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#ffffff',
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

  // 列表内容样式
  listContent: {
    padding: 16,
  },
  resultHeader: {
    marginBottom: 16,
  },
  resultText: {
    fontSize: 14,
    color: '#a1a1aa',
  },

  // 歌曲项样式
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#18181b',
  },
  songCover: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  songInfo: {
    flex: 1,
    marginLeft: 12,
  },
  songTitle: {
    fontSize: 16,
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

  // 艺术家项样式
  artistItem: {
    width: (width - 48) / 3,
    alignItems: 'center',
    marginBottom: 24,
  },
  artistAvatar: {
    width: (width - 48) / 3,
    height: (width - 48) / 3,
    borderRadius: (width - 48) / 6,
    marginBottom: 8,
  },
  artistName: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 2,
  },
  artistFollowers: {
    fontSize: 12,
    color: '#71717a',
    textAlign: 'center',
  },

  // 专辑项样式
  albumItem: {
    width: (width - 48) / 2,
    marginBottom: 20,
  },
  albumCover: {
    width: (width - 48) / 2,
    height: (width - 48) / 2,
    borderRadius: 8,
    marginBottom: 8,
  },
  albumTitle: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
    marginBottom: 4,
  },
  albumArtist: {
    fontSize: 13,
    color: '#a1a1aa',
  },

  // 加载和空状态样式
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#a1a1aa',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#71717a',
    textAlign: 'center',
  },
});

export default SearchResultsScreen;
