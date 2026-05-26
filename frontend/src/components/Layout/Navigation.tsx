import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/authStore'

const navItems = [
  { path: '/', label: '首页', icon: '🏠' },
  { path: '/discover', label: '发现', icon: '🔍' },
  { path: '/player', label: '播放器', icon: '🎵' },
  { path: '/playlists', label: '歌单', icon: '📝' },
]

function Navigation() {
  const location = useLocation()
  const { user, isAuthenticated, actions } = useAuthStore()

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4">
        {/* Logo */}
        <Link to="/" className="mr-8 flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <span className="text-lg font-bold text-primary-foreground">D</span>
          </div>
          <span className="hidden font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent sm:inline-block">
            D-Music
          </span>
        </Link>

        {/* 导航链接 */}
        <div className="flex items-center space-x-1">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path}>
              <Button
                variant={location.pathname === item.path ? 'secondary' : 'ghost'}
                size="sm"
                className="gap-2"
              >
                <span>{item.icon}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </Button>
            </Link>
          ))}
        </div>

        {/* 右侧操作区 */}
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon">
            🔔
          </Button>

          {isAuthenticated ? (
            <>
              {/* 用户头像或菜单 */}
              <Link to="/profile">
                <Button variant="ghost" size="sm" className="gap-2">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="h-7 w-7 rounded-full object-cover"
                    />
                  ) : (
                    <span className="h-7 w-7 rounded-full bg-primary flex items-center justify-center text-xs font-medium text-primary-foreground">
                      {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  )}
                  <span className="hidden sm:inline">{user?.username || '用户'}</span>
                </Button>
              </Link>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => actions.logout()}
                title="退出登录"
              >
                🚪
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  登录
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm">
                  注册
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navigation
