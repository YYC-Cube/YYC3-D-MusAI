import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { mockPlaylists, mockTracks } from '@/data/mockData'
import { usePlayerStore } from '@/stores/playerStore'
import type { Track } from '@/types/music'
import { Clock, Disc3, Mic2, Music, Search, TrendingUp } from 'lucide-react'
import { useMemo, useState } from 'react'

const GENRES = ['全部', '流行', '摇滚', '电子', '民谣', 'R&B', '嘻哈', '爵士', '古典']
const SORT_OPTIONS = [
  { key: 'default', label: '默认' },
  { key: 'popular', label: '最热' },
  { key: 'newest', label: '最新' },
]

function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('全部')
  const [sortBy, setSortBy] = useState('default')
  const { actions } = usePlayerStore()

  const filteredTracks = useMemo(() => {
    let result = [...mockTracks]

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.artist.toLowerCase().includes(q) ||
          t.album?.toLowerCase().includes(q)
      )
    }

    if (selectedGenre !== '全部') {
      result = result.filter((t) => t.genre === selectedGenre)
    }

    if (sortBy === 'popular') {
      result.sort((a, b) => (b.playCount || 0) - (a.playCount || 0))
    } else if (sortBy === 'newest') {
      result.sort((a, b) => (b.year || 0) - (a.year || 0))
    }

    return result
  }, [searchQuery, selectedGenre, sortBy])

  const handlePlay = (track: Track) => {
    actions.setQueue(filteredTracks)
    actions.play(track)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold tracking-tight">发现音乐</h1>
        <p className="text-muted-foreground">探索无限可能，找到属于你的旋律</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索歌曲、歌手、专辑..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {GENRES.map((genre) => (
            <Button
              key={genre}
              variant={selectedGenre === genre ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedGenre(genre)}
            >
              {genre}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">排序：</span>
          {SORT_OPTIONS.map((opt) => (
            <Button
              key={opt.key}
              variant={sortBy === opt.key ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setSortBy(opt.key)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Music className="h-5 w-5 text-primary" />
            <div>
              <p className="text-2xl font-bold">{mockTracks.length}</p>
              <p className="text-xs text-muted-foreground">歌曲总数</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Disc3 className="h-5 w-5 text-primary" />
            <div>
              <p className="text-2xl font-bold">{mockPlaylists.length}</p>
              <p className="text-xs text-muted-foreground">精选歌单</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Mic2 className="h-5 w-5 text-primary" />
            <div>
              <p className="text-2xl font-bold">
                {new Set(mockTracks.map((t) => t.artist)).size}
              </p>
              <p className="text-xs text-muted-foreground">入驻艺人</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <div>
              <p className="text-2xl font-bold">128K</p>
              <p className="text-xs text-muted-foreground">今日播放</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Track List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">歌曲列表</h2>
          <span className="text-sm text-muted-foreground">
            共 {filteredTracks.length} 首
          </span>
        </div>

        {filteredTracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Search className="h-12 w-12 mb-4 opacity-50" />
            <p>没有找到匹配的歌曲</p>
            <Button
              variant="link"
              onClick={() => {
                setSearchQuery('')
                setSelectedGenre('全部')
              }}
            >
              清除筛选条件
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTracks.map((track, index) => (
              <div
                key={track.id}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer group"
                onClick={() => handlePlay(track)}
              >
                <span className="text-muted-foreground w-6 text-center text-sm">
                  {index + 1}
                </span>
                <div className="relative w-12 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                  {track.cover ? (
                    <img
                      src={track.cover}
                      alt={track.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Music className="w-full h-full p-2 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{track.title}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {track.artist} · {track.album}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {track.duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {Math.floor(track.duration / 60)}:
                      {String(track.duration % 60).padStart(2, '0')}
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation()
                      actions.addToQueue(track)
                    }}
                  >
                    添加到队列
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default DiscoverPage
