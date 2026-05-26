import DiscoverPage from '@/pages/DiscoverPage'
import PlayerPage from '@/pages/PlayerPage'
import PlaylistsPage from '@/pages/PlaylistsPage'
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import Layout from '@components/Layout/Layout'
import { Route, Routes } from 'react-router-dom'

function App() {
  return (
    <Routes>
      {/* 认证页面（无布局） */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* 主应用（带布局） */}
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="discover" element={<DiscoverPage />} />
        <Route path="player" element={<PlayerPage />} />
        <Route path="playlists" element={<PlaylistsPage />} />
      </Route>
    </Routes>
  )
}

export default App
