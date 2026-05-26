import { DataTypes } from 'sequelize'
import sequelize from '../config/database'
import User from './User'
import Song from './Song'
import Playlist from './Playlist'
import Album from './Album'

User.hasMany(Song, {
  foreignKey: 'uploaded_by',
  as: 'uploadedSongs',
})

Song.belongsTo(User, {
  foreignKey: 'uploaded_by',
  as: 'uploader',
})

User.hasMany(Playlist, {
  foreignKey: 'user_id',
  as: 'playlists',
})

Playlist.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'owner',
})

Album.hasMany(Song, {
  foreignKey: 'album_id',
  as: 'songs',
})

Song.belongsTo(Album, {
  foreignKey: 'album_id',
  as: 'album',
})

const PlaylistSong = sequelize.define('PlaylistSong', {
  playlistId: {
    type: DataTypes.UUID,
    primaryKey: true,
  },
  songId: {
    type: DataTypes.UUID,
    primaryKey: true,
  },
  position: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  addedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
})

Playlist.belongsToMany(Song, {
  through: PlaylistSong,
  foreignKey: 'playlistId',
  otherKey: 'songId',
  as: 'songs',
})

Song.belongsToMany(Playlist, {
  through: PlaylistSong,
  foreignKey: 'songId',
  otherKey: 'playlistId',
  as: 'playlists',
})

const UserLike = sequelize.define('UserLike', {
  userId: {
    type: DataTypes.UUID,
    primaryKey: true,
  },
  songId: {
    type: DataTypes.UUID,
    primaryKey: true,
  },
  likedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
})

User.belongsToMany(Song, {
  through: UserLike,
  foreignKey: 'userId',
  otherKey: 'songId',
  as: 'likedSongs',
})

Song.belongsToMany(User, {
  through: UserLike,
  foreignKey: 'songId',
  otherKey: 'userId',
  as: 'likedByUsers',
})

export { User, Song, Playlist, Album, PlaylistSong, UserLike }

import logger from '../utils/logger'

export async function syncDatabase(force = false) {
  try {
    await sequelize.sync({ force })
    logger.info('✅ 数据库同步成功')

    if (force) {
      const adminExists = await User.findOne({ where: { email: 'admin@dmusic.com' } })
      if (!adminExists) {
        await User.create({
          email: 'admin@dmusic.com',
          username: 'admin',
          password: 'admin123456',
          role: 'admin',
        })
        logger.info('✅ 默认管理员账户已创建')
      }
    }
  } catch (error) {
    logger.error('❌ 数据库同步失败', { error: error instanceof Error ? error.message : String(error) })
    throw error
  }
}
