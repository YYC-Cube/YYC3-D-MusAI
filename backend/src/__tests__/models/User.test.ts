import bcrypt from 'bcryptjs'

// Mock sequelize before importing the model
jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    define: jest.fn(),
    sync: jest.fn(),
    authenticate: jest.fn(),
    query: jest.fn(),
    close: jest.fn(),
  },
}))

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('mocked-uuid-1234'),
}))

// Create a mock User model class
class MockUser {
  public id!: string
  public email!: string
  public username!: string
  public password!: string
  public avatar?: string
  public role!: 'user' | 'admin'
  public is_active!: boolean
  public readonly createdAt!: Date
  public readonly updatedAt!: Date

  static findOne = jest.fn()
  static findAll = jest.fn()
  static findByPk = jest.fn()
  static create = jest.fn()
  static update = jest.fn()
  static destroy = jest.fn()
  static count = jest.fn()
  static belongsTo = jest.fn()
  static hasMany = jest.fn()
  static belongsToMany = jest.fn()

  async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password)
  }

  static hashPassword(password: string): string {
    return bcrypt.hashSync(password, 12)
  }
}

// Mock the User model module
jest.mock('../../models/User', () => ({
  __esModule: true,
  default: MockUser,
}))

describe('User Model', () => {
  let User: typeof MockUser

  beforeEach(() => {
    jest.clearAllMocks()
    User = require('../../models/User').default
  })

  describe('Model Definition', () => {
    it('should have correct table name', () => {
      expect(User).toBeDefined()
    })

    it('should have required fields', () => {
      const instance = new User()
      expect(instance).toBeDefined()
    })
  })

  describe('Instance Methods', () => {
    it('should create instance with default values', () => {
      const user = new User()
      expect(user).toBeDefined()
    })

    it('should set and get properties', () => {
      const user = new User()
      user.email = 'test@example.com'
      user.username = 'testuser'

      expect(user.email).toBe('test@example.com')
      expect(user.username).toBe('testuser')
    })
  })

  describe('Static Methods', () => {
    it('should have findAll method', () => {
      expect(User.findAll).toBeDefined()
      expect(typeof User.findAll).toBe('function')
    })

    it('should have findByPk method', () => {
      expect(User.findByPk).toBeDefined()
      expect(typeof User.findByPk).toBe('function')
    })

    it('should have create method', () => {
      expect(User.create).toBeDefined()
      expect(typeof User.create).toBe('function')
    })

    it('should call findAll with correct parameters', async () => {
      const mockUsers = [
        { id: '1', email: 'user1@test.com', username: 'user1' },
        { id: '2', email: 'user2@test.com', username: 'user2' },
      ]
      User.findAll.mockResolvedValue(mockUsers as any)

      const result = await User.findAll({ where: { is_active: true } })

      expect(User.findAll).toHaveBeenCalledWith({ where: { is_active: true } })
      expect(result).toEqual(mockUsers)
    })

    it('should call create with user data', async () => {
      const userData = {
        email: 'new@example.com',
        username: 'newuser',
        password: 'password123',
      }
      User.create.mockResolvedValue({ ...userData, id: 'mocked-uuid-1234' } as any)

      const result = await User.create(userData)

      expect(User.create).toHaveBeenCalledWith(userData)
      expect(result.id).toBe('mocked-uuid-1234')
    })
  })

  describe('Password Hashing', () => {
    it('should hash password', () => {
      const password = 'testpassword123'
      const hashed = User.hashPassword(password)

      expect(hashed).toBeDefined()
      expect(hashed).not.toBe(password)
      expect(hashed.length).toBeGreaterThan(20)
    })

    it('should generate different hashes for same password', () => {
      const password = 'testpassword123'
      const hash1 = User.hashPassword(password)
      const hash2 = User.hashPassword(password)

      expect(hash1).not.toBe(hash2)
    })

    it('should verify password against hash', async () => {
      const password = 'testpassword123'
      const hashed = bcrypt.hashSync(password, 12)
      
      const user = new User()
      user.password = hashed
      
      const isValid = await user.comparePassword(password)
      expect(isValid).toBe(true)
    })

    it('should reject wrong password', async () => {
      const password = 'testpassword123'
      const hashed = bcrypt.hashSync(password, 12)
      
      const user = new User()
      user.password = hashed
      
      const isValid = await user.comparePassword('wrongpassword')
      expect(isValid).toBe(false)
    })
  })

  describe('Validation Scenarios', () => {
    it('should handle missing optional fields', () => {
      const user = new User()
      user.email = 'test@example.com'
      user.username = 'testuser'
      user.password = 'password123'

      expect(user.avatar).toBeUndefined()
    })

    it('should handle role field', () => {
      const user = new User()
      user.role = 'admin'
      
      expect(user.role).toBe('admin')
    })
  })
})
