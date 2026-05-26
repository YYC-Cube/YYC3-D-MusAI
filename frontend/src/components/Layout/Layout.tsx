import { Outlet } from 'react-router-dom'
import Navigation from './Navigation'
import MiniPlayer from './MiniPlayer'

function Layout() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* 导航栏 */}
      <Navigation />
      
      {/* 主内容区 */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
      
      {/* 迷你播放器 */}
      <MiniPlayer />
    </div>
  )
}

export default Layout
