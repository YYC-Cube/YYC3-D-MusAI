import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { usePlayerStore, Song } from '@/stores/playerStore'
import musicService from '@/services/musicService'
import type { Playlist } from '@/services/musicService'

interface HomeSection {
  id: string
  title: string
  type: 'recommended' | 'trending' | 'playlists'
}

export default function HomeScreen() {
  const navigation = useNavigation()
  const playerActions = usePlayerStore((state) => state.actions)

  const [refreshing, setRefreshing] = useState(false)
  const [greeting, setGreeting] = useState('')
  const [recommended, setRecommended] = useState<Song[]>([])
  const [trending, setTrending] = useState<Song[]>([])
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    updateGreeting()
    loadHomeData()
  }, [])

  function updateGreeting() {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('早上好')
    else if (hour < 18) setGreeting('下午好')
    else setGreeting('晚上好')
  }

  const loadHomeData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [recData, trendData, playlistData] = await Promise.all([
        musicService.getRecommendedSongs(10),
        musicService.getTrendingSongs(10),
        musicService.getPlaylists(),
      ])
      setRecommended(recData)
      setTrending(trendData)
      setPlaylists(playlistData)
    } catch (err) {
      const message = err instanceof Error ? err.message : '加载失败'
      setError(message)
      Alert.alert('加载失败', message)
    } finally {
      setLoading(false)
    }
  }, [])

  async function onRefresh() {
    setRefreshing(true)
    await loadHomeData()
    setRefreshing(false)
  }

  function handlePlaySong(song: Song) {
    playerActions.playTrack(song)
  }

  function renderSongItem({ item }: { item: Song }) {
    return (
      <TouchableOpacity
        style={styles.songItem}
        onPress={() => handlePlaySong(item)}
        activeOpacity={0.7}
      >
        <Image source={{ uri: item.cover_url }} style={styles.songCover} />
        <View style={styles.songInfo}>
          <Text style={styles.songTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.songArtist} numberOfLines={1}>
            {item.artist}
          </Text>
        </View>
        <TouchableOpacity style={styles.playButton}>
          <Ionicons name="play-circle" size={36} color="#6366f1" />
        </TouchableOpacity>
      </TouchableOpacity>
    )
  }

  function renderPlaylistItem({ item }: { item: Playlist }) {
    return (
      <TouchableOpacity
        style={styles.playlistCard}
        onPress={() => navigation.navigate('Library' as never)}
        activeOpacity={0.7}
      >
        <Image source={{ uri: item.cover_url }} style={styles.playlistCover} />
        <Text style={styles.playlistName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.playlistCount}>{item.song_count} 首歌曲</Text>
      </TouchableOpacity>
    )
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]} edges={['top']}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>加载中...</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.headerTitle}>发现音乐</Text>
        </View>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('Settings' as never)}
        >
          <Ionicons name="person-circle" size={40} color="#6366f1" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={[]}
        renderItem={() => null}
        keyExtractor={() => 'separator'}
        ListHeaderComponent={
          <>
            {error && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity onPress={loadHomeData}>
                  <Text style={styles.retryText}>重试</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Recommended Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>为你推荐</Text>
                <TouchableOpacity>
                  <Text style={styles.seeAll}>查看全部</Text>
                </TouchableOpacity>
              </View>
              {recommended.length > 0 ? (
                <FlatList
                  data={recommended}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => item.id}
                  renderItem={renderSongItem}
                  contentContainerStyle={styles.horizontalList}
                />
              ) : (
                <Text style={styles.emptyText}>暂无推荐歌曲</Text>
              )}
            </View>

            {/* Trending Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>🔥 热门歌曲</Text>
                <TouchableOpacity>
                  <Text style={styles.seeAll}>查看全部</Text>
                </TouchableOpacity>
              </View>
              {trending.length > 0 ? (
                <FlatList
                  data={trending}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => item.id}
                  renderItem={renderSongItem}
                  contentContainerStyle={styles.horizontalList}
                />
              ) : (
                <Text style={styles.emptyText}>暂无热门歌曲</Text>
              )}
            </View>

            {/* Playlists Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>🎵 推荐歌单</Text>
                <TouchableOpacity>
                  <Text style={styles.seeAll}>查看全部</Text>
                </TouchableOpacity>
              </View>
              {playlists.length > 0 ? (
                <FlatList
                  data={playlists}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => item.id}
                  renderItem={renderPlaylistItem}
                  contentContainerStyle={styles.horizontalList}
                />
              ) : (
                <Text style={styles.emptyText}>暂无推荐歌单</Text>
              )}
            </View>
          </>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />
        }
        contentContainerStyle={styles.listContent}
      />

      {/* Mini Player */}
      <MiniPlayer />
    </SafeAreaView>
  )
}

function MiniPlayer() {
  const currentTrack = usePlayerStore((state) => state.currentTrack)
  const isPlaying = usePlayerStore((state) => state.isPlaying)
  const actions = usePlayerStore((state) => state.actions)

  if (!currentTrack) return null

  return (
    <TouchableOpacity
      style={styles.miniPlayer}
      onPress={() => { /* Navigate to full player */ }}
      activeOpacity={0.9}
    >
      <Image source={{ uri: currentTrack.cover_url }} style={styles.miniCover} />
      <View style={styles.miniInfo}>
        <Text style={styles.miniTitle} numberOfLines={1}>
          {currentTrack.title}
        </Text>
        <Text style={styles.miniArtist} numberOfLines={1}>
          {currentTrack.artist}
        </Text>
      </View>
      <TouchableOpacity onPress={() => actions.togglePlayPause()}>
        <Ionicons
          name={isPlaying ? 'pause-circle' : 'play-circle'}
          size={40}
          color="#6366f1"
        />
      </TouchableOpacity>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#a1a1aa',
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  greeting: {
    fontSize: 14,
    color: '#a1a1aa',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fafafa',
  },
  profileButton: {},
  listContent: {
    paddingBottom: 100,
  },
  errorBanner: {
    marginHorizontal: 20,
    marginTop: 12,
    padding: 12,
    backgroundColor: '#450a0a',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 13,
    flex: 1,
  },
  retryText: {
    color: '#6366f1',
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fafafa',
  },
  seeAll: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '500',
  },
  horizontalList: {
    paddingHorizontal: 20,
    paddingRight: 10,
  },
  emptyText: {
    paddingHorizontal: 20,
    color: '#71717a',
    fontSize: 14,
  },
  songItem: {
    width: 160,
    marginRight: 16,
    backgroundColor: '#18181b',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#27272a',
  },
  songCover: {
    width: '100%',
    height: 160,
    backgroundColor: '#27272a',
  },
  songInfo: {
    padding: 10,
  },
  songTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fafafa',
    marginBottom: 4,
  },
  songArtist: {
    fontSize: 12,
    color: '#a1a1aa',
  },
  playButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
  playlistCard: {
    width: 140,
    marginRight: 16,
  },
  playlistCover: {
    width: 140,
    height: 140,
    borderRadius: 12,
    backgroundColor: '#27272a',
    marginBottom: 8,
  },
  playlistName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fafafa',
    marginBottom: 2,
  },
  playlistCount: {
    fontSize: 12,
    color: '#a1a1aa',
  },
  miniPlayer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#18181b',
    borderTopWidth: 1,
    borderTopColor: '#27272a',
  },
  miniCover: {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: '#27272a',
  },
  miniInfo: {
    flex: 1,
    marginLeft: 12,
  },
  miniTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fafafa',
  },
  miniArtist: {
    fontSize: 12,
    color: '#a1a1aa',
    marginTop: 2,
  },
})
