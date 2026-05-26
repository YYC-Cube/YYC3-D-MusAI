import React, { useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  TextInput,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { usePlayerStore, Song, Playlist } from '@/stores/playerStore'

type TabType = 'playlists' | 'liked' | 'downloaded' | 'recent'

const MOCK_PLAYLISTS: Playlist[] = [
  {
    id: 'pl1',
    name: '我喜欢的音乐',
    description: '128 首歌曲',
    cover_url: 'https://picsum.photos/seed/liked/200/200',
    song_ids: [],
  },
  {
    id: 'pl2',
    name: '工作专注',
    description: '45 首歌曲 · 轻音乐',
    cover_url: 'https://picsum.photos/seed/work/200/200',
    song_ids: [],
  },
  {
    id: 'pl3',
    name: '运动能量',
    description: '67 首歌曲 · 节奏感强',
    cover_url: 'https://picsum.photos/seed/sport/200/200',
    song_ids: [],
  },
  {
    id: 'pl4',
    name: '深夜情歌',
    description: '89 首歌曲 · 抒情慢歌',
    cover_url: 'https://picsum.photos/seed/night/200/200',
    song_ids: [],
  },
]

const MOCK_LIKED_SONGS: Song[] = [
  {
    id: 'l1',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    duration: 200,
    cover_url: 'https://picsum.photos/seed/like1/300/300',
    audio_url: '',
  },
  {
    id: 'l2',
    title: 'Levitating',
    artist: 'Dua Lipa',
    album: 'Future Nostalgia',
    duration: 203,
    cover_url: 'https://picsum.photos/seed/like2/300/300',
    audio_url: '',
  },
  {
    id: 'l3',
    title: 'Save Your Tears',
    artist: 'The Weeknd',
    album: 'After Hours',
    duration: 215,
    cover_url: 'https://picsum.photos/seed/like3/300/300',
    audio_url: '',
  },
]

export default function LibraryScreen() {
  const navigation = useNavigation()
  const [activeTab, setActiveTab] = useState<TabType>('playlists')
  const [searchQuery, setSearchQuery] = useState('')

  const playerActions = usePlayerStore((state) => state.actions)

  const tabs: { key: TabType; label: string; icon: string }[] = [
    { key: 'playlists', label: '歌单', icon: 'list' },
    { key: 'liked', label: '喜欢', icon: 'heart' },
    { key: 'downloaded', label: '下载', icon: 'download' },
    { key: 'recent', label: '最近', icon: 'time' },
  ]

  function handlePlaySong(song: Song) {
    playerActions.playTrack(song)
  }

  function handlePlayAll(songs: Song[]) {
    if (songs.length > 0) {
      playerActions.setQueue(songs)
    }
  }

  function renderPlaylistItem({ item }: { item: Playlist }) {
    return (
      <TouchableOpacity
        style={styles.playlistCard}
        onPress={() => {} /* Navigate to playlist detail */}
        activeOpacity={0.7}
      >
        <Image source={{ uri: item.cover_url }} style={styles.playlistCover} />
        <View style={styles.playlistInfo}>
          <Text style={styles.playlistName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.playlistDesc} numberOfLines={1}>
            {item.description || `${item.song_ids.length} 首歌曲`}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#71717a" />
      </TouchableOpacity>
    )
  }

  function renderSongItem({ item, index }: { item: Song; index: number }) {
    return (
      <TouchableOpacity
        style={styles.songItem}
        onPress={() => handlePlaySong(item)}
        onLongPress={() => {} /* Show options menu */}
        activeOpacity={0.7}
      >
        <Text style={styles.songIndex}>{index + 1}</Text>
        <Image source={{ uri: item.cover_url }} style={styles.songCover} />
        <View style={styles.songInfo}>
          <Text style={styles.songTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.songArtist} numberOfLines={1}>
            {item.artist}
          </Text>
        </View>
        <View style={styles.songActions}>
          <TouchableOpacity style={styles.actionIcon}>
            <Ionicons name="heart" size={20} color="#ef4444" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionIcon}>
            <Ionicons name="ellipsis-vertical" size={20} color="#a1a1aa" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    )
  }

  function renderContent() {
    switch (activeTab) {
      case 'playlists':
        return (
          <>
            <FlatList
              data={MOCK_PLAYLISTS}
              keyExtractor={(item) => item.id}
              renderItem={renderPlaylistItem}
              contentContainerStyle={styles.listContent}
              ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            />

            {/* Create Playlist FAB */}
            <TouchableOpacity
              style={styles.fab}
              onPress={() => {} /* Show create playlist modal */}
            >
              <Ionicons name="add" size={28} color="#ffffff" />
            </TouchableOpacity>
          </>
        )

      case 'liked':
        return (
          <View style={styles.tabContent}>
            <View style={styles.tabHeader}>
              <Text style={styles.tabTitle}>我喜欢的音乐</Text>
              <TouchableOpacity
                style={styles.playAllButton}
                onPress={() => handlePlayAll(MOCK_LIKED_SONGS)}
              >
                <Ionicons name="play" size={16} color="#6366f1" />
                <Text style={styles.playAllText}>全部播放</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={MOCK_LIKED_SONGS}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }) => renderSongItem({ item, index })}
              contentContainerStyle={styles.listContent}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </View>
        )

      case 'downloaded':
        return (
          <View style={styles.emptyState}>
            <Ionicons name="cloud-download-outline" size={64} color="#27272a" />
            <Text style={styles.emptyTitle}>暂无下载内容</Text>
            <Text style={styles.emptyDesc}>
              下载歌曲后可离线收听
            </Text>
          </View>
        )

      case 'recent':
        return (
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={64} color="#27272a" />
            <Text style={styles.emptyTitle}>暂无播放记录</Text>
            <Text style={styles.emptyDesc}>
              播放过的歌曲会显示在这里
            </Text>
          </View>
        )

      default:
        return null
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>我的音乐库</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={22} color="#fafafa" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Ionicons
              name={tab.icon as any}
              size={18}
              color={activeTab === tab.key ? '#6366f1' : '#71717a'}
            />
            <Text
              style={[
                styles.tabLabel,
                activeTab === tab.key && styles.tabLabelActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {renderContent()}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fafafa',
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#18181b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#18181b',
    marginHorizontal: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#6366f1',
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#71717a',
  },
  tabLabelActive: {
    color: '#6366f1',
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  playlistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181b',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  playlistCover: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: '#27272a',
    marginRight: 14,
  },
  playlistInfo: {
    flex: 1,
  },
  playlistName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fafafa',
    marginBottom: 4,
  },
  playlistDesc: {
    fontSize: 14,
    color: '#a1a1aa',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 80,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  tabContent: {
    flex: 1,
  },
  tabHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  tabTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fafafa',
  },
  playAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  playAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  songIndex: {
    width: 32,
    fontSize: 15,
    color: '#71717a',
    textAlign: 'center',
    fontWeight: '500',
  },
  songCover: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: '#27272a',
    marginRight: 12,
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fafafa',
    marginBottom: 2,
  },
  songArtist: {
    fontSize: 13,
    color: '#a1a1aa',
  },
  songActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionIcon: {
    padding: 6,
  },
  separator: {
    height: 1,
    backgroundColor: '#18181b',
    marginHorizontal: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#d4d4d8',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: '#71717a',
    textAlign: 'center',
  },
})
