import { Song, usePlayerStore } from '@/stores/playerStore'
import React, { ReactNode, createContext, useContext } from 'react'

interface PlayerContextType {
  currentTrack: Song | null
  isPlaying: boolean
}

const PlayerContext = createContext<PlayerContextType>({
  currentTrack: null,
  isPlaying: false,
})

export function PlayerProvider({ children }: { children: ReactNode }) {
  const currentTrack = usePlayerStore((state) => state.currentTrack)
  const isPlaying = usePlayerStore((state) => state.isPlaying)

  return (
    <PlayerContext.Provider value={{ currentTrack, isPlaying }}>
      {children}
    </PlayerContext.Provider>
  )
}

export const usePlayerContext = () => useContext(PlayerContext)
