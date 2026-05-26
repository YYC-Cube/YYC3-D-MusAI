import { useState, useRef, useEffect, useCallback } from 'react'
import type { Track } from '@/types/music'
import { useResponsive } from '@/hooks/useResponsive'

function ReflectionComponent({
  track,
  index,
  currentIndex,
  getCover
}: {
  track: Track
  index: number
  currentIndex: number
  getCover?: (track: Track) => string | null
}) {
  const albumCover = getCover ? getCover(track) : null

  if (!albumCover) return null

  return (
    <div
      className="absolute top-full left-0 w-full h-full rounded-lg pointer-events-none select-none transition-all duration-500"
      style={{
        backgroundImage: `url(${albumCover})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        transform: 'scaleY(-1) translateY(0px)',
        opacity: index === currentIndex ? '0.9' : '0.75',
        maskImage: 'linear-gradient(to top, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.4) 20%, rgba(255,255,255,0.15) 40%, transparent 60%)',
        WebkitMaskImage: 'linear-gradient(to top, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.4) 20%, rgba(255,255,255,0.15) 40%, transparent 60%)',
        filter: 'blur(0.5px) brightness(0.6) contrast(1.3)'
      }}
    />
  )
}

interface CoverFlowProps {
  tracks: Track[]
  onTrackSelect: (track: Track) => void
  selectedTrack: Track | null
  getCover?: (track: Track) => string | null
  isLoading?: (trackId: string) => boolean
}

export function CoverFlow({
  tracks,
  onTrackSelect,
  selectedTrack,
  getCover,
  isLoading
}: CoverFlowProps) {
  const [currentIndex, setCurrentIndex] = useState(() => Math.floor(tracks.length / 2))
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const [velocity, setVelocity] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const { isMobile, albumSize } = useResponsive()
  const lastDragTime = useRef(Date.now())
  const animationRef = useRef<number>()

  useEffect(() => {
    if (selectedTrack) {
      const index = tracks.findIndex(t => t.id === selectedTrack.id)
      if (index !== -1) {
        setCurrentIndex(index)
      }
    }
  }, [selectedTrack, tracks])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        const newIndex = Math.max(0, currentIndex - 1)
        setCurrentIndex(newIndex)
        onTrackSelect(tracks[newIndex])
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        const newIndex = Math.min(tracks.length - 1, currentIndex + 1)
        setCurrentIndex(newIndex)
        onTrackSelect(tracks[newIndex])
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onTrackSelect(tracks[currentIndex])
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, tracks, onTrackSelect])

  const handleDragStart = useCallback((clientX: number) => {
    setIsDragging(true)
    setDragStart(clientX)
    setDragOffset(0)
    setVelocity(0)
    lastDragTime.current = Date.now()

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
  }, [])

  const handleDragMove = useCallback((clientX: number) => {
    if (!isDragging) return

    const currentTime = Date.now()
    const deltaTime = currentTime - lastDragTime.current
    const newOffset = clientX - dragStart
    const deltaOffset = newOffset - dragOffset

    setDragOffset(newOffset)
    setVelocity(deltaOffset / Math.max(deltaTime, 1))
    lastDragTime.current = currentTime
  }, [isDragging, dragStart, dragOffset])

  const handleDragEnd = useCallback(() => {
    if (!isDragging) return
    setIsDragging(false)

    const threshold = 50
    const velocityThreshold = 0.5
    const highVelocityThreshold = 2.0

    let targetIndex = currentIndex
    const dragDistance = Math.abs(dragOffset)
    const dragVelocity = Math.abs(velocity)

    if (dragDistance > threshold || dragVelocity > velocityThreshold) {
      let jumpCount = 1

      if (dragVelocity > highVelocityThreshold) {
        jumpCount = Math.min(2, Math.ceil(dragVelocity / 1.5))
      }

      if (dragDistance > threshold * 2) {
        jumpCount = Math.max(jumpCount, Math.floor(dragDistance / (threshold * 1.5)))
      }

      if (dragOffset < 0 || velocity < -velocityThreshold) {
        targetIndex = Math.min(tracks.length - 1, currentIndex + jumpCount)
      } else if (dragOffset > 0 || velocity > velocityThreshold) {
        targetIndex = Math.max(0, currentIndex - jumpCount)
      }
    }

    setCurrentIndex(targetIndex)
    onTrackSelect(tracks[targetIndex])
    setDragOffset(0)
    setVelocity(0)
  }, [isDragging, dragOffset, velocity, currentIndex, tracks, onTrackSelect])

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    handleDragStart(e.clientX)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    e.preventDefault()
    handleDragMove(e.clientX)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault()
    handleDragMove(e.touches[0].clientX)
  }

  const handleAlbumClick = (track: Track, index: number) => {
    if (!isDragging) {
      setCurrentIndex(index)
      onTrackSelect(track)
    }
  }

  const getTransform = (index: number) => {
    const baseOffset = index - currentIndex
    const offset = baseOffset + (isDragging ? dragOffset / 100 : 0)

    const SPACING = isMobile ? 120 : 160
    const ROTATION = 55

    if (Math.abs(offset) < 0.1) {
      return `translateX(0px) translateZ(300px) rotateY(0deg) scale(1.3)`
    } else if (offset < 0) {
      const distance = Math.abs(offset)
      const x = -SPACING * distance
      const z = -80 * distance
      const scale = Math.max(0.8, 1.15 - (distance * 0.04))
      return `translateX(${x}px) translateZ(${z}px) rotateY(${ROTATION}deg) scale(${scale})`
    } else {
      const distance = Math.abs(offset)
      const x = SPACING * distance
      const z = -80 * distance
      const scale = Math.max(0.8, 1.15 - (distance * 0.04))
      return `translateX(${x}px) translateZ(${z}px) rotateY(-${ROTATION}deg) scale(${scale})`
    }
  }

  const getZIndex = (index: number) => {
    const MAX_ZINDEX = 1000
    const offset = Math.abs(index - currentIndex)

    if (offset === 0) return MAX_ZINDEX
    if (offset === 1) return 100
    if (offset === 2) return 50
    if (offset === 3) return 25
    if (offset === 4) return 15
    return Math.max(1, 10 - offset)
  }

  const getOpacity = (index: number) => {
    const baseOffset = index - currentIndex
    const offset = Math.abs(baseOffset + (isDragging ? dragOffset / 100 : 0))

    if (offset < 0.1) return 1
    if (offset <= 1) return 1
    if (offset <= 2) return 1
    if (offset <= 3) return 0.95
    if (offset <= 4) return 0.9
    return Math.max(0.8, 0.9 - ((offset - 4) * 0.05))
  }

  if (tracks.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        暂无音乐
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto relative" style={{ zIndex: 300 }}>
      <div
        ref={containerRef}
        className="relative h-96 flex items-center justify-center overflow-visible select-none"
        style={{
          perspective: '1500px',
          perspectiveOrigin: 'center center',
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleDragEnd}
      >
        {tracks.map((track, index) => (
          <div
            key={track.id}
            className="absolute select-none"
            style={{
              transform: getTransform(index),
              zIndex: getZIndex(index) + 1000,
              opacity: getOpacity(index),
              transformOrigin: 'center center',
              transformStyle: 'preserve-3d',
              transition: isDragging ? 'none' : 'all 400ms cubic-bezier(0.23, 1, 0.32, 1)'
            }}
            onClick={() => handleAlbumClick(track, index)}
          >
            <div
              className="relative group select-none"
              style={{
                width: `${albumSize}px`,
                height: `${albumSize}px`,
              }}
            >
              {getCover && getCover(track) ? (
                <img
                  src={getCover(track)!}
                  alt={track.title}
                  draggable={false}
                  className="w-full h-full object-cover rounded-lg shadow-2xl border border-gray-800/30 select-none"
                  style={{
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 8px 32px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                    userSelect: 'none'
                  }}
                />
              ) : (
                <div
                  className="w-full h-full rounded-lg shadow-2xl border border-gray-800/30 select-none flex items-center justify-center bg-gradient-to-br from-gray-950 to-black"
                  style={{
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 8px 32px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                    userSelect: 'none'
                  }}
                >
                  {isLoading && isLoading(track.id) ? (
                    <div className="flex flex-col items-center gap-2 text-white/60">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
                      <span className="text-xs text-center px-2">加载中...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-white/40">
                      <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                      </svg>
                      <span className="text-xs text-center px-2">{track.artist}</span>
                    </div>
                  )}
                </div>
              )}

              <ReflectionComponent
                track={track}
                index={index}
                currentIndex={currentIndex}
                getCover={getCover}
              />

              {index === currentIndex && (
                <>
                  <div className="absolute inset-0 rounded-lg border border-white/30 shadow-2xl"></div>
                  <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-white rounded-full opacity-90 shadow-lg animate-pulse"></div>
                  <div
                    className="absolute top-0 left-1/4 right-1/4 h-1 bg-white/20 rounded-full blur-sm"
                  />
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
