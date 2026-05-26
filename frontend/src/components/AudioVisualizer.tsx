import { usePlayerStore } from '@/stores/playerStore'
import { useCallback, useEffect, useRef } from 'react'

type VisualizerType = 'bars' | 'wave' | 'circle'

interface AudioVisualizerProps {
  type?: VisualizerType
  height?: number
  showControls?: boolean
}

export default function AudioVisualizer({
  type = 'bars',
  height = 200,
  showControls = true,
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const dataArrayRef = useRef<Uint8Array | null>(null)

  const { currentTrack, isPlaying } = usePlayerStore()

  const initAudioAnalyser = useCallback(async () => {
    try {
      const audio = document.querySelector('audio') as HTMLAudioElement

      if (!audio || !canvasRef.current) return

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext()
      }

      const audioContext = audioContextRef.current

      if (!analyserRef.current) {
        analyserRef.current = audioContext.createAnalyser()
        analyserRef.current.fftSize = 256
        analyserRef.current.smoothingTimeConstant = 0.8
        analyserRef.current.connect(audioContext.destination)
      }

      const analyser = analyserRef.current

      if (sourceRef.current) {
        try { sourceRef.current.disconnect() } catch {}
        sourceRef.current = null
      }
      sourceRef.current = audioContext.createMediaElementSource(audio)
      sourceRef.current.connect(analyser)

      const bufferLength = analyser.frequencyBinCount
      dataArrayRef.current = new Uint8Array(bufferLength)

    } catch (error) {
      console.error('AudioVisualizer init error:', error)
    }
  }, [])

  const drawBars = useCallback((
    ctx: CanvasRenderingContext2D,
    width: number,
    h: number,
    dataArray: Uint8Array
  ) => {
    const barWidth = (width / dataArray.length) * 1.5
    let x = 0

    for (let i = 0; i < dataArray.length; i++) {
      const barHeight = (dataArray[i] / 255) * h * 0.85

      // 渐变颜色
      const gradient = ctx.createLinearGradient(0, h - barHeight, 0, h)
      gradient.addColorStop(0, '#6366f1')
      gradient.addColorStop(0.5, '#8b5cf6')
      gradient.addColorStop(1, '#a855f7')

      ctx.fillStyle = gradient
      ctx.fillRect(x, h - barHeight, barWidth - 1, barHeight)

      x += barWidth + 1
    }
  }, [])

  const drawWave = useCallback((
    ctx: CanvasRenderingContext2D,
    width: number,
    h: number,
    dataArray: Uint8Array
  ) => {
    ctx.lineWidth = 3
    ctx.strokeStyle = '#6366f1'
    ctx.shadowBlur = 10
    ctx.shadowColor = '#6366f1'

    ctx.beginPath()

    const sliceWidth = width / dataArray.length
    let x = 0

    for (let i = 0; i < dataArray.length; i++) {
      const v = dataArray[i] / 255.0
      const y = v * h

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }

      x += sliceWidth
    }

    ctx.lineTo(width, h / 2)
    ctx.stroke()
    ctx.closePath()
  }, [])

  const drawCircle = useCallback((
    ctx: CanvasRenderingContext2D,
    width: number,
    h: number,
    dataArray: Uint8Array
  ) => {
    const centerX = width / 2
    const centerY = h / 2
    const radius = Math.min(width, h) * 0.25

    for (let i = 0; i < dataArray.length; i++) {
      const amplitude = dataArray[i] / 255.0
      const angle = (i / dataArray.length) * Math.PI * 2

      const x1 = centerX + Math.cos(angle) * radius
      const y1 = centerY + Math.sin(angle) * radius
      const x2 = centerX + Math.cos(angle) * (radius + amplitude * 50)
      const y2 = centerY + Math.sin(angle) * (radius + amplitude * 50)

      // 渐变色条
      const hue = (i / dataArray.length) * 360
      ctx.strokeStyle = `hsl(${hue}, 80%, 60%)`
      ctx.lineWidth = 2
      ctx.shadowBlur = 5
      ctx.shadowColor = `hsl(${hue}, 80%, 60%)`

      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()
    }

    // 中心圆
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius * 0.6, 0, Math.PI * 2)

    const gradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, radius * 0.6
    )
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.3)')
    gradient.addColorStop(1, 'rgba(139, 92, 246, 0.1)')

    ctx.fillStyle = gradient
    ctx.fill()
    ctx.closePath()
  }, [])

  const animate = useCallback(() => {
    const canvas = canvasRef.current

    if (!canvas || !analyserRef.current || !dataArrayRef.current) return

    const ctx = canvas.getContext('2d')

    if (!ctx) return

    const { width, height: h } = canvas

    // 清除画布（带拖影效果）
    ctx.fillStyle = 'rgba(9, 9, 11, 0.15)'
    ctx.fillRect(0, 0, width, h)

    const analyser = analyserRef.current
    const dataArray = dataArrayRef.current


    analyser.getByteFrequencyData(dataArray as any)

    switch (type) {
      case 'bars':
        drawBars(ctx, width, h, dataArray)
        break
      case 'wave':
        drawWave(ctx, width, h, dataArray)
        break
      case 'circle':
        drawCircle(ctx, width, h, dataArray)
        break
    }

    animationRef.current = requestAnimationFrame(animate)
  }, [type, drawBars, drawWave, drawCircle])

  useEffect(() => {
    if (currentTrack && isPlaying) {
      initAudioAnalyser().then(() => {
        animate()
      })
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [currentTrack, isPlaying, initAudioAnalyser, animate])

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current
      if (canvas) {
        canvas.width = canvas.offsetWidth
        canvas.height = height
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [height])

  return (
    <div className="w-full space-y-2">
      <div
        className="w-full rounded-lg border bg-card/50 backdrop-blur-sm overflow-hidden"
        style={{ height }}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ display: 'block' }}
        />

        {!currentTrack && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <p>选择一首歌曲开始可视化</p>
          </div>
        )}
      </div>

      {showControls && (
        <div className="flex items-center justify-between px-2">
          <span className="text-xs text-muted-foreground capitalize">
            {type} 模式
          </span>

          <div className="flex gap-1">
            {(['bars', 'wave', 'circle'] as VisualizerType[]).map((t) => (
              <button
                key={t}
                onClick={() => {/* 切换类型 */ }}
                className={`px-2 py-1 text-xs rounded transition-colors ${type === t
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
              >
                {t === 'bars' ? '📊' : t === 'wave' ? '🌊' : '⭕'}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
