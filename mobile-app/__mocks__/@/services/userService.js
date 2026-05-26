export const userService = {
  getDownloads: jest.fn().mockResolvedValue([]),
  pauseDownload: jest.fn().mockResolvedValue({}),
  resumeDownload: jest.fn().mockResolvedValue({}),
  cancelDownload: jest.fn().mockResolvedValue({}),
  deleteDownloadedFile: jest.fn().mockResolvedValue({}),
  logoutAllDevices: jest.fn().mockResolvedValue({}),
  deleteAccount: jest.fn().mockResolvedValue({}),
  getNotifications: jest.fn().mockResolvedValue([]),
  markNotificationAsRead: jest.fn().mockResolvedValue({}),
  getPlaybackSettings: jest.fn().mockResolvedValue({}),
  updatePlaybackSettings: jest.fn().mockResolvedValue({}),
};

export default userService;
