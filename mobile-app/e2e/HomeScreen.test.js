describe('Home Screen', () => {
  beforeAll(async () => {
    await device.launchApp({ newUser: true })
    // Login first to access home screen
    await element(by.id('email-input')).tap()
    await element(by.id('email-input')).replaceText('test@example.com')
    await element(by.id('password-input')).tap()
    await element(by.id('password-input')).replaceText('password123')
    await element(by.id('login-button')).tap()

    // Wait for home screen
    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(10000)
  }, 15000)

  it('should display home screen with greeting', async () => {
    await expect(element(by.id('greeting-text'))).toBeVisible()
    await expect(element(by.text('欢迎回来'))).toBeVisible()
  })

  it('should display recently played section', async () => {
    const recentlyPlayed = element(by.id('recently-played-section'))
    await waitFor(recentlyPlayed)
      .toBeVisible()
      .withTimeout(5000)

    await expect(recentlyPlayed).toBeVisible()
  })

  it('should display recommended songs section', async () => {
    const recommendedSection = element(by.id('recommended-songs-section'))
    await waitFor(recommendedSection)
      .toBeVisible()
      .withTimeout(5000)

    await expect(recommendedSection).toBeVisible()
  })

  it('should navigate to song detail when tapping a song', async () => {
    // Wait for songs to load
    await waitFor(element.by.type('TouchableOpacity').and(by.id('song-item-0')))
      .toBeVisible()
      .withTimeout(5000)

    // Tap on first song
    await element(by.id('song-item-0')).tap()

    // Should navigate to song detail
    await waitFor(element(by.id('song-detail-screen')))
      .toBeVisible()
      .withTimeout(3000)

    // Go back
    await device.pressBack()
  })

  it('should display bottom tab navigation', async () => {
    const tabs = ['首页', '发现', '音乐库', '设置']

    for (const tab of tabs) {
      await expect(element(by.id(`tab-${tab}`))).toBeVisible()
    }
  })

  it('should switch between tabs correctly', async () => {
    // Tap on Discover tab
    await element(by.id('tab-发现')).tap()
    await waitFor(element(by.id('discover-screen')))
      .toBeVisible()
      .withTimeout(2000)

    // Tap on Library tab
    await element(by.id('tab-音乐库')).tap()
    await waitFor(element(by.id('library-screen')))
      .toBeVisible()
     withTimeout(2000)

    // Tap on Settings tab
    await element(by.id('tab-设置')).tap()
    await waitFor(element(by.id('settings-screen')))
      .toBeVisible()
      .withTimeout(2000)

    // Return to Home
    await element(by.id('tab-首页')).tap()
    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(2000)
  })

  it('should show pull-to-refresh functionality', async () => {
    const homeContent = element(by.id('home-scroll-view'))

    // Pull down to refresh
    await homeContent.swipe('down', 'fast', 0.5, 0.1, 0.5)

    // Wait for refresh indicator (if implemented)
    await new Promise(resolve => setTimeout(resolve, 1000))
  })
})
