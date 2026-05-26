import { memo, useRef, useEffect, useState, type CSSProperties, type ReactNode } from 'react'

export interface GlassCardProps {
  children: ReactNode
  className?: string
  hoverable?: boolean
  onClick?: () => void
  noReveal?: boolean
  ariaLabel?: string
  style?: CSSProperties
}

export const GlassCard = memo(function GlassCard({
  children,
  className = '',
  hoverable = true,
  onClick,
  noReveal = false,
  ariaLabel,
  style,
}: GlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [revealed, setRevealed] = useState(noReveal)

  useEffect(() => {
    if (noReveal || revealed) return
    const el = cardRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setRevealed(true); observer.disconnect() } },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [noReveal, revealed])

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (hoverable) {
      const t = e.currentTarget
      t.style.background = 'rgba(255,255,255,0.10)'
      t.style.boxShadow = '0 16px 40px rgba(0,0,0,0.12), 0 0 30px rgba(124,58,237,0.15), inset 0 1px 0 rgba(255,255,255,0.12)'
    }
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (hoverable) {
      const t = e.currentTarget
      t.style.background = 'rgba(255,255,255,0.06)'
      t.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.08)'
    }
  }

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={ariaLabel}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } } : undefined}
      className={`relative overflow-hidden rounded-2xl p-6 transition-all duration-400 ${hoverable ? 'cursor-pointer hover:-translate-y-1 hover:scale-[1.01]' : ''} ${className}`}
      style={{
        background: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderTop: '1px solid rgba(255,255,255,0.18)',
        borderLeft: '1px solid rgba(255,255,255,0.14)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.08)',
        borderRadius: '20px',
        opacity: revealed ? 1 : 0,
        transform: revealed ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.96)',
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        ...style,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative z-10">{children}</div>
    </div>
  )
})
