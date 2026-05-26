import { useAuthStore } from '@/stores/authStore'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const navItems = [
  { path: '/', label: '首页', icon: '▸' },
  { path: '/discover', label: '发现', icon: '▸' },
  { path: '/player', label: '播放器', icon: '▸' },
  { path: '/playlists', label: '歌单', icon: '▸' },
]

function Navigation() {
  const location = useLocation()
  const { user, isAuthenticated, actions } = useAuthStore()
  const [clock, setClock] = useState('')
  const [glitchText, setGlitchText] = useState('D-Music')

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setClock(
        `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`,
      )
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      if (Math.random() > 0.7) {
        setGlitchText('D-Mu̶s̶I̶')
        setTimeout(() => setGlitchText('D-Music'), 200)
      }
    }, 5000)
    return () => clearInterval(id)
  }, [])

  return (
    <nav
      className="sticky top-0 z-50 border-b backdrop-blur-md"
      style={{
        background: 'rgba(9,9,11,0.92)',
        borderColor: 'rgba(124,58,237,0.2)',
        boxShadow: '0 1px 0 rgba(124,58,237,0.1), 0 2px 20px rgba(0,0,0,0.4)',
      }}
    >
      <div
        className="flex items-center px-4 h-12 font-mono text-xs"
        style={{
          background: 'linear-gradient(90deg, rgba(124,58,237,0.03) 0%, transparent 50%, rgba(124,58,237,0.03) 100%)',
        }}
      >
        <Link to="/" className="mr-6 flex items-center gap-2 group">
          <div
            className="h-7 w-7 rounded overflow-hidden"
            style={{
              boxShadow: '0 0 8px rgba(124,58,237,0.3)',
              border: '1px solid rgba(124,58,237,0.3)',
            }}
          >
            <img src="/DXJ-02.png" alt="MusAI" className="w-full h-full object-cover" />
          </div>
          <span
            className="hidden sm:inline font-bold text-sm tracking-widest"
            style={{
              color: '#a78bfa',
              textShadow: '0 0 10px rgba(124,58,237,0.5)',
            }}
          >
            {glitchText}
          </span>
        </Link>

        <div className="hidden sm:flex items-center mr-2" style={{ color: 'rgba(167,139,250,0.3)' }}>
          {'>'} NAV [
        </div>

        <div className="flex items-center gap-0.5">
          {navItems.map((item) => {
            const active = location.pathname === item.path
            return (
              <Link key={item.path} to={item.path}>
                <button
                  className="px-2 sm:px-3 py-1.5 text-xs font-mono transition-all rounded-sm"
                  style={{
                    color: active ? '#c084fc' : 'rgba(167,139,250,0.5)',
                    background: active ? 'rgba(124,58,237,0.15)' : 'transparent',
                    boxShadow: active ? '0 0 8px rgba(124,58,237,0.1)' : 'none',
                    textShadow: active ? '0 0 8px rgba(192,132,252,0.4)' : 'none',
                  }}
                >
                  <span style={{ color: active ? '#7c3aed' : 'rgba(124,58,237,0.3)' }}>{item.icon}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              </Link>
            )
          })}
        </div>

        <div className="hidden sm:flex items-center ml-1" style={{ color: 'rgba(167,139,250,0.3)' }}>
          ]
        </div>

        <div className="ml-auto flex items-center gap-3">
          <span
            className="hidden md:inline font-mono text-xs"
            style={{ color: 'rgba(167,139,250,0.4)' }}
          >
            SYS:{clock}
          </span>

          <div
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{
              backgroundColor: isAuthenticated ? '#22c55e' : '#ef4444',
              boxShadow: `0 0 6px ${isAuthenticated ? 'rgba(34,197,94,0.5)' : 'rgba(239,68,68,0.5)'}`,
            }}
          />

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link to="/profile">
                <button
                  className="px-2 py-1 text-xs font-mono rounded-sm"
                  style={{ color: 'rgba(167,139,250,0.7)', background: 'rgba(124,58,237,0.1)' }}
                >
                  {user?.username || 'user'}
                </button>
              </Link>
              <button
                onClick={() => actions.logout()}
                className="px-2 py-1 text-xs font-mono rounded-sm"
                style={{ color: 'rgba(239,68,68,0.6)' }}
                title="EXIT"
              >
                [×]
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <button
                  className="px-2 py-1 text-xs font-mono rounded-sm"
                  style={{ color: 'rgba(167,139,250,0.6)', background: 'rgba(124,58,237,0.08)' }}
                >
                  LOGIN
                </button>
              </Link>
              <Link to="/register">
                <button
                  className="px-2 py-1 text-xs font-mono rounded-sm"
                  style={{
                    color: '#a78bfa',
                    background: 'rgba(124,58,237,0.2)',
                    boxShadow: '0 0 8px rgba(124,58,237,0.15)',
                  }}
                >
                  SIGNUP
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>

      <div
        className="h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.3), transparent)',
        }}
      />
    </nav>
  )
}

export default Navigation
