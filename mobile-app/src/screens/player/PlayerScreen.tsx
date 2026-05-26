import { useAudioPlayer } from '@/hooks/useAudioPlayer'
import { usePlayerStore } from '@/stores/playerStore'
import { Ionicons } from '@expo/vector-icons'
import React, { useEffect, useState } from 'react'
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function PlayerScreen() {
  const currentTrack = usePlayerStore((state) => state.currentTrack)
  const isPlaying = usePlayerStore((state) => state.isPlaying)
  const isBuffering = usePlayerStore((state) => state.isBuffering)
  const currentTime = usePlayerStore((state) => state.currentTime)
  const duration = usePlayerStore((state) => state.duration)
  const volume = usePlayerStore((state) => state.volume)
  const shuffleMode = usePlayerStore((state) => state.shuffleMode)
  const repeatMode = usePlayerStore((state) => state.repeatMode)

  const actions = usePlayerStore((state) => state.actions)

  const { seekTo, setVolume } = useAudioPlayer()

  const [showVolumeSlider, setShowVolumeSlider] = useState(false)

  useEffect(() => {
    if (currentTrack?.audio_url) {
      // Load audio when track changes
      console.log('Loading track:', currentTrack.title)
    }
  }, [currentTrack?.id])

  function formatTime(seconds: number): string {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  function handleSeek(value: number) {
    const seekTime = value * duration
    actions.seekTo(seekTime)
    seekTo(seekTime)
  }

  function handleVolumeChange(value: number) {
    setVolume(value)
    actions.setVolume(value)
  }

  if (!currentTrack) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="musical-note-outline" size={80} color="#27272a" />
          <Text style={styles.emptyText}>没有正在播放的音乐</Text>
        </View>
      </SafeAreaView>
    )
  }

  const progress = duration > 0 ? currentTime / duration : 0

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { }} style={styles.headerButton}>
          <Ionicons name="chevron-down" size={28} color="#fafafa" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>正在播放</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#fafafa" />
        </TouchableOpacity>
      </View>

      {/* Album Art */}
      <View style={styles.artworkContainer}>
        <View style={[styles.artworkWrapper, isPlaying && styles.artworkPlaying]}>
          <Image
            source={{ uri: currentTrack.cover_url }}
            style={styles.artwork}
            resizeMode="cover"
          />
        </View>
      </View>

      {/* Track Info */}
      <View style={styles.trackInfo}>
        <View style={styles.trackText}>
          <Text style={styles.trackTitle} numberOfLines={1}>
            {currentTrack.title}
          </Text>
          <Text style={styles.trackArtist} numberOfLines={1}>
            {currentTrack.artist}
          </Text>
        </View>
        <TouchableOpacity style={styles.likeButton}>
          <Ionicons name="heart-outline" size={28} color="#fafafa" />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={(e) => {
            const locationX = (e.nativeEvent as any).pageX || 0
            const barWidth = 280
            const seekProgress = Math.max(0, Math.min(1, locationX / barWidth))
            handleSeek(seekProgress)
          }}
        >
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            <View style={[styles.progressThumb, { left: `${progress * 100}%` }]} />
          </View>
        </TouchableOpacity>
        <View style={styles.timeLabels}>
          <Text style={styles.timeLabel}>{formatTime(currentTime)}</Text>
          <Text style={styles.timeLabel}>{formatTime(duration)}</Text>
        </View>
      </View>

      {/* Volume Control (Toggleable) */}
      {showVolumeSlider && (
        <View style={styles.volumeContainer}>
          <Ionicons name="volume-low" size={18} color="#a1a1aa" />
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={(e) => {
              const { locationX } = e.nativeEvent
              const barWidth = 200
              const vol = Math.max(0, Math.min(1, locationX / barWidth))
              handleVolumeChange(vol)
            }}
          >
            <View style={styles.volumeBar}>
              <View style={[styles.progressFill, { width: `${volume * 100}%` }]} />
            </View>
          </TouchableOpacity>
          <Ionicons name="volume-high" size={18} color="#a1a1aa" />
        </View>
      )}

      {/* Controls */}
      <View style={styles.controls}>
        {/* Secondary Controls */}
        <View style={styles.secondaryControls}>
          <TouchableOpacity
            onPress={() => actions.toggleShuffle()}
            style={[
              styles.controlButton,
              shuffleMode && styles.controlActive,
            ]}
          >
            <Ionicons
              name="shuffle"
              size={22}
              color={shuffleMode ? '#6366f1' : '#d4d4d8'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => actions.previous()}
            style={styles.mainControlButton}
          >
            <Ionicons name="play-skip-back" size={32} color="#fafafa" />
          </TouchableOpacity>

          {/* Play/Pause Button */}
          <TouchableOpacity
            onPress={() => actions.togglePlayPause()}
            style={[styles.playPauseButton, isBuffering && styles.buffering]}
            activeOpacity={0.8}
          >
            {isBuffering ? (
              <Ionicons name="hourglass-outline" size={36} color="#ffffff" />
            ) : isPlaying ? (
              <Ionicons name="pause" size={36} color="#ffffff" />
            ) : (
              <Ionicons name="play" size={36} color="#ffffff" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => actions.next()}
            style={styles.mainControlButton}
          >
            <Ionicons name="play-skip-forward" size={32} color="#fafafa" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => actions.toggleRepeat()}
            style={[
              styles.controlButton,
              repeatMode !== 'off' && styles.controlActive,
            ]}
          >
            <Ionicons
              name={
                repeatMode === 'one'
                  ? 'repeat'
                  : repeatMode === 'all'
                    ? 'repeat'
                    : 'repeat-outline'
              }
              size={22}
              color={repeatMode !== 'off' ? '#6366f1' : '#d4d4d8'}
            />
            {repeatMode === 'one' && (
              <Text style={styles.repeatOneIndicator}>1</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Volume Toggle */}
        <TouchableOpacity
          style={styles.volumeToggle}
          onPress={() => setShowVolumeSlider(!showVolumeSlider)}
        >
          <Ionicons
            name={volume === 0 ? 'volume-mute' : volume < 0.5 ? 'volume-low' : 'volume-high'}
            size={20}
            color="#a1a1aa"
          />
        </TouchableOpacity>
      </View>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.bottomAction}>
          <Ionicons name="list-outline" size={22} color="#a1a1aa" />
          <Text style={styles.bottomActionText}>队列</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomAction}>
          <Ionicons name="share-social-outline" size={22} color="#a1a1aa" />
          <Text style={styles.bottomActionText}>分享</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomAction}>
          <Ionicons name="document-text-outline" size={22} color="#a1a1aa" />
          <Text style={styles.bottomActionText}>歌词</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#71717a',
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fafafa',
  },
  artworkContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  artworkWrapper: {
    width: 320,
    height: 320,
    borderRadius: 160,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 16,
  },
  artworkPlaying: {
    // Animation could be added here for spinning effect
  },
  artwork: {
    width: '100%',
    height: '100%',
    backgroundColor: '#18181b',
  },
  trackInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  trackText: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fafafa',
    marginBottom: 6,
  },
  trackArtist: {
    fontSize: 16,
    color: '#a1a1aa',
  },
  likeButton: {
    padding: 8,
  },
  progressContainer: {
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#27272a',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 3,
  },
  progressThumb: {
    position: 'absolute',
    top: -4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#6366f1',
    marginLeft: -7,
  },
  timeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeLabel: {
    fontSize: 13,
    color: '#71717a',
    fontFamily: 'monospace',
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    marginBottom: 16,
    gap: 10,
  },
  volumeBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#27272a',
    borderRadius: 2,
    overflow: 'hidden',
  },
  controls: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  secondaryControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
  },
  mainControlButton: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playPauseButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  buffering: {
    opacity: 0.7,
  },
  repeatOneIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    fontSize: 10,
    fontWeight: '700',
    color: '#6366f1',
  },
  volumeToggle: {
    position: 'absolute',
    right: 0,
    top: -50,
    padding: 8,
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#18181b',
    marginTop: 16,
  },
  bottomAction: {
    alignItems: 'center',
    gap: 4,
  },
  bottomActionText: {
    fontSize: 11,
    color: '#71717a',
    marginTop: 2,
  },
})
