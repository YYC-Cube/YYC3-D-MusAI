export const useNavigation = () => ({
  navigate: jest.fn(),
  goBack: jest.fn(),
});

export const NavigationContainer = ({ children }) => children;
