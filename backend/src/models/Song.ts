import { DataTypes, Model, Optional } from 'sequelize'
import sequelize from '../config/database'
import { v4 as uuidv4 } from 'uuid'

interface SongAttributes {
  id: string
  title: string
  artist: string
  album_id?: string
  duration?: number
  cover_url?: string
  audio_url?: string
  youtube_id?: string
  genre?: string
  year?: number
  play_count: number
  like_count: number
  uploaded_by: string
  is_public: boolean
}

interface SongCreationAttributes extends Optional<SongAttributes, 'id' | 'album_id' | 'duration' | 'cover_url' | 'audio_url' | 'youtube_id' | 'genre' | 'year' | 'play_count' | 'like_count'> {}

class Song extends Model<SongAttributes, SongCreationAttributes> implements SongAttributes {
  public id!: string
  public title!: string
  public artist!: string
  public album_id?: string
  public duration?: number
  public cover_url?: string
  public audio_url?: string
  public youtube_id?: string
  public genre?: string
  public year?: number
  public play_count!: number
  public like_count!: number
  public uploaded_by!: string
  public is_public!: boolean
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

Song.init(
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
    album_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Duration in seconds',
    },
    cover_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    audio_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    youtube_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    genre: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    play_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    like_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    uploaded_by: {
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
    modelName: 'Song',
    tableName: 'songs',
    indexes: [
      {
        fields: ['title'],
        type: 'FULLTEXT',
        name: 'songs_title_index',
      },
      {
        fields: ['artist'],
        type: 'FULLTEXT',
        name: 'songs_artist_index',
      },
      {
        fields: ['genre'],
      },
      {
        fields: ['uploaded_by'],
      },
      {
        fields: ['play_count'],
      },
    ],
  }
)

export default Song
