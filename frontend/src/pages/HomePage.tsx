import { useState } from 'react'
import type { Track } from '@/types/music'
import { CoverFlow } from '@/components/CoverFlow/CoverFlow'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { usePlayerStore } from '@/stores/playerStore'
import { mockTracks, mockPlaylists } from '@/data/mockData'

function HomePage() {
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null)
  const { actions } = usePlayerStore()

  const handleTrackSelect = (track: Track) => {
    setSelectedTrack(track)
    actions.play(track)
  }

  const getCover = (track: Track): string | null => {
    return track.cover || null
  }

  return (
    <div className="space-y-8">
      {/* Hero Section - CoverFlow */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            发现音乐
          </h1>
          <p className="mt-2 text-muted-foreground">
            探索无限可能，让音乐点亮生活
          </p>
        </div>
        
        <CoverFlow
          tracks={mockTracks}
          onTrackSelect={handleTrackSelect}
          selectedTrack={selectedTrack}
          getCover={getCover}
        />
      </section>

      {/* Quick Actions */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="cursor-pointer transition-all hover:scale-105 hover:shadow-lg">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <span className="text-3xl mb-2">🎵</span>
            <span className="font-medium">随机播放</span>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer transition-all hover:scale-105 hover:shadow-lg">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <span className="text-3xl mb-2">❤️</span>
            <span className="font-medium">我喜欢</span>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer transition-all hover:scale-105 hover:shadow-lg">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <span className="text-3xl mb-2">📊</span>
            <span className="font-medium">排行榜</span>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer transition-all hover:scale-105 hover:shadow-lg">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <span className="text-3xl mb-2">🎤</span>
            <span className="font-medium">歌手</span>
          </CardContent>
        </Card>
      </section>

      {/* Recommended Playlists */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">推荐歌单</h2>
          <Button variant="ghost" size="sm">查看全部</Button>
        </div>
        
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {mockPlaylists.map((playlist) => (
            <Card key={playlist.id} className="overflow-hidden transition-all hover:shadow-lg">
              <div className="aspect-square bg-muted relative">
                {playlist.cover ? (
                  <img
                    src={playlist.cover}
                    alt={playlist.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">
                    🎵
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-medium truncate">{playlist.name}</h3>
                <p className="text-sm text-muted-foreground">{playlist.tracks.length} 首歌曲</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* New Releases */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">最新发布</h2>
          <Button variant="ghost" size="sm">查看全部</Button>
        </div>
        
        <div className="grid grid-cols-1 gap-2">
          {mockTracks.slice(0, 5).map((track, index) => (
            <div
              key={track.id}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer"
              onClick={() => handleTrackSelect(track)}
            >
              <span className="text-muted-foreground w-6 text-center">{index + 1}</span>
              <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
                {track.cover ? (
                  <img src={track.cover} alt={track.title} className="h-full w-full rounded object-cover" />
                ) : (
                  <span className="text-lg">🎵</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{track.title}</p>
                <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
              </div>
              <span className="text-sm text-muted-foreground">
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
