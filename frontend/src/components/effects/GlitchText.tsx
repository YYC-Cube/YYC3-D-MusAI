import { memo, useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'

export interface GlitchTextProps {
  children: string
  color?: string
  className?: string
  style?: CSSProperties
  inline?: boolean
  interval?: [number, number] | null
  intensity?: number
  as?: 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'p'
  enabled?: boolean
}

export const GlitchText = memo(function GlitchText({
  children,
  color = '#7c3aed',
  className = '',
  style,
  inline = true,
  interval = [3000, 8000],
  intensity = 1,
  as: Tag = 'span',
  enabled = true,
}: GlitchTextProps) {
  const [isGlitching, setIsGlitching] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  const prefersReducedMotion =
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  const shouldAnimate = enabled && !prefersReducedMotion

  useEffect(() => {
    if (!shouldAnimate || !interval) return
    const scheduleGlitch = () => {
      const [min, max] = interval
      const delay = min + Math.random() * (max - min)
      timerRef.current = setTimeout(() => {
        setIsGlitching(true)
        setTimeout(() => { setIsGlitching(false); scheduleGlitch() }, 150 + Math.random() * 250)
      }, delay)
    }
    scheduleGlitch()
    return () => clearTimeout(timerRef.current)
  }, [shouldAnimate, interval])

  const handleMouseEnter = useCallback(() => { if (shouldAnimate) setIsHovering(true) }, [shouldAnimate])
  const handleMouseLeave = useCallback(() => { setIsHovering(false) }, [])

  const active = shouldAnimate && (isGlitching || isHovering)
  const px = Math.round(3 * intensity)

  return (
    <Tag
      className={`${inline ? 'inline-block' : 'block'} relative ${className}`}
      style={{
        ...style,
        color,
        willChange: active ? 'transform, clip-path' : 'auto',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label={children}
    >
      <span className="relative z-10">{children}</span>
      {active && (
        <span
          className="absolute inset-0 z-0 pointer-events-none"
          style={{ color: '#a78bfa', opacity: 0.7 * intensity, textShadow: `${px}px 0 #a78bfa` }}
          aria-hidden="true"
        >
          {children}
        </span>
      )}
      {active && (
        <span
          className="absolute inset-0 z-0 pointer-events-none"
          style={{ color: '#c084fc', opacity: 0.5 * intensity, textShadow: `${-px}px 0 #c084fc` }}
          aria-hidden="true"
        >
          {children}
        </span>
      )}
    </Tag>
  )
})
