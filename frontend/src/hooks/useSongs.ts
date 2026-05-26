import { songService, type CreateSongData, type SongFilters } from '@/services/songService'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

const SONG_KEYS = {
  all: ['songs'] as const,
  lists: () => [...SONG_KEYS.all, 'list'] as const,
  list: (filters?: SongFilters) => [...SONG_KEYS.lists(), filters] as const,
  details: () => [...SONG_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...SONG_KEYS.details(), id] as const,
  hot: () => [...SONG_KEYS.all, 'hot'] as const,
}

export function useSongs(filters?: SongFilters) {
  return useQuery({
    queryKey: SONG_KEYS.list(filters),
    queryFn: () => songService.getSongs(filters),
    staleTime: 30 * 1000,
  })
}

export function useSong(id: string) {
  return useQuery({
    queryKey: SONG_KEYS.detail(id),
    queryFn: () => songService.getSongById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

export function useHotSongs() {
  return useQuery({
    queryKey: SONG_KEYS.hot(),
    queryFn: () => songService.getHotSongs(),
    staleTime: 60 * 1000,
  })
}

export function useCreateSong() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateSongData) => songService.createSong(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SONG_KEYS.lists() })
    },
  })
}

export function useUpdateSong() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateSongData> }) =>
      songService.updateSong(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: SONG_KEYS.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: SONG_KEYS.lists() })
    },
  })
}

export function useDeleteSong() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => songService.deleteSong(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SONG_KEYS.lists() })
    },
  })
}

export function useToggleLike() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => songService.toggleLike(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: SONG_KEYS.detail(id) })
    },
  })
}
