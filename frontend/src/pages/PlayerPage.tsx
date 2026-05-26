import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { usePlayerStore } from '@/stores/playerStore'
import {
  ChevronDown,
  Heart,
  ListMusic,
  Music,
  Pause,
  Play,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

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
  const [likeAnim, setLikeAnim] = useState(false)
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

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikeAnim(true)
    setTimeout(() => setLikeAnim(false), 300)
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
      <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground animate-musai-fade-in">
        <Music className="h-16 w-16 opacity-50" />
        <p className="text-lg">暂无正在播放的歌曲</p>
        <Button onClick={() => navigate('/discover')} className="rounded-xl musai-press">
          去发现音乐
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto animate-musai-fade-in">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="musai-press rounded-full">
          <ChevronDown className="h-6 w-6" />
        </Button>
        <div className="text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">正在播放</p>
        </div>
        <Button variant="ghost" size="icon" onClick={handleLike} className="musai-press rounded-full">
          <Heart className={`h-6 w-6 transition-colors ${isLiked ? 'fill-rose-500 text-rose-500' : ''} ${likeAnim ? 'animate-musai-heart-pop' : ''}`} />
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center mb-8">
        <div className={`relative w-64 h-64 sm:w-80 sm:h-80 rounded-full overflow-hidden shadow-2xl ${isPlaying ? 'animate-musai-spin-slow' : ''} ${isPlaying ? 'animate-musai-pulse-glow' : ''}`}>
          <div className="musai-cover w-full h-full !rounded-full">
            {currentTrack.cover ? (
              <img
                src={currentTrack.cover}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-muted flex items-center justify-center">
                <Music className="h-24 w-24 text-muted-foreground/50" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold truncate">{currentTrack.title}</h1>
        <p className="text-base text-muted-foreground mt-1">{currentTrack.artist}</p>
        {currentTrack.album && (
          <p className="text-sm text-muted-foreground/70 mt-0.5">{currentTrack.album}</p>
        )}
      </div>

      <div className="mb-6 px-2">
        <Slider
          value={[progress]}
          max={duration || 100}
          step={1}
          onValueChange={handleProgressChange}
          className="mb-2"
        />
        <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
          <span>{formatTime(progress)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-5 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsShuffle(!isShuffle)}
          className={`musai-press rounded-full ${isShuffle ? 'text-primary bg-primary/10' : ''}`}
        >
          <Shuffle className="h-5 w-5" />
        </Button>

        <Button variant="ghost" size="icon" onClick={handlePrevious} className="musai-press rounded-full">
          <SkipBack className="h-7 w-7" />
        </Button>

        <Button
          size="icon"
          onClick={() => actions.togglePlay()}
          className="rounded-full h-16 w-16 musai-press bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/30 hover:shadow-primary/40 transition-shadow"
        >
          {isPlaying ? (
            <Pause className="h-8 w-8" />
          ) : (
            <Play className="h-8 w-8 ml-1" />
          )}
        </Button>

        <Button variant="ghost" size="icon" onClick={handleNext} className="musai-press rounded-full">
          <SkipForward className="h-7 w-7" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setRepeatMode(repeatMode === 'none' ? 'all' : repeatMode === 'all' ? 'one' : 'none')}
          className={`musai-press rounded-full ${repeatMode !== 'none' ? 'text-primary bg-primary/10' : ''}`}
        >
          {getRepeatIcon()}
        </Button>
      </div>

      <div className="flex items-center gap-3 px-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => actions.setVolume(volume === 0 ? 0.8 : 0)}
          className="musai-press rounded-full"
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
          className={`musai-press rounded-full ${showQueue ? 'text-primary bg-primary/10' : ''}`}
        >
          <ListMusic className="h-5 w-5" />
        </Button>
      </div>

      {showQueue && (
        <div className="mt-4 border rounded-xl p-4 max-h-48 overflow-y-auto animate-musai-fade-in">
          <h3 className="text-sm font-semibold mb-3">播放队列 ({queue.length})</h3>
          <div className="space-y-1">
            {queue.map((track, index) => (
              <div
                key={track.id}
                className={`musai-press flex items-center gap-3 p-2 rounded-lg cursor-pointer text-sm transition-colors ${index === currentIndex ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                  }`}
                onClick={() => actions.play(track)}
              >
                <span className="w-5 text-xs text-muted-foreground">{index + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium">{track.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{track.artist}</p>
                </div>
                {index === currentIndex && isPlaying && (
                  <div className="flex items-end gap-[2px] h-4">
                    <div className="musai-eq-bar w-[3px] bg-primary rounded-full" />
                    <div className="musai-eq-bar w-[3px] bg-primary rounded-full" />
                    <div className="musai-eq-bar w-[3px] bg-primary rounded-full" />
                    <div className="musai-eq-bar w-[3px] bg-primary rounded-full" />
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
