import type { Playlist, Track } from '@/types/music'

const COVERS = '/D-cover'
const POSTERS = '/D-poster'
const MUSIC = '/D-Music'

export const coverImages = [
  `${COVERS}/D-cover-01.jpg`,
  `${COVERS}/D-cover-02.jpg`,
  `${COVERS}/D-cover-03.jpg`,
  `${COVERS}/D-cover-04.jpg`,
  `${COVERS}/D-cover-05.jpg`,
  `${COVERS}/D-cover-06.jpg`,
  `${COVERS}/D-cover-07.jpg`,
]

export const posterImages = [
  `${POSTERS}/D-poster-01.jpg`,
  `${POSTERS}/D-poster-02.jpg`,
  `${POSTERS}/D-poster-03.jpg`,
  `${POSTERS}/D-poster-04.jpg`,
  `${POSTERS}/D-poster-05.jpg`,
  `${POSTERS}/D-poster-06.jpg`,
]

export const artistCover = coverImages[0]

export const mockTracks: Track[] = [
  {
    id: '1',
    title: '奉陪',
    artist: '董小姐 & 沫言',
    album: '奉陪',
    cover: coverImages[0],
    audioUrl: `${MUSIC}/董小姐 & 沫言 - 奉陪.mp3`,
    duration: 234,
  },
  {
    id: '2',
    title: '岁月如歌',
    artist: '董小姐 & 沫言',
    album: '岁月如歌',
    cover: coverImages[1],
    audioUrl: `${MUSIC}/董小姐 %26 沫言 - 岁月如歌.mp3`,
    duration: 256,
  },
  {
    id: '3',
    title: '时光',
    artist: '董小姐 & 沫言',
    album: '时光',
    cover: coverImages[2],
    audioUrl: `${MUSIC}/董小姐 %26 沫言 - 时光.mp3`,
    duration: 218,
  },
  {
    id: '4',
    title: '浮生如渡',
    artist: '董小姐 & 沫言',
    album: '浮生如渡',
    cover: coverImages[3],
    audioUrl: `${MUSIC}/董小姐 %26 沫言 - 浮生如渡.mp3`,
    duration: 242,
  },
  {
    id: '5',
    title: '渡心时序',
    artist: '董小姐 & 沫言',
    album: '渡心时序',
    cover: coverImages[4],
    audioUrl: `${MUSIC}/董小姐 & 沫言 - 渡心时序.mp3`,
    duration: 228,
  },
  {
    id: '6',
    title: '我是渡船也是过客',
    artist: '董小姐',
    album: '我是渡船也是过客',
    cover: coverImages[5],
    audioUrl: `${MUSIC}/董小姐 - 我是渡船也是过客.mp3`,
    duration: 265,
  },
  {
    id: '7',
    title: '我的宝贝',
    artist: '董小姐',
    album: '我的宝贝',
    cover: coverImages[6],
    audioUrl: `${MUSIC}/董小姐 - 我的宝贝.mp3`,
    duration: 198,
  },
  {
    id: '8',
    title: '秋风不问梧桐意',
    artist: '董小姐',
    album: '秋风不问梧桐意',
    cover: coverImages[0],
    audioUrl: `${MUSIC}/董小姐 - 秋风不问梧桐意.mp3`,
    duration: 237,
  },
  {
    id: '9',
    title: '过客',
    artist: '董小姐',
    album: '过客',
    cover: coverImages[1],
    audioUrl: `${MUSIC}/董小姐 - 过客.mp3`,
    duration: 212,
  },
  {
    id: '10',
    title: '除了你',
    artist: '董小姐',
    album: '除了你',
    cover: coverImages[2],
    audioUrl: `${MUSIC}/董小姐 - 除了你.mp3`,
    duration: 245,
  },
  {
    id: '11',
    title: '岁月如歌',
    artist: '董小姐',
    album: '岁月如歌（独唱版）',
    cover: coverImages[3],
    audioUrl: `${MUSIC}/董小姐 - 岁月如歌.mp3`,
    duration: 248,
  },
]

export const mockPlaylists: Playlist[] = [
  {
    id: '1',
    name: '今日推荐',
    description: '董小姐精选歌曲，温暖你的每一天',
    cover: posterImages[0],
    tracks: mockTracks.slice(0, 4),
  },
  {
    id: '2',
    name: '深情对唱',
    description: '董小姐 & 沫言的经典合作',
    cover: posterImages[1],
    tracks: mockTracks.filter(t => t.artist.includes('沫言')),
  },
  {
    id: '3',
    name: '深夜情歌',
    description: '适合夜晚聆听的温柔旋律',
    cover: posterImages[2],
    tracks: [mockTracks[3], mockTracks[5], mockTracks[7], mockTracks[9]],
  },
  {
    id: '4',
    name: '时光漫步',
    description: '关于时间与回忆的歌',
    cover: posterImages[3],
    tracks: [mockTracks[1], mockTracks[2], mockTracks[4], mockTracks[10]],
  },
  {
    id: '5',
    name: '独唱精选',
    description: '董小姐个人代表作品',
    cover: posterImages[4],
    tracks: mockTracks.filter(t => !t.artist.includes('沫言')),
  },
  {
    id: '6',
    name: '全部歌曲',
    description: '董小姐完整歌曲合集',
    cover: posterImages[5],
    tracks: mockTracks,
  },
]
