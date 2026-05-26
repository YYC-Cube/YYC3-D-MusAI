import { CoverFlow } from '@/components/CoverFlow/CoverFlow'
import { TiltCover } from '@/components/effects/AuroraBackground'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { mockPlaylists, mockTracks } from '@/data/mockData'
import { usePlayerStore } from '@/stores/playerStore'
import type { Track } from '@/types/music'
import { Heart, Mic2, Music, Play, Shuffle, TrendingUp } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'

function HomePage() {
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const { actions } = usePlayerStore()
  const galleryRef = useRef<HTMLDivElement>(null)

  const handleTrackSelect = (track: Track) => {
    setSelectedTrack(track)
    setPlayingId(track.id)
    actions.setQueue(mockTracks)
    actions.play(track)
  }

  const getCover = (track: Track): string | null => track.cover || null

  const handleGalleryMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = galleryRef.current
    if (!el) return
    const children = el.querySelectorAll<HTMLElement>('[data-gallery-item]')
    const rect = el.getBoundingClientRect()
    const mx = e.clientX - rect.left
    children.forEach((child) => {
      const cr = child.getBoundingClientRect()
      const cx = cr.left + cr.width / 2 - rect.left
      const dist = Math.abs(mx - cx)
      const maxDist = 200
      const scale = Math.max(1 - dist / maxDist * 0.15, 0.85)
      const brightness = Math.max(1 - dist / maxDist * 0.3, 0.7)
      const y = Math.max((1 - dist / maxDist) * 8, 0)
      child.style.transform = `scale(${scale}) translateY(-${y}px)`
      child.style.filter = `brightness(${brightness})`
      child.style.zIndex = dist < 80 ? '10' : '1'
    })
  }, [])

  const handleGalleryLeave = useCallback(() => {
    const el = galleryRef.current
    if (!el) return
    el.querySelectorAll<HTMLElement>('[data-gallery-item]').forEach((child) => {
      child.style.transform = 'scale(1) translateY(0)'
      child.style.filter = 'brightness(1)'
      child.style.zIndex = '1'
    })
  }, [])

  const quickActions = [
    { icon: Shuffle, label: '随机播放', color: 'rgba(124,58,237,0.15)', glow: 'rgba(124,58,237,0.3)' },
    { icon: Heart, label: '我喜欢', color: 'rgba(236,72,153,0.15)', glow: 'rgba(236,72,153,0.3)' },
    { icon: TrendingUp, label: '排行榜', color: 'rgba(245,158,11,0.15)', glow: 'rgba(245,158,11,0.3)' },
    { icon: Mic2, label: '歌手', color: 'rgba(16,185,129,0.15)', glow: 'rgba(16,185,129,0.3)' },
  ]

  return (
    <div className="space-y-10 pb-4">
      <section
        className="relative overflow-hidden rounded-2xl p-6 sm:p-8"
        style={{
          background: 'linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(9,9,11,0.6) 50%, rgba(124,58,237,0.05) 100%)',
          border: '1px solid rgba(124,58,237,0.1)',
          boxShadow: '0 0 40px rgba(124,58,237,0.05), inset 0 1px 0 rgba(124,58,237,0.1)',
        }}
      >
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-xs" style={{ color: 'rgba(167,139,250,0.4)' }}>{'>'} INIT</span>
            <div
              className="h-px flex-1"
              style={{ background: 'linear-gradient(90deg, rgba(124,58,237,0.2), transparent)' }}
            />
          </div>
          <h1
            className="text-3xl font-bold tracking-tight sm:text-4xl font-mono"
            style={{ color: '#c4b5fd', textShadow: '0 0 20px rgba(124,58,237,0.2)' }}
          >
            发现音乐
          </h1>
          <p className="mt-2 text-base font-mono" style={{ color: 'rgba(167,139,250,0.4)' }}>
            探索无限可能，让音乐点亮生活 ♪
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
            className="musai-press overflow-hidden cursor-pointer transition-all"
            style={{
              background: action.color,
              border: `1px solid ${action.glow.replace('0.3', '0.1')}`,
              animationDelay: `${i * 80}ms`,
            }}
          >
            <CardContent className="flex flex-col items-center justify-center p-5 relative">
              <action.icon className="h-6 w-6 mb-2 relative z-10" style={{ color: '#a78bfa' }} />
              <span className="font-medium text-sm font-mono relative z-10" style={{ color: '#c4b5fd' }}>
                {action.label}
              </span>
            </CardContent>
          </Card>
        ))}
      </section>

      <section>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight font-mono" style={{ color: '#c4b5fd' }}>
              推荐歌单
            </h2>
            <span className="font-mono text-xs" style={{ color: 'rgba(167,139,250,0.3)' }}>
              [{mockPlaylists.length}]
            </span>
          </div>
          <Button variant="ghost" size="sm" className="font-mono text-xs" style={{ color: 'rgba(167,139,250,0.4)' }}>
            查看全部 →
          </Button>
        </div>

        <div
          ref={galleryRef}
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6"
          onMouseMove={handleGalleryMove}
          onMouseLeave={handleGalleryLeave}
        >
          {mockPlaylists.map((playlist) => (
            <div
              key={playlist.id}
              data-gallery-item
              className="rounded-xl overflow-hidden cursor-pointer transition-transform duration-200"
              style={{
                background: 'rgba(15,10,25,0.6)',
                border: '1px solid rgba(124,58,237,0.08)',
                transition: 'transform 0.25s ease-out, filter 0.25s ease-out',
              }}
            >
              <div className="aspect-square relative group">
                {playlist.cover ? (
                  <img
                    src={playlist.cover}
                    alt={playlist.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ background: 'rgba(124,58,237,0.1)' }}>
                    <Music className="h-8 w-8" style={{ color: 'rgba(124,58,237,0.3)' }} />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <div
                      className="h-10 w-10 rounded-full flex items-center justify-center"
                      style={{
                        background: 'rgba(124,58,237,0.9)',
                        boxShadow: '0 0 16px rgba(124,58,237,0.5)',
                      }}
                    >
                      <Play className="h-5 w-5 text-white ml-0.5" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-sm truncate font-mono" style={{ color: '#c4b5fd' }}>
                  {playlist.name}
                </h3>
                <p className="text-xs mt-0.5 truncate font-mono" style={{ color: 'rgba(167,139,250,0.35)' }}>
                  {playlist.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight font-mono" style={{ color: '#c4b5fd' }}>
              最新发布
            </h2>
            <span className="font-mono text-xs" style={{ color: 'rgba(167,139,250,0.3)' }}>
              [TOP 5]
            </span>
          </div>
          <Button variant="ghost" size="sm" className="font-mono text-xs" style={{ color: 'rgba(167,139,250,0.4)' }}>
            查看全部 →
          </Button>
        </div>

        <div className="space-y-1">
          {mockTracks.slice(0, 5).map((track, index) => {
            const isActive = playingId === track.id
            return (
              <div
                key={track.id}
                className="flex items-center gap-4 p-3 rounded-xl transition-all cursor-pointer group"
                style={{
                  background: isActive ? 'rgba(124,58,237,0.12)' : 'transparent',
                  borderLeft: isActive ? '2px solid #7c3aed' : '2px solid transparent',
                }}
                onMouseEnter={() => setHoveredId(track.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => handleTrackSelect(track)}
              >
                <span
                  className="w-6 text-center text-sm font-mono font-medium"
                  style={{ color: isActive ? '#7c3aed' : 'rgba(167,139,250,0.3)' }}
                >
                  {isActive ? (
                    <div className="flex items-center justify-center gap-0.5 h-4">
                      {[1, 2, 3, 4].map((b) => (
                        <div
                          key={b}
                          className="rounded-full"
                          style={{
                            width: 2,
                            height: `${8 + Math.random() * 8}px`,
                            background: '#7c3aed',
                            animation: `musai-bar-bounce ${0.4 + b * 0.1}s ease-in-out infinite alternate`,
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    `0${index + 1}`
                  )}
                </span>

                <TiltCover
                  src={track.cover || ''}
                  alt={track.title}
                  isPlaying={isActive}
                  size={48}
                />

                <div className="flex-1 min-w-0">
                  <p
                    className="font-medium truncate text-sm font-mono"
                    style={{
                      color: isActive ? '#c084fc' : hoveredId === track.id ? '#c4b5fd' : '#a78bfa',
                      textShadow: isActive ? '0 0 8px rgba(124,58,237,0.3)' : 'none',
                    }}
                  >
                    {track.title}
                  </p>
                  <p className="text-xs truncate mt-0.5 font-mono" style={{ color: 'rgba(167,139,250,0.35)' }}>
                    {track.artist}
                  </p>
                </div>

                <span
                  className="text-xs font-mono tabular-nums"
                  style={{ color: 'rgba(167,139,250,0.3)' }}
                >
                  {track.duration !== undefined
                    ? `${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, '0')}`
                    : '--:--'}
                </span>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}

export default HomePage
