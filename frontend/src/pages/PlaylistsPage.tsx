import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { mockPlaylists, mockTracks } from '@/data/mockData'
import { usePlayerStore } from '@/stores/playerStore'
import type { Playlist } from '@/types/music'
import {
  Clock,
  Music,
  Play,
  Plus,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'

function PlaylistsPage() {
  const { actions } = usePlayerStore()
  const [playlists, setPlaylists] = useState<Playlist[]>(mockPlaylists)
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('')

  const handleCreatePlaylist = () => {
    if (!newPlaylistName.trim()) return
    const newPlaylist: Playlist = {
      id: `playlist-${Date.now()}`,
      name: newPlaylistName,
      description: newPlaylistDesc,
      tracks: [],
      createdAt: new Date(),
    }
    setPlaylists([...playlists, newPlaylist])
    setNewPlaylistName('')
    setNewPlaylistDesc('')
    setIsCreating(false)
  }

  const handleDeletePlaylist = (id: string) => {
    setPlaylists(playlists.filter((p) => p.id !== id))
    if (selectedPlaylist?.id === id) {
      setSelectedPlaylist(null)
    }
  }

  const handlePlayPlaylist = (playlist: Playlist) => {
    if (playlist.tracks.length > 0) {
      actions.setQueue(playlist.tracks)
      actions.play(playlist.tracks[0])
    }
  }

  const handleRemoveTrack = (playlistId: string, trackId: string) => {
    setPlaylists(
      playlists.map((p) =>
        p.id === playlistId
          ? { ...p, tracks: p.tracks.filter((t) => t.id !== trackId) }
          : p
      )
    )
    if (selectedPlaylist?.id === playlistId) {
      setSelectedPlaylist({
        ...selectedPlaylist,
        tracks: selectedPlaylist.tracks.filter((t) => t.id !== trackId),
      })
    }
  }

  const handleAddRandomTracks = (playlistId: string) => {
    const randomTracks = mockTracks
      .sort(() => Math.random() - 0.5)
      .slice(0, 5)
    setPlaylists(
      playlists.map((p) =>
        p.id === playlistId
          ? { ...p, tracks: [...p.tracks, ...randomTracks] }
          : p
      )
    )
    if (selectedPlaylist?.id === playlistId) {
      setSelectedPlaylist({
        ...selectedPlaylist,
        tracks: [...selectedPlaylist.tracks, ...randomTracks],
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">我的歌单</h1>
          <p className="text-muted-foreground mt-1">
            管理你的音乐收藏，共 {playlists.length} 个歌单
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          新建歌单
        </Button>
      </div>

      {/* Create Playlist Form */}
      {isCreating && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <h3 className="font-medium">新建歌单</h3>
            <Input
              placeholder="歌单名称"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
            />
            <Input
              placeholder="歌单描述（可选）"
              value={newPlaylistDesc}
              onChange={(e) => setNewPlaylistDesc(e.target.value)}
            />
            <div className="flex gap-2">
              <Button onClick={handleCreatePlaylist}>创建</Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                取消
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Playlist Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {playlists.map((playlist) => (
          <Card
            key={playlist.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${selectedPlaylist?.id === playlist.id ? 'ring-2 ring-primary' : ''
              }`}
            onClick={() => setSelectedPlaylist(playlist)}
          >
            <div className="aspect-square bg-muted relative group">
              {playlist.cover ? (
                <img
                  src={playlist.cover}
                  alt={playlist.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music className="h-16 w-16 text-muted-foreground opacity-50" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePlayPlaylist(playlist)
                  }}
                >
                  <Play className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="font-medium truncate">{playlist.name}</h3>
              <p className="text-sm text-muted-foreground">
                {playlist.tracks.length} 首歌曲
              </p>
              {playlist.description && (
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {playlist.description}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Playlist Detail */}
      {selectedPlaylist && (
        <div className="space-y-4 border-t pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{selectedPlaylist.name}</h2>
              <p className="text-muted-foreground">
                {selectedPlaylist.description || '暂无描述'} ·{' '}
                {selectedPlaylist.tracks.length} 首歌曲
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleAddRandomTracks(selectedPlaylist.id)}
              >
                <Plus className="h-4 w-4 mr-2" />
                添加歌曲
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDeletePlaylist(selectedPlaylist.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                删除
              </Button>
            </div>
          </div>

          {selectedPlaylist.tracks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Music className="h-12 w-12 mb-4 opacity-50" />
              <p>歌单为空</p>
              <Button
                variant="link"
                onClick={() => handleAddRandomTracks(selectedPlaylist.id)}
              >
                添加一些歌曲
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {selectedPlaylist.tracks.map((track, index) => (
                <div
                  key={track.id}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer group"
                  onClick={() => {
                    actions.setQueue(selectedPlaylist.tracks)
                    actions.play(track)
                  }}
                >
                  <span className="text-muted-foreground w-6 text-center text-sm">
                    {index + 1}
                  </span>
                  <div className="relative w-10 h-10 rounded overflow-hidden bg-muted flex-shrink-0">
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
                      {track.artist}
                    </p>
                  </div>
                  {track.duration && (
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {Math.floor(track.duration / 60)}:
                      {String(track.duration % 60).padStart(2, '0')}
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveTrack(selectedPlaylist.id, track.id)
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default PlaylistsPage
