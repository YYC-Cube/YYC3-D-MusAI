import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { usePlayerStore, Song } from '@/stores/playerStore'
import musicService from '@/services/musicService'

const { width } = Dimensions.get('window')

const GENRES = [
  { id: 'pop', name: '流行', icon: 'musical-notes', color: '#ec4899' },
  { id: 'rock', name: '摇滚', icon: 'flash', color: '#f59e0b' },
  { id: 'jazz', name: '爵士', icon: 'jazz-band', color: '#8b5cf6' },
  { id: 'classical', name: '古典', icon: 'piano', color: '#06b6d4' },
  { id: 'electronic', name: '电子', icon: 'radio', color: '#10b981' },
  { id: 'hiphop', name: '嘻哈', icon: 'mic', color: '#ef4444' },
  { id: 'rnb', name: 'R&B', icon: 'heart', color: '#f97316' },
  { id: 'country', name: '乡村', icon: 'leaf', color: '#84cc16' },
]

export default function DiscoverScreen() {
  const navigation = useNavigation()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Song[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const playerActions = usePlayerStore((state) => state.actions)

  const handleSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query)
      setError(null)

      if (query.trim().length === 0) {
        setSearchResults([])
        setIsSearching(false)
        return
      }

      setIsSearching(true)

      try {
        const result = await musicService.search({
          query: query.trim(),
          type: 'songs',
          limit: 20,
        })
        setSearchResults(result.songs)
      } catch (err) {
        const message = err instanceof Error ? err.message : '搜索失败'
        setError(message)
        Alert.alert('搜索失败', message)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    },
    []
  )

  function handlePlaySong(song: Song) {
    playerActions.playTrack(song)
  }

  function renderGenreItem({ item }: { item: typeof GENRES[0] }) {
    return (
      <TouchableOpacity
        style={[
          styles.genreCard,
          selectedGenre === item.id && styles.genreCardActive,
          { borderLeftColor: item.color },
        ]}
        onPress={() => {
          setSelectedGenre(selectedGenre === item.id ? null : item.id)
          if (selectedGenre !== item.id) {
            handleSearch(item.name)
          }
        }}
        activeOpacity={0.7}
      >
        <Ionicons name={item.icon as any} size={28} color={item.color} />
        <Text style={styles.genreName}>{item.name}</Text>
      </TouchableOpacity>
    )
  }

  function renderSearchResult({ item }: { item: Song }) {
    return (
      <TouchableOpacity
        style={styles.resultItem}
        onPress={() => handlePlaySong(item)}
        activeOpacity={0.7}
      >
        <Image source={{ uri: item.cover_url }} style={styles.resultCover} />
        <View style={styles.resultInfo}>
          <Text style={styles.resultTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.resultArtist} numberOfLines={1}>
            {item.artist}
          </Text>
        </View>
        <View style={styles.resultActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="heart-outline" size={22} color="#a1a1aa" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="add-circle-outline" size={22} color="#a1a1aa" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#71717a" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="搜索歌曲、歌手、专辑..."
            placeholderTextColor="#71717a"
            value={searchQuery}
            onChangeText={handleSearch}
            autoCorrect={false}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={20} color="#71717a" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={[]}
        renderItem={() => null}
        keyExtractor={() => 'separator'}
        ListHeaderComponent={
          <>
            {/* Error Banner */}
            {error && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity onPress={() => handleSearch(searchQuery)}>
                  <Text style={styles.retryText}>重试</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Genre Grid */}
            {!searchQuery && (
              <View style={styles.genresSection}>
                <Text style={styles.sectionTitle}>浏览分类</Text>
                <View style={styles.genresGrid}>
                  {GENRES.map((genre) => (
                    <View key={genre.id} style={styles.genreWrapper}>
                      {renderGenreItem({ item: genre })}
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Search Results */}
            {(searchQuery || searchResults.length > 0) && (
              <View style={styles.resultsSection}>
                {isSearching ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#6366f1" />
                    <Text style={styles.loadingText}>搜索中...</Text>
                  </View>
                ) : searchResults.length > 0 ? (
                  <>
                    <Text style={styles.resultsTitle}>
                      找到 {searchResults.length} 个结果
                    </Text>
                    <FlatList
                      data={searchResults}
                      scrollEnabled={false}
                      keyExtractor={(item) => item.id}
                      renderItem={renderSearchResult}
                    />
                  </>
                ) : searchQuery.trim().length > 0 ? (
                  <View style={styles.noResults}>
                    <Ionicons name="musical-note-outline" size={64} color="#27272a" />
                    <Text style={styles.noResultsText}>
                      未找到 "{searchQuery}" 相关结果
                    </Text>
                    <Text style={styles.noResultsHint}>
                      尝试使用不同的关键词搜索
                    </Text>
                  </View>
                ) : null}
              </View>
            )}

            {/* Recent Searches (when no query) */}
            {!searchQuery && (
              <View style={styles.recentSection}>
                <View style={styles.recentHeader}>
                  <Text style={styles.sectionTitle}>最近搜索</Text>
                  <TouchableOpacity>
                    <Text style={styles.clearText}>清除</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.recentTags}>
                  {['The Weeknd', 'Dua Lipa', 'Jazz', 'Electronic'].map((tag) => (
                    <TouchableOpacity
                      key={tag}
                      style={styles.tag}
                      onPress={() => handleSearch(tag)}
                    >
                      <Text style={styles.tagText}>{tag}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </>
        }
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#27272a',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#fafafa',
  },
  listContent: {
    paddingBottom: 80,
  },
  errorBanner: {
    marginHorizontal: 20,
    marginTop: 8,
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
  genresSection: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fafafa',
    marginBottom: 16,
  },
  genresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  genreWrapper: {
    width: (width - 56) / 2,
  },
  genreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181b',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#27272a',
    borderLeftWidth: 4,
    marginBottom: 12,
  },
  genreCardActive: {
    backgroundColor: '#1e1e22',
    borderColor: '#3f3f46',
  },
  genreName: {
    marginLeft: 12,
    fontSize: 15,
    fontWeight: '600',
    color: '#fafafa',
  },
  resultsSection: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#a1a1aa',
  },
  resultsTitle: {
    fontSize: 16,
    color: '#a1a1aa',
    marginBottom: 12,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181b',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  resultCover: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: '#27272a',
    marginRight: 12,
  },
  resultInfo: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fafafa',
    marginBottom: 2,
  },
  resultArtist: {
    fontSize: 13,
    color: '#a1a1aa',
  },
  resultActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 6,
  },
  noResults: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  noResultsText: {
    fontSize: 16,
    color: '#d4d4d8',
    marginTop: 16,
    textAlign: 'center',
  },
  noResultsHint: {
    fontSize: 14,
    color: '#71717a',
    marginTop: 8,
    textAlign: 'center',
  },
  recentSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  clearText: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '500',
  },
  recentTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tag: {
    backgroundColor: '#18181b',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  tagText: {
    fontSize: 14,
    color: '#d4d4d8',
  },
})
