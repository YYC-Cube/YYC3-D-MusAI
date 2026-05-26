import { useEffect, useRef, useCallback, memo, type CSSProperties } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  color: string
  alpha: number
  pulsePhase: number
  pulseSpeed: number
}

export interface ParticleCanvasConfig {
  enabled?: boolean
  neonIntensity?: number
  colors?: string[]
  connectionDistance?: number
  particleCountFactor?: number
  maxParticles?: number
  minParticles?: number
  opacity?: number
  mouseInteractionRange?: number
}

export interface ParticleCanvasProps {
  config?: ParticleCanvasConfig
  className?: string
  style?: CSSProperties
  enableMouseInteraction?: boolean
  autoResize?: boolean
}

const DEFAULT_COLORS = ['#7c3aed', '#6d28d9', '#8b5cf6', '#a78bfa', '#c084fc']

const DEFAULT_CONFIG: Required<ParticleCanvasConfig> = {
  enabled: true,
  neonIntensity: 70,
  colors: DEFAULT_COLORS,
  connectionDistance: 120,
  particleCountFactor: 0.00003,
  maxParticles: 50,
  minParticles: 12,
  opacity: 0.5,
  mouseInteractionRange: 150,
}

export const ParticleCanvas = memo(function ParticleCanvas({
  config: userConfig,
  className = '',
  style,
  enableMouseInteraction = true,
  autoResize = true,
}: ParticleCanvasProps) {
  const config = { ...DEFAULT_CONFIG, ...userConfig }
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animFrameRef = useRef<number>(0)
  const mouseRef = useRef({ x: -1000, y: -1000 })

  const createParticles = useCallback(
    (width: number, height: number): Particle[] => {
      const area = width * height
      const count = Math.max(config.minParticles, Math.min(config.maxParticles, Math.floor(area * config.particleCountFactor)))
      return Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: 1 + Math.random() * 2,
        color: config.colors[Math.floor(Math.random() * config.colors.length)],
        alpha: 0.15 + Math.random() * 0.35,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.01 + Math.random() * 0.02,
      }))
    },
    [config],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !config.enabled) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const parent = canvas.parentElement
      if (!parent) return
      const { width, height } = parent.getBoundingClientRect()
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      particlesRef.current = createParticles(width, height)
    }

    resize()
    if (autoResize) window.addEventListener('resize', resize)

    let handleMouse: ((e: MouseEvent) => void) | null = null
    let handleMouseLeave: (() => void) | null = null

    if (enableMouseInteraction) {
      handleMouse = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect()
        mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
      }
      handleMouseLeave = () => { mouseRef.current = { x: -1000, y: -1000 } }
      canvas.addEventListener('mousemove', handleMouse)
      canvas.addEventListener('mouseleave', handleMouseLeave)
    }

    const neonScale = config.neonIntensity / 100

    const animate = () => {
      const { width, height } = canvas.getBoundingClientRect()
      ctx.clearRect(0, 0, width, height)
      const particles = particlesRef.current
      const mouse = mouseRef.current

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        p.pulsePhase += p.pulseSpeed
        const pulse = 0.6 + 0.4 * Math.sin(p.pulsePhase)

        if (enableMouseInteraction) {
          const mdx = mouse.x - p.x
          const mdy = mouse.y - p.y
          const mDist = Math.sqrt(mdx * mdx + mdy * mdy)
          if (mDist < config.mouseInteractionRange && mDist > 1) {
            p.vx += (mdx / mDist) * 0.02
            p.vy += (mdy / mDist) * 0.02
          }
        }

        p.vx *= 0.99
        p.vy *= 0.99
        p.x += p.vx
        p.y += p.vy

        if (p.x < -10) p.x = width + 10
        if (p.x > width + 10) p.x = -10
        if (p.y < -10) p.y = height + 10
        if (p.y > height + 10) p.y = -10

        const alpha = p.alpha * pulse * neonScale
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius * pulse, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = alpha
        ctx.fill()

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius * 3 * pulse, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = alpha * 0.15
        ctx.fill()
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i]
          const b = particles[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < config.connectionDistance) {
            const lineAlpha = (1 - dist / config.connectionDistance) * 0.15 * neonScale
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = a.color
            ctx.globalAlpha = lineAlpha
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      if (enableMouseInteraction && mouse.x > 0 && mouse.y > 0) {
        for (const p of particles) {
          const dx = mouse.x - p.x
          const dy = mouse.y - p.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 180) {
            const lineAlpha = (1 - dist / 180) * 0.25 * neonScale
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(mouse.x, mouse.y)
            ctx.strokeStyle = p.color
            ctx.globalAlpha = lineAlpha
            ctx.lineWidth = 0.8
            ctx.stroke()
          }
        }
      }

      ctx.globalAlpha = 1
      animFrameRef.current = requestAnimationFrame(animate)
    }

    animFrameRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      if (autoResize) window.removeEventListener('resize', resize)
      if (handleMouse) canvas.removeEventListener('mousemove', handleMouse)
      if (handleMouseLeave) canvas.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [config, createParticles, enableMouseInteraction, autoResize])

  if (!config.enabled) return null

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-auto z-0 ${className}`}
      style={{ opacity: config.opacity, ...style }}
      aria-hidden="true"
    />
  )
})
