import { DataTypes, Model, Optional } from 'sequelize'
import sequelize from '../config/database'
import { v4 as uuidv4 } from 'uuid'

interface AlbumAttributes {
  id: string
  title: string
  artist: string
  cover_url?: string
  release_year?: number
  genre?: string
}

interface AlbumCreationAttributes extends Optional<AlbumAttributes, 'id' | 'cover_url' | 'release_year' | 'genre'> {}

class Album extends Model<AlbumAttributes, AlbumCreationAttributes> implements AlbumAttributes {
  public id!: string
  public title!: string
  public artist!: string
  public cover_url?: string
  public release_year?: number
  public genre?: string
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

Album.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    artist: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    cover_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    release_year: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    genre: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Album',
    tableName: 'albums',
  }
)

export default Album
