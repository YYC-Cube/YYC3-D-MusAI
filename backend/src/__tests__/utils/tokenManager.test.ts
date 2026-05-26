import {
  generateTokenPair,
  verifyToken,
  verifyAccessToken,
  verifyRefreshToken,
} from '../../utils/tokenManager'

describe('tokenManager', () => {
  const mockUser = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'test@example.com',
    role: 'user' as const,
  }

  describe('generateTokenPair', () => {
    it('should generate access and refresh tokens', () => {
      const tokenPair = generateTokenPair(mockUser)

      expect(tokenPair.accessToken).toBeDefined()
      expect(tokenPair.refreshToken).toBeDefined()
      expect(tokenPair.expiresIn).toBe(900)
      expect(typeof tokenPair.accessToken).toBe('string')
      expect(typeof tokenPair.refreshToken).toBe('string')
    })

    it('should generate different tokens for different users', () => {
      const tokenPair1 = generateTokenPair(mockUser)
      const tokenPair2 = generateTokenPair({
        ...mockUser,
        id: '660e8400-e29b-41d4-a716-446655440001',
      })

      expect(tokenPair1.accessToken).not.toBe(tokenPair2.accessToken)
      expect(tokenPair1.refreshToken).not.toBe(tokenPair2.refreshToken)
    })
  })

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const tokenPair = generateTokenPair(mockUser)
      const payload = verifyToken(tokenPair.accessToken)

      expect(payload).not.toBeNull()
      expect(payload?.userId).toBe(mockUser.id)
      expect(payload?.email).toBe(mockUser.email)
      expect(payload?.role).toBe(mockUser.role)
    })

    it('should return null for invalid token', () => {
      const payload = verifyToken('invalid-token')
      expect(payload).toBeNull()
    })
  })

  describe('verifyAccessToken', () => {
    it('should verify access token', () => {
      const tokenPair = generateTokenPair(mockUser)
      const payload = verifyAccessToken(tokenPair.accessToken)

      expect(payload).not.toBeNull()
      expect(payload?.type).toBe('access')
    })

    it('should reject refresh token as access token', () => {
      const tokenPair = generateTokenPair(mockUser)
      const payload = verifyAccessToken(tokenPair.refreshToken)

      expect(payload).toBeNull()
    })
  })

  describe('verifyRefreshToken', () => {
    it('should verify refresh token', () => {
      const tokenPair = generateTokenPair(mockUser)
      const payload = verifyRefreshToken(tokenPair.refreshToken)

      expect(payload).not.toBeNull()
      expect(payload?.type).toBe('refresh')
    })

    it('should reject access token as refresh token', () => {
      const tokenPair = generateTokenPair(mockUser)
      const payload = verifyRefreshToken(tokenPair.accessToken)

      expect(payload).toBeNull()
    })
  })
})
