import { useEffect, useRef, memo } from 'react'

export const AuroraBackground = memo(function AuroraBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId = 0
    const blobs = [
      { x: 0.3, y: 0.3, vx: 0.0003, vy: 0.0002, r: 0.35, color: [124, 58, 237] },
      { x: 0.7, y: 0.6, vx: -0.0002, vy: 0.0003, r: 0.3, color: [139, 92, 246] },
      { x: 0.5, y: 0.8, vx: 0.0001, vy: -0.0002, r: 0.25, color: [168, 85, 247] },
    ]

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const animate = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      ctx.clearRect(0, 0, w, h)

      for (const b of blobs) {
        b.x += b.vx
        b.y += b.vy
        if (b.x < 0.1 || b.x > 0.9) b.vx *= -1
        if (b.y < 0.1 || b.y > 0.9) b.vy *= -1

        const grd = ctx.createRadialGradient(b.x * w, b.y * h, 0, b.x * w, b.y * h, b.r * Math.max(w, h))
        const [r, g, bl] = b.color
        grd.addColorStop(0, `rgba(${r},${g},${bl},0.12)`)
        grd.addColorStop(0.4, `rgba(${r},${g},${bl},0.05)`)
        grd.addColorStop(1, `rgba(${r},${g},${bl},0)`)
        ctx.fillStyle = grd
        ctx.fillRect(0, 0, w, h)
      }

      animId = requestAnimationFrame(animate)
    }
    animId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  )
})

export const CRTOverlay = memo(function CRTOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ zIndex: 1 }} aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.03) 0px, rgba(0,0,0,0.03) 1px, transparent 1px, transparent 2px)',
        }}
      />
      <div
        className="absolute inset-0 animate-pulse"
        style={{
          background: 'linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.02) 50%)',
          backgroundSize: '100% 4px',
          animationDuration: '0.1s',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.15) 100%)',
        }}
      />
    </div>
  )
})

interface TiltCoverProps {
  src: string
  alt: string
  isPlaying?: boolean
  onClick?: () => void
  size?: number
}

export const TiltCover = memo(function TiltCover({ src, alt, isPlaying, onClick, size = 48 }: TiltCoverProps) {
  const ref = useRef<HTMLDivElement>(null)

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    el.style.transform = `perspective(600px) rotateY(${x * 15}deg) rotateX(${-y * 15}deg) scale(1.08)`
  }

  const handleLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.transform = 'perspective(600px) rotateY(0deg) rotateX(0deg) scale(1)'
  }

  return (
    <div
      ref={ref}
      className="cursor-pointer flex-shrink-0 rounded-lg overflow-hidden shadow-lg"
      style={{
        width: size,
        height: size,
        transition: 'transform 0.2s ease-out',
        boxShadow: isPlaying
          ? '0 0 20px rgba(124,58,237,0.4), 0 4px 12px rgba(0,0,0,0.3)'
          : '0 4px 12px rgba(0,0,0,0.3)',
      }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={onClick}
    >
      <img src={src} alt={alt} className="w-full h-full object-cover" loading="lazy" draggable={false} />
    </div>
  )
})
