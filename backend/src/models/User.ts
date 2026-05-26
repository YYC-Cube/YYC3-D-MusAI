import { DataTypes, Model, Optional } from 'sequelize'
import sequelize from '../config/database'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

interface UserAttributes {
  id: string
  email: string
  username: string
  password: string
  avatar?: string
  role: 'user' | 'admin'
  is_active: boolean
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'avatar' | 'role' | 'is_active'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string
  public email!: string
  public username!: string
  public password!: string
  public avatar?: string
  public role!: 'user' | 'admin'
  public is_active!: boolean
  public readonly createdAt!: Date
  public readonly updatedAt!: Date

  async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password)
  }

  static hashPassword(password: string): string {
    return bcrypt.hashSync(password, 12)
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        len: [2, 50],
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [6, 100],
      },
    },
    avatar: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM('user', 'admin'),
      defaultValue: 'user',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    hooks: {
      beforeCreate: async (user: User) => {
        if (user.password) {
          user.password = User.hashPassword(user.password)
        }
      },
      beforeUpdate: async (user: User) => {
        if (user.changed('password')) {
          user.password = User.hashPassword(user.password)
        }
      },
    },
  }
)

export default User
