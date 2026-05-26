import { CoverFlow } from '@/components/CoverFlow/CoverFlow'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { mockPlaylists, mockTracks } from '@/data/mockData'
import { usePlayerStore } from '@/stores/playerStore'
import type { Track } from '@/types/music'
import { Heart, Mic2, Music, Play, Shuffle, TrendingUp } from 'lucide-react'
import { useState } from 'react'

function HomePage() {
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const { actions } = usePlayerStore()

  const handleTrackSelect = (track: Track) => {
    setSelectedTrack(track)
    setPlayingId(track.id)
    actions.play(track)
  }

  const getCover = (track: Track): string | null => {
    return track.cover || null
  }

  const quickActions = [
    { icon: Shuffle, label: '随机播放', color: 'from-purple-500 to-indigo-600' },
    { icon: Heart, label: '我喜欢', color: 'from-rose-500 to-pink-600' },
    { icon: TrendingUp, label: '排行榜', color: 'from-amber-500 to-orange-600' },
    { icon: Mic2, label: '歌手', color: 'from-emerald-500 to-teal-600' },
  ]

  return (
    <div className="space-y-10 pb-4">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 sm:p-8">
        <div className="mb-6 animate-musai-fade-in">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            发现音乐
          </h1>
          <p className="mt-2 text-muted-foreground text-base">
            探索无限可能，让音乐点亮生活 🎵
          </p>
        </div>
        <CoverFlow
          tracks={mockTracks}
          onTrackSelect={handleTrackSelect}
          selectedTrack={selectedTrack}
          getCover={getCover}
        />
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {quickActions.map((action, i) => (
          <Card
            key={action.label}
            className={`musai-press musai-card-interactive musai-glass overflow-hidden animate-musai-slide-up stagger-${i + 1}`}
          >
            <CardContent className="flex flex-col items-center justify-center p-5 relative">
              <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-10 rounded-inherit`} />
              <action.icon className="h-6 w-6 mb-2 text-primary musai-icon-glow relative z-10" />
              <span className="font-medium text-sm relative z-10">{action.label}</span>
            </CardContent>
          </Card>
        ))}
      </section>

      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-bold tracking-tight">推荐歌单</h2>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            查看全部
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {mockPlaylists.map((playlist, i) => (
            <Card
              key={playlist.id}
              className={`musai-card-interactive overflow-hidden bg-card shadow-sm animate-musai-slide-up stagger-${i + 1}`}
            >
              <div className="musai-cover aspect-square relative group">
                {playlist.cover ? (
                  <img
                    src={playlist.cover}
                    alt={playlist.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <Music className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center shadow-lg">
                      <Play className="h-5 w-5 text-white ml-0.5" />
                    </div>
                  </div>
                </div>
              </div>
              <CardContent className="p-3">
                <h3 className="font-semibold text-sm truncate">{playlist.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{playlist.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-bold tracking-tight">最新发布</h2>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            查看全部
          </Button>
        </div>
        <div className="space-y-1">
          {mockTracks.slice(0, 5).map((track, index) => (
            <div
              key={track.id}
              className={`musai-press flex items-center gap-4 p-3 rounded-xl transition-colors cursor-pointer group ${playingId === track.id
                ? 'bg-primary/10'
                : 'hover:bg-muted/60'
                }`}
              onClick={() => handleTrackSelect(track)}
            >
              <span className={`w-6 text-center text-sm font-medium ${playingId === track.id ? 'text-primary' : 'text-muted-foreground'
                }`}>
                {playingId === track.id ? (
                  <div className="musai-playing-indicator">
                    <div className="musai-playing-bar" />
                    <div className="musai-playing-bar" />
                    <div className="musai-playing-bar" />
                    <div className="musai-playing-bar" />
                  </div>
                ) : (
                  index + 1
                )}
              </span>
              <div className="musai-cover h-12 w-12 flex-shrink-0">
                {track.cover ? (
                  <img src={track.cover} alt={track.title} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Music className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-medium truncate text-sm ${playingId === track.id ? 'text-primary' : ''}`}>
                  {track.title}
                </p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{track.artist}</p>
              </div>
              <span className="text-xs text-muted-foreground tabular-nums">
                {track.duration !== undefined
                  ? `${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, '0')}`
                  : '--:--'}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default HomePage
