import { DataTypes, Model, Optional } from 'sequelize'
import sequelize from '../config/database'
import { v4 as uuidv4 } from 'uuid'

interface PlaylistAttributes {
  id: string
  name: string
  description?: string
  cover_url?: string
  user_id: string
  is_public: boolean
}

interface PlaylistCreationAttributes extends Optional<PlaylistAttributes, 'id' | 'description' | 'cover_url' | 'is_public'> {}

class Playlist extends Model<PlaylistAttributes, PlaylistCreationAttributes> implements PlaylistAttributes {
  public id!: string
  public name!: string
  public description?: string
  public cover_url?: string
  public user_id!: string
  public is_public!: boolean
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

Playlist.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    cover_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    is_public: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'Playlist',
    tableName: 'playlists',
  }
)

export default Playlist
