export const useAuthStore = () => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  actions: {
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
  },
});
