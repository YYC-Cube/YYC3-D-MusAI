import { usePlayerStore } from '@/stores/playerStore'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'

function MiniPlayer() {
  const { currentTrack, isPlaying, volume, progress, duration, actions } = usePlayerStore()

  if (!currentTrack) return null

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleProgressChange = (value: number[]) => {
    actions.setProgress(value[0])
  }

  const handleVolumeChange = (value: number[]) => {
    actions.setVolume(value[0] / 100)
  }

  return (
    <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-20 items-center px-4 gap-4">
        {/* 当前歌曲信息 */}
        <div className="flex items-center gap-3 min-w-0 flex-1 max-w-xs">
          {currentTrack.cover && (
            <img
              src={currentTrack.cover}
              alt={currentTrack.title}
              className="h-12 w-12 rounded-md object-cover shadow-md"
            />
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{currentTrack.title}</p>
            <p className="truncate text-xs text-muted-foreground">{currentTrack.artist}</p>
          </div>
        </div>

        {/* 播放控制 */}
        <div className="flex flex-col items-center gap-2 flex-1 max-w-lg">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => actions.previous()}
            >
              ⏮️
            </Button>
            <Button
              size="icon"
              onClick={() => actions.togglePlay()}
              className="rounded-full h-10 w-10"
            >
              {isPlaying ? '⏸️' : '▶️'}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => actions.next()}
            >
              ⏭️
            </Button>
          </div>

          {/* 进度条 */}
          <div className="flex items-center gap-2 w-full">
            <span className="text-xs text-muted-foreground w-10 text-right">
              {formatTime(progress)}
            </span>
            <Slider
              value={[progress]}
              max={duration || 100}
              step={1}
              onValueChange={handleProgressChange}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-10">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* 音量控制 */}
        <div className="flex items-center gap-2 min-w-0 flex-1 max-w-xs justify-end">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            🔊
          </Button>
          <Slider
            value={[volume * 100]}
            max={100}
            step={1}
            onValueChange={handleVolumeChange}
            className="w-24"
          />
        </div>
      </div>
    </div>
  )
}

export default MiniPlayer
