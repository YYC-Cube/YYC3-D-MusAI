import DiscoverPage from '@/pages/DiscoverPage'
import PlayerPage from '@/pages/PlayerPage'
import PlaylistsPage from '@/pages/PlaylistsPage'
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import NotFoundPage from '@/pages/NotFoundPage'
import Layout from '@components/Layout/Layout'
import { Route, Routes } from 'react-router-dom'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="discover" element={<DiscoverPage />} />
        <Route path="player" element={<PlayerPage />} />
        <Route path="playlists" element={<PlaylistsPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
