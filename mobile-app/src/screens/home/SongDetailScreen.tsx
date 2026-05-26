import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Share,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { usePlayerStore, Song } from '@/stores/playerStore'

export default function SongDetailScreen({ route }: any) {
  const navigation = useNavigation()
  
  const { songId } = route?.params || {}
  
  // Mock data - in real app, fetch from API based on songId
  const [song] = useState<Song>({
    id: songId || '1',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    duration: 200,
    cover_url: 'https://picsum.photos/seed/songdetail/400/400',
    audio_url: '',
    genre: 'Pop',
    play_count: 2500000,
    like_count: 180000,
  })

  const [isLiked, setIsLiked] = useState(false)
  const [isInPlaylist, setIsInPlaylist] = useState(false)

  const playerActions = usePlayerStore((state) => state.actions)

  function formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  function handlePlay() {
    playerActions.playTrack(song)
  }

  async function handleShare() {
    try {
      await Share.share({
        message: `正在收听 ${song.title} - ${song.artist}\n\n来自 D-Music App`,
        url: undefined, // Add deep link when available
        title: `分享歌曲: ${song.title}`,
      })
    } catch (error) {
      console.error('Share failed:', error)
    }
  }

  function toggleLike() {
    setIsLiked(!isLiked)
  }

  function togglePlaylist() {
    setIsInPlaylist(!isInPlaylist)
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-down" size={28} color="#fafafa" />
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerAction} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={22} color="#fafafa" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerAction}>
            <Ionicons name="ellipsis-vertical" size={22} color="#fafafa" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Album Art */}
        <View style={styles.artworkContainer}>
          <Image source={{ uri: song.cover_url }} style={styles.artwork} />
          
          {/* Play Overlay */}
          <TouchableOpacity 
            style={styles.playOverlay}
            onPress={handlePlay}
            activeOpacity={0.8}
          >
            <View style={styles.playButtonLarge}>
              <Ionicons name="play" size={40} color="#ffffff" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Song Info */}
        <View style={styles.infoSection}>
          <Text style={styles.songTitle}>{song.title}</Text>
          <Text style={styles.artistName}>{song.artist}</Text>
          
          {song.album && (
            <View style={styles.albumInfo}>
              <Text style={styles.albumLabel}>专辑</Text>
              <Text style={styles.albumName}>{song.album}</Text>
            </View>
          )}

          {/* Stats */}
          <View style={styles.statsRow}>
            <StatItem icon="play" label="播放" value={formatNumber(song.play_count || 0)} />
            <StatItem icon="heart" label="喜欢" value={formatNumber(song.like_count || 0)} />
            {song.genre && (
              <View style={styles.genreTag}>
                <Text style={styles.genreText}>{song.genre}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <ActionButton
            icon={isLiked ? "heart" : "heart-outline"}
            label={isLiked ? "已喜欢" : "喜欢"}
            isLiked={isLiked}
            onPress={toggleLike}
          />
          <ActionButton
            icon={isInPlaylist ? "list" : "list-outline"}
            label={isInPlaylist ? "已添加" : "加入歌单"}
            onPress={togglePlaylist}
          />
          <ActionButton
            icon="download-outline"
            label="下载"
            onPress={() => {} /* TODO: Implement download */}
          />
          <ActionButton
            icon="add-circle-outline"
            label="添加到队列"
            onPress={() => playerActions.addToQueue(song)}
          />
        </View>

        {/* Lyrics Preview */}
        <View style={styles.lyricsSection}>
          <Text style={styles.sectionTitle}>歌词预览</Text>
          <View style={styles.lyricsContainer}>
            <Text style={styles.lyricsPlaceholder}>
              歌词内容加载中...
              {'\n\n'}
              完整歌词将在播放时显示
            </Text>
          </View>
        </View>

        {/* Similar Songs */}
        <View style={styles.similarSection}>
          <Text style={styles.sectionTitle}>相似推荐</Text>
          {[1, 2, 3].map((i) => (
            <SimilarSongItem key={i} index={i} />
          ))}
        </View>
      </ScrollView>

      {/* Bottom Play Bar */}
      <View style={styles.bottomBar}>
        <Image source={{ uri: song.cover_url }} style={styles.bottomCover} />
        <View style={styles.bottomInfo}>
          <Text style={styles.bottomTitle} numberOfLines={1}>{song.title}</Text>
          <Text style={styles.bottomArtist} numberOfLines={1}>{song.artist}</Text>
        </View>
        <TouchableOpacity style={styles.bottomPlay} onPress={handlePlay}>
          <Ionicons name="play-circle" size={44} color="#6366f1" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

function StatItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.statItem}>
      <Ionicons name={icon as any} size={16} color="#a1a1aa" />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

function ActionButton({
  icon,
  label,
  isLiked = false,
  onPress,
}: {
  icon: string
  label: string
  isLiked?: boolean
  onPress: () => void
}) {
  return (
    <TouchableOpacity style={styles.actionButton} onPress={onPress} activeOpacity={0.7}>
      <Ionicons
        name={icon as any}
        size={24}
        color={isLiked ? '#ef4444' : '#d4d4d8'}
      />
      <Text style={[styles.actionLabel, isLiked && styles.actionLabelLiked]}>
        {label}
      </Text>
    </TouchableOpacity>
  )
}

function SimilarSongItem({ index }: { index: number }) {
  return (
    <TouchableOpacity style={styles.similarItem} activeOpacity={0.7}>
      <Image
        source={{ uri: `https://picsum.photos/seed/similar${index}/100/100` }}
        style={styles.similarCover}
      />
      <View style={styles.similarInfo}>
        <Text style={styles.similarTitle} numberOfLines={1}>
          相似歌曲 {index}
        </Text>
        <Text style={styles.similarArtist} numberOfLines={1}>
          艺术家名称
        </Text>
      </View>
      <TouchableOpacity>
        <Ionicons name="play-circle-outline" size={32} color="#6366f1" />
      </TouchableOpacity>
    </TouchableOpacity>
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
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerAction: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 120,
  },
  artworkContainer: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  artwork: {
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#18181b',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 20,
  },
  playOverlay: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  playButtonLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(99, 102, 241, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
  },
  infoSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  songTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fafafa',
    marginBottom: 6,
  },
  artistName: {
    fontSize: 17,
    color: '#6366f1',
    marginBottom: 14,
  },
  albumInfo: {
    marginBottom: 18,
  },
  albumLabel: {
    fontSize: 13,
    color: '#71717a',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  albumName: {
    fontSize: 15,
    color: '#d4d4d8',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#d4d4d8',
  },
  statLabel: {
    fontSize: 13,
    color: '#71717a',
  },
  genreTag: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  genreText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6366f1',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#18181b',
    borderRadius: 16,
    marginHorizontal: 24,
    marginBottom: 28,
  },
  actionButton: {
    alignItems: 'center',
    gap: 6,
  },
  actionLabel: {
    fontSize: 12,
    color: '#a1a1aa',
  },
  actionLabelLiked: {
    color: '#ef4444',
  },
  lyricsSection: {
    paddingHorizontal: 24,
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fafafa',
    marginBottom: 14,
  },
  lyricsContainer: {
    backgroundColor: '#18181b',
    borderRadius: 12,
    padding: 20,
    minHeight: 150,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  lyricsPlaceholder: {
    fontSize: 14,
    color: '#52525b',
    textAlign: 'center',
    lineHeight: 22,
  },
  similarSection: {
    paddingHorizontal: 24,
  },
  similarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181b',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  similarCover: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: '#27272a',
    marginRight: 12,
  },
  similarInfo: {
    flex: 1,
  },
  similarTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fafafa',
    marginBottom: 2,
  },
  similarArtist: {
    fontSize: 13,
    color: '#a1a1aa',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181b',
    borderTopWidth: 1,
    borderTopColor: '#27272a',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bottomCover: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#27272a',
    marginRight: 12,
  },
  bottomInfo: {
    flex: 1,
  },
  bottomTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fafafa',
    marginBottom: 2,
  },
  bottomArtist: {
    fontSize: 13,
    color: '#a1a1aa',
  },
  bottomPlay: {},
})
