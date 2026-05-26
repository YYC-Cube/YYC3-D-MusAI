import { TiltCover } from '@/components/effects/AuroraBackground'
import { Slider } from '@/components/ui/slider'
import { usePlayerStore } from '@/stores/playerStore'

function MiniPlayer() {
  const { currentTrack, isPlaying, volume, progress, duration, actions } = usePlayerStore()

  if (!currentTrack) return null

  const fmt = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  const pct = duration > 0 ? Math.min((progress / duration) * 100, 100) : 0

  return (
    <div
      className="border-t backdrop-blur-md relative"
      style={{
        background: 'rgba(9,9,11,0.92)',
        borderColor: 'rgba(124,58,237,0.15)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div
        className="absolute top-0 left-0 h-full pointer-events-none"
        style={{
          width: `${pct}%`,
          background: 'linear-gradient(90deg, rgba(124,58,237,0.08), rgba(124,58,237,0.02))',
          transition: 'width 0.5s linear',
        }}
      />

      <div className="flex h-16 sm:h-[72px] items-center px-3 sm:px-4 gap-3 sm:gap-4 relative">
        <div className="flex items-center gap-3 min-w-0 flex-1 max-w-xs">
          {currentTrack.cover && (
            <TiltCover
              src={currentTrack.cover}
              alt={currentTrack.title}
              isPlaying={isPlaying}
              size={40}
            />
          )}
          <div className="min-w-0">
            <p
              className="truncate text-xs sm:text-sm font-medium font-mono"
              style={{ color: '#c4b5fd', textShadow: isPlaying ? '0 0 6px rgba(124,58,237,0.3)' : 'none' }}
            >
              {currentTrack.title}
            </p>
            <p className="truncate text-[10px] sm:text-xs font-mono" style={{ color: 'rgba(167,139,250,0.4)' }}>
              {currentTrack.artist}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1.5 flex-1 max-w-lg">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => actions.previous()}
              className="text-xs sm:text-sm font-mono transition-colors"
              style={{ color: 'rgba(167,139,250,0.5)' }}
            >
              ◁◁
            </button>
            <button
              onClick={() => actions.togglePlay()}
              className="flex items-center justify-center rounded-full transition-all"
              style={{
                width: 32,
                height: 32,
                background: isPlaying
                  ? 'linear-gradient(135deg, #7c3aed, #6d28d9)'
                  : 'rgba(124,58,237,0.2)',
                boxShadow: isPlaying ? '0 0 16px rgba(124,58,237,0.4)' : 'none',
                color: '#e9d5ff',
                fontSize: 12,
                fontFamily: 'monospace',
              }}
            >
              {isPlaying ? '❚❚' : '▶'}
            </button>
            <button
              onClick={() => actions.next()}
              className="text-xs sm:text-sm font-mono transition-colors"
              style={{ color: 'rgba(167,139,250,0.5)' }}
            >
              ▷▷
            </button>
          </div>

          <div className="flex items-center gap-2 w-full">
            <span className="text-[10px] sm:text-xs font-mono w-8 sm:w-9 text-right" style={{ color: 'rgba(167,139,250,0.35)' }}>
              {fmt(progress)}
            </span>
            <Slider
              value={[progress]}
              max={duration || 100}
              step={1}
              onValueChange={(v) => actions.setProgress(v[0])}
              className="flex-1"
            />
            <span className="text-[10px] sm:text-xs font-mono w-8 sm:w-9" style={{ color: 'rgba(167,139,250,0.35)' }}>
              {fmt(duration)}
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 min-w-0 flex-1 max-w-xs justify-end">
          <span className="text-xs font-mono" style={{ color: 'rgba(167,139,250,0.35)' }}>
            VOL
          </span>
          <Slider
            value={[volume * 100]}
            max={100}
            step={1}
            onValueChange={(v) => actions.setVolume(v[0] / 100)}
            className="w-20"
          />
          <span className="text-xs font-mono w-7 text-right" style={{ color: 'rgba(167,139,250,0.35)' }}>
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>

      <div
        className="h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.2), transparent)',
        }}
      />
    </div>
  )
}

export default MiniPlayer
