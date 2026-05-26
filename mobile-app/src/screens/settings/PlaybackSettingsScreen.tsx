import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { usePlayerStore } from '../../stores/playerStore';

type RootStackParamList = {};
type NavigationProp = StackNavigationProp<RootStackParamList>;

const PlaybackSettingsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const [audioQuality, setAudioQuality] = useState<'low' | 'standard' | 'high' | 'lossless'>('high');
  const [equalizerPreset, setEqualizerPreset] = useState('normal');
  const [crossfade, setCrossfade] = useState(false);
  const [crossfadeDuration, setCrossfadeDuration] = useState(3);
  const [gaplessPlayback, setGaplessPlayback] = useState(true);
  const [normalizeVolume, setNormalizeVolume] = useState(true);
  const [autoPlay, setAutoPlay] = useState(true);
  const [sleepTimer, setSleepTimer] = useState<number | null>(null);
  const [lyricsDisplay, setLyricsDisplay] = useState(true);
  const [lyricsSync, setLyricsSync] = useState(true);
  const [showSleepTimerModal, setShowSleepTimerModal] = useState(false);

  const playerStore = usePlayerStore();

  const audioQualityOptions = [
    { value: 'low' as const, label: '低音质', size: '~2MB/首', description: '节省流量' },
    { value: 'standard' as const, label: '标准', size: '~5MB/首', description: '平衡质量与流量' },
    { value: 'high' as const, label: '高音质', size: '~10MB/首', description: '推荐选项' },
    { value: 'lossless' as const, label: '无损', size: '~30MB/首', description: '最佳体验' },
  ];

  const equalizerPresets = [
    { value: 'normal', label: '正常' },
    { value: 'pop', label: '流行' },
    { value: 'rock', label: '摇滚' },
    { value: 'classical', label: '古典' },
    { value: 'jazz', label: '爵士' },
    { value: 'electronic', label: '电子' },
    { value: 'custom', label: '自定义' },
  ];

  const sleepTimerOptions = [
    { value: null, label: '关闭' },
    { value: 15, label: '15分钟' },
    { value: 30, label: '30分钟' },
    { value: 45, label: '45分钟' },
    { value: 60, label: '1小时' },
    { value: 90, label: '1.5小时' },
  ];

  function renderSettingItem({
    icon,
    iconColor,
    title,
    subtitle,
    rightComponent,
    showArrow = true,
    onPress,
  }: {
    icon: string;
    iconColor: string;
    title: string;
    subtitle?: string;
    rightComponent?: React.ReactNode;
    showArrow?: boolean;
    onPress?: () => void;
  }) {
    return (
      <TouchableOpacity
        style={[styles.settingItem, !onPress && styles.settingItemNoPress]}
        onPress={onPress}
        disabled={!onPress}
        activeOpacity={onPress ? 0.7 : 1}
      >
        <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
          <Ionicons name={icon} size={22} color={iconColor} />
        </View>
        <View style={styles.settingInfo}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
        {rightComponent || (showArrow && <Ionicons name="chevron-forward" size={20} color="#71717a" />)}
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 音质设置 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>音质设置</Text>

          {audioQualityOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.qualityOption,
                audioQuality === option.value && styles.selectedQualityOption,
              ]}
              onPress={() => setAudioQuality(option.value)}
            >
              <View style={styles.qualityInfo}>
                <Text style={styles.qualityLabel}>{option.label}</Text>
                <Text style={styles.qualityDescription}>{option.description}</Text>
              </View>
              <View style={styles.qualityMeta}>
                <Text style={styles.qualitySize}>{option.size}</Text>
                {audioQuality === option.value && (
                  <Ionicons name="checkmark-circle" size={22} color="#6366f1" />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* 播放设置 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>播放设置</Text>

          {renderSettingItem({
            icon: 'options',
            iconColor: '#6366f1',
            title: '均衡器',
            subtitle: equalizerPresets.find((p) => p.value === equalizerPreset)?.label || '正常',
            onPress: () => {},
          })}

          {renderSettingItem({
            icon: 'git-merge',
            iconColor: '#8b5cf6',
            title: '交叉淡入淡出',
            subtitle: crossfade ? `已启用 - ${crossfadeDuration}秒` : '已禁用',
            rightComponent: (
              <Switch
                value={crossfade}
                onValueChange={setCrossfade}
                trackColor={{ false: '#27272a', true: '#6366f1' }}
                thumbColor="#ffffff"
              />
            ),
            showArrow: false,
          })}

          {crossfade && (
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>过渡时长</Text>
              <View style={styles.durationButtons}>
                {[1, 3, 5, 8, 12].map((duration) => (
                  <TouchableOpacity
                    key={duration}
                    style={[
                      styles.durationButton,
                      crossfadeDuration === duration && styles.durationButtonActive,
                    ]}
                    onPress={() => setCrossfadeDuration(duration)}
                  >
                    <Text
                      style={[
                        styles.durationButtonText,
                        crossfadeDuration === duration && styles.durationButtonTextActive,
                      ]}
                    >
                      {duration}秒
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {renderSettingItem({
            icon: 'infinite',
            iconColor: '#22c55e',
            title: '无缝播放',
            subtitle: gaplessPlayback ? '已启用' : '已禁用',
            rightComponent: (
              <Switch
                value={gaplessPlayback}
                onValueChange={setGaplessPlayback}
                trackColor={{ false: '#27272a', true: '#22c55e' }}
                thumbColor="#ffffff"
              />
            ),
            showArrow: false,
          })}

          {renderSettingItem({
            icon: 'volume-high',
            iconColor: '#f59e0b',
            title: '音量标准化',
            subtitle: normalizeVolume ? '已启用 - 平衡不同歌曲的音量' : '已禁用',
            rightComponent: (
              <Switch
                value={normalizeVolume}
                onValueChange={setNormalizeVolume}
                trackColor={{ false: '#27272a', true: '#f59e0b' }}
                thumbColor="#ffffff"
              />
            ),
            showArrow: false,
          })}

          {renderSettingItem({
            icon: 'play-circle',
            iconColor: '#ec4899',
            title: '自动播放',
            subtitle: autoPlay ? '当前列表播放完毕后自动播放推荐' : '已禁用',
            rightComponent: (
              <Switch
                value={autoPlay}
                onValueChange={setAutoPlay}
                trackColor={{ false: '#27272a', true: '#ec4899' }}
                thumbColor="#ffffff"
              />
            ),
            showArrow: false,
          })}
        </View>

        {/* 歌词设置 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>歌词显示</Text>

          {renderSettingItem({
            icon: 'text-outline',
            iconColor: '#06b6d4',
            title: '显示歌词',
            subtitle: lyricsDisplay ? '在播放时显示歌词' : '不显示歌词',
            rightComponent: (
              <Switch
                value={lyricsDisplay}
                onValueChange={setLyricsDisplay}
                trackColor={{ false: '#27272a', true: '#06b6d4' }}
                thumbColor="#ffffff"
              />
            ),
            showArrow: false,
          })}

          {renderSettingItem({
            icon: 'sync-outline',
            iconColor: '#8b5cf6',
            title: '歌词同步',
            subtitle: lyricsSync ? '歌词与音乐同步滚动' : '手动滚动',
            rightComponent: (
              <Switch
                value={lyricsSync}
                onValueChange={setLyricsSync}
                trackColor={{ false: '#27272a', true: '#8b5cf6' }}
                thumbColor="#ffffff"
              />
            ),
            showArrow: false,
          })}
        </View>

        {/* 睡眠定时器 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>睡眠定时器</Text>

          {sleepTimerOptions.map((option) => (
            <TouchableOpacity
              key={option.label}
              style={[
                styles.timerOption,
                sleepTimer === option.value && styles.selectedTimerOption,
              ]}
              onPress={() => setSleepTimer(option.value)}
            >
              <Text
                style={[
                  styles.timerLabel,
                  sleepTimer === option.value && styles.selectedTimerLabel,
                ]}
              >
                {option.label}
              </Text>
              {sleepTimer === option.value && (
                <Ionicons name="checkmark" size={20} color="#6366f1" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* 当前状态 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>当前状态</Text>

          <View style={styles.statusCard}>
            <View style={styles.statusRow}>
              <Ionicons name="musical-notes" size={20} color="#6366f1" />
              <Text style={styles.statusLabel}>当前播放模式:</Text>
              <Text style={styles.statusValue}>
                {playerStore.shuffleMode ? '随机播放' : '顺序播放'}
              </Text>
            </View>
            <View style={styles.statusRow}>
              <Ionicons name="repeat" size={20} color="#6366f1" />
              <Text style={styles.statusLabel}>循环模式:</Text>
              <Text style={styles.statusValue}>
                {playerStore.repeatMode === 'off'
                  ? '关闭循环'
                  : playerStore.repeatMode === 'all'
                  ? '全部循环'
                  : '单曲循环'}
              </Text>
            </View>
            {playerStore.currentTrack && (
              <View style={styles.statusRow}>
                <Ionicons name="play" size={20} color="#6366f1" />
                <Text style={styles.statusLabel}>正在播放:</Text>
                <Text style={[styles.statusValue, styles.currentSong]}>
                  {playerStore.currentTrack.title}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* 底部留白 */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },

  scrollView: {
    flex: 1,
  },

  // 分组样式
  section: {
    backgroundColor: '#18181b',
    marginTop: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 13,
    color: '#71717a',
    fontWeight: '600',
    textTransform: 'uppercase',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },

  // 设置项样式
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  settingItemNoPress: {
    // No additional styles needed
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
    marginLeft: 14,
  },
  settingTitle: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#71717a',
  },

  // 音质选项样式
  qualityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  selectedQualityOption: {
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
  },
  qualityInfo: {
    flex: 1,
  },
  qualityLabel: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
    marginBottom: 4,
  },
  qualityDescription: {
    fontSize: 13,
    color: '#71717a',
  },
  qualityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qualitySize: {
    fontSize: 13,
    color: '#a1a1aa',
  },

  // 滑块容器
  sliderContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  sliderLabel: {
    fontSize: 14,
    color: '#a1a1aa',
    marginBottom: 12,
  },
  durationButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  durationButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#27272a',
    borderWidth: 1,
    borderColor: '#27272a',
  },
  durationButtonActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderColor: '#6366f1',
  },
  durationButtonText: {
    fontSize: 14,
    color: '#a1a1aa',
  },
  durationButtonTextActive: {
    color: '#6366f1',
    fontWeight: '600',
  },

  // 定时器选项
  timerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  selectedTimerOption: {
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
  },
  timerLabel: {
    fontSize: 16,
    color: '#ffffff',
  },
  selectedTimerLabel: {
    color: '#6366f1',
    fontWeight: '500',
  },

  // 状态卡片
  statusCard: {
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#27272a',
    borderRadius: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusLabel: {
    fontSize: 14,
    color: '#a1a1aa',
    marginLeft: 8,
    marginRight: 4,
  },
  statusValue: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
  currentSong: {
    color: '#6366f1',
    flex: 1,
  },
});

export default PlaybackSettingsScreen;
