describe('Settings Screen', () => {
  beforeAll(async () => {
    await device.launchApp({ newUser: true })
    // Login first
    await element(by.id('email-input')).tap()
    await element(by.id('email-input')).replaceText('test@example.com')
    await element(by.id('password-input')).tap()
    await element(by.id('password-input')).replaceText('password123')
    await element(by.id('login-button')).tap()

    // Navigate to Settings tab
    await waitFor(element(by.id('tab-设置')))
      .toBeVisible()
      .withTimeout(10000)
    await element(by.id('tab-设置')).tap()

    await waitFor(element(by.id('settings-screen')))
      .toBeVisible()
      .withTimeout(3000)
  }, 15000)

  it('should display settings screen with user profile', async () => {
    await expect(element(by.id('profile-section'))).toBeVisible()
    await expect(element(by.text('用户名'))).toBeVisible()
    await expect(element(by.id('user-avatar'))).toBeVisible()
  })

  it('should navigate to profile edit when tapping profile', async () => {
    const profileSection = element(by.id('profile-section'))
    await profileSection.tap()

    await waitFor(element(by.id('profile-edit-screen')))
      .toBeVisible()
      .withTimeout(2000)

    // Verify profile edit fields
    await expect(element(by.id('name-input'))).toBeVisible()
    await expect(element(by.id('email-input'))).toBeVisible()
    await expect(element(by.id('bio-input'))).toBeVisible()

    // Go back
    await device.pressBack()
  })

  it('should display settings sections', async () => {
    await expect(element(by.id('account-settings-section'))).toBeVisible()
    await expect(element(by.id('playback-settings-section'))).toBeVisible()
    await expect(element(by.id('notification-settings-section'))).toBeVisible()
    await expect(element(by.id('about-section'))).toBeVisible()
  })

  it('should navigate to account security settings', async () => {
    const accountSecurityOption = element(by.id('account-security-option'))
    await accountSecurityOption.tap()

    await waitFor(element(by.id('account-security-screen')))
      .toBeVisible()
      .withTimeout(2000)

    // Verify security options
    await expect(element(by.id('change-password-option'))).toBeVisible()
    await expect(element(by.id('two-factor-auth-option'))).toBeVisible()
    await expect(element(by.text('生物识别登录'))).toBeVisible()

    // Go back
    await device.pressBack()
  })

  it('should navigate to playback settings', async () => {
    const playbackSettingsOption = element(by.id('playback-settings-option'))
    await playbackSettingsOption.tap()

    await waitFor(element(by.id('playback-settings-screen')))
      .toBeVisible()
      .withTimeout(2000)

    // Verify playback settings options
    await expect(element(by.id('audio-quality-setting'))).toBeVisible()
    await expect(element(by.id('equalizer-setting'))).toBeVisible()
    await expect(element(by.id('crossfade-setting'))).toBeVisible()

    // Go back
    await device.pressBack()
  })

  it('should navigate to notification settings', async () => {
    const notificationSettingsOption = element(by.id('notification-settings-option'))
    await notificationSettingsOption.tap()

    await waitFor(element(by.id('notifications-screen')))
      .toBeVisible()
      .withTimeout(2000)

    // Verify notification toggles
    await expect(element(by.text('推送通知'))).toBeVisible()
    await expect(element(by.id('new-music-notification-toggle'))).toBeVisible()
    await expect(element(by.id('recommendation-notification-toggle'))).toBeVisible()

    // Go back
    await device.pressBack()
  })

  it('should toggle notification setting', async () => {
    const notificationSettingsOption = element(by.id('notification-settings-option'))
    await notificationSettingsOption.tap()

    await waitFor(element(by.id('notifications-screen')))
      .toBeVisible()
      .withTimeout(2000)

    // Toggle a notification switch
    const newMusicToggle = element(by.id('new-music-notification-toggle'))
    await newMusicToggle.tap()

    // Wait for state change
    await new Promise(resolve => setTimeout(resolve, 500))

    // Go back
    await device.pressBack()
  })

  it('should logout successfully', async () => {
    // Scroll to find logout button if needed
    const logoutButton = element(by.id('logout-button'))

    // Scroll down if not visible
    if (!(await logoutButton.isVisible())) {
      await element(by.id('settings-scroll-view'))
        .swipe('up', 'fast', 0.5, 0.8, 0.2)
    }

    await waitFor(logoutButton)
      .toBeVisible()
      .withTimeout(2000)

    await logoutButton.tap()

    // Should show confirmation dialog
    await waitFor(element(by.id('logout-confirmation-dialog')))
      .toBeVisible()
      .withTimeout(2000)

    // Confirm logout
    const confirmLogout = element(by.id('confirm-logout-button'))
    await confirmLogout.tap()

    // Should return to login screen
    await waitFor(element(by.id('email-input')))
      .toBeVisible()
      .withTimeout(5000)
  })
})
