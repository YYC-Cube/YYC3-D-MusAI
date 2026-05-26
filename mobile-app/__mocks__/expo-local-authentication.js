export const hasHardwareAsync = jest.fn(() => Promise.resolve(true));
export const isEnrolledAsync = jest.fn(() => Promise.resolve(true));
export const authenticateAsync = jest.fn(() => Promise.resolve({ success: true }));
export const cancelAuthenticate = jest.fn();
