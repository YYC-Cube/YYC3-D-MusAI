import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlayerStore } from '@/stores/playerStore'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
  ListMusic,
  Heart,
  ChevronDown,
} from 'lucide-react'

function PlayerPage() {
  const navigate = useNavigate()
  const {
    currentTrack,
    isPlaying,
    volume,
    progress,
    duration,
    queue,
    currentIndex,
    actions,
  } = usePlayerStore()

  const [isShuffle, setIsShuffle] = useState(false)
  const [repeatMode, setRepeatMode] = useState<'none' | 'all' | 'one'>('none')
  const [showQueue, setShowQueue] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (isPlaying && duration > 0) {
      progressInterval.current = setInterval(() => {
        const { progress, duration, isPlaying } = usePlayerStore.getState()
        if (!isPlaying) return
        if (progress >= duration) {
          handleNext()
        } else {
          actions.setProgress(progress + 1)
        }
      }, 1000)
    } else {
      if (progressInterval.current) {
        clearInterval(progressInterval.current)
      }
    }
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, duration])

  const handleNext = () => {
    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * queue.length)
      actions.play(queue[randomIndex])
    } else {
      actions.next()
    }
  }

  const handlePrevious = () => {
    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * queue.length)
      actions.play(queue[randomIndex])
    } else {
      actions.previous()
    }
  }

  const handleProgressChange = (value: number[]) => {
    actions.setProgress(value[0])
  }

  const handleVolumeChange = (value: number[]) => {
    actions.setVolume(value[0] / 100)
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getRepeatIcon = () => {
    if (repeatMode === 'one') return <span className="relative"><Repeat className="h-5 w-5" /><span className="absolute -top-1 -right-1 text-[10px] font-bold">1</span></span>
    return <Repeat className={`h-5 w-5 ${repeatMode === 'all' ? 'text-primary' : ''}`} />
  }

  if (!currentTrack) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
        <ListMusic className="h-16 w-16 opacity-50" />
        <p className="text-lg">暂无正在播放的歌曲</p>
        <Button onClick={() => navigate('/discover')}>去发现音乐</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ChevronDown className="h-6 w-6" />
        </Button>
        <div className="text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">正在播放</p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsLiked(!isLiked)}>
          <Heart className={`h-6 w-6 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
        </Button>
      </div>

      {/* Cover Art */}
      <div className="flex-1 flex items-center justify-center mb-8">
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-2xl overflow-hidden shadow-2xl">
          {currentTrack.cover ? (
            <img
              src={currentTrack.cover}
              alt={currentTrack.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <ListMusic className="h-24 w-24 text-muted-foreground" />
            </div>
          )}
        </div>
      </div>

      {/* Track Info */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold truncate">{currentTrack.title}</h1>
        <p className="text-lg text-muted-foreground mt-1">{currentTrack.artist}</p>
        {currentTrack.album && (
          <p className="text-sm text-muted-foreground mt-0.5">{currentTrack.album}</p>
        )}
      </div>

      {/* Progress */}
      <div className="mb-6">
        <Slider
          value={[progress]}
          max={duration || 100}
          step={1}
          onValueChange={handleProgressChange}
          className="mb-2"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatTime(progress)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsShuffle(!isShuffle)}
          className={isShuffle ? 'text-primary' : ''}
        >
          <Shuffle className="h-5 w-5" />
        </Button>

        <Button variant="ghost" size="icon" onClick={handlePrevious}>
          <SkipBack className="h-7 w-7" />
        </Button>

        <Button
          size="icon"
          onClick={() => actions.togglePlay()}
          className="rounded-full h-16 w-16"
        >
          {isPlaying ? (
            <Pause className="h-8 w-8" />
          ) : (
            <Play className="h-8 w-8 ml-1" />
          )}
        </Button>

        <Button variant="ghost" size="icon" onClick={handleNext}>
          <SkipForward className="h-7 w-7" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setRepeatMode(repeatMode === 'none' ? 'all' : repeatMode === 'all' ? 'one' : 'none')}
        >
          {getRepeatIcon()}
        </Button>
      </div>

      {/* Volume & Queue */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => actions.setVolume(volume === 0 ? 0.8 : 0)}
        >
          {volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </Button>
        <Slider
          value={[volume * 100]}
          max={100}
          step={1}
          onValueChange={handleVolumeChange}
          className="flex-1"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowQueue(!showQueue)}
          className={showQueue ? 'text-primary' : ''}
        >
          <ListMusic className="h-5 w-5" />
        </Button>
      </div>

      {/* Queue Panel */}
      {showQueue && (
        <div className="mt-4 border rounded-lg p-4 max-h-48 overflow-y-auto">
          <h3 className="text-sm font-medium mb-2">播放队列 ({queue.length})</h3>
          <div className="space-y-1">
            {queue.map((track, index) => (
              <div
                key={track.id}
                className={`flex items-center gap-2 p-2 rounded cursor-pointer text-sm ${
                  index === currentIndex ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                }`}
                onClick={() => actions.play(track)}
              >
                <span className="w-5 text-xs text-muted-foreground">{index + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium">{track.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{track.artist}</p>
                </div>
                {index === currentIndex && isPlaying && (
                  <div className="flex gap-0.5">
                    <div className="w-1 h-3 bg-primary animate-pulse" />
                    <div className="w-1 h-4 bg-primary animate-pulse delay-75" />
                    <div className="w-1 h-2 bg-primary animate-pulse delay-150" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default PlayerPage
