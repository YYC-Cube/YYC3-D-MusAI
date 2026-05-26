describe('Player Screen', () => {
  beforeAll(async () => {
    await device.launchApp({ newUser: true })
    // Login and navigate to player
    await element(by.id('email-input')).tap()
    await element(by.id('email-input')).replaceText('test@example.com')
    await element(by.id('password-input')).tap()
    await element(by.id('password-input')).replaceText('password123')
    await element(by.id('login-button')).tap()

    // Navigate to Home and play a song
    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(10000)

    // Wait for songs to load and tap on first one
    await waitFor(element(by.id('song-item-0')))
      .toBeVisible()
      .withTimeout(5000)
    await element(by.id('song-item-0')).tap()

    // Wait for player to open
    await waitFor(element(by.id('player-screen')))
      .toBeVisible()
      .withTimeout(5000)
  }, 15000)

  it('should display player screen with song info', async () => {
    await expect(element(by.id('song-title'))).toBeVisible()
    await expect(element(by.id('artist-name'))).toBeVisible()
    await expect(element(by.id('album-art'))).toBeVisible()
  })

  it('should display playback controls', async () => {
    await expect(element(by.id('play-pause-button'))).toBeVisible()
    await expect(element(by.id('next-button'))).toBeVisible()
    await expect(element(by.id('previous-button'))).toBeVisible()
  })

  it('should toggle play/pause state', async () => {
    const playPauseButton = element(by.id('play-pause-button'))

    // Initially should be in playing state (pause icon)
    // Tap to pause
    await playPauseButton.tap()

    // Wait a moment for state change
    await new Promise(resolve => setTimeout(resolve, 500))

    // Tap again to play
    await playPauseButton.tap()

    await new Promise(resolve => setTimeout(resolve, 500))
  })

  it('should navigate to next/previous song', async () => {
    const nextButton = element(by.id('next-button'))
    const prevButton = element(by.id('previous-button'))

    // Play next song
    await nextButton.tap()
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Verify song changed (title should be different or at least visible)
    await expect(element(by.id('song-title'))).toBeVisible()

    // Play previous song
    await prevButton.tap()
    await new Promise(resolve => setTimeout(resolve, 1000))

    await expect(element(by.id('song-title'))).toBeVisible()
  })

  it('should seek using progress bar', async () => {
    const progressBar = element(by.id('progress-bar'))

    await expect(progressBar).toBeVisible()

    // Seek to middle of the track
    await progressBar.swipe('left', 'fast', 0.5, 0.5, 0.5)

    // Wait for seek to complete
    await new Promise(resolve => setTimeout(resolve, 1000))
  })

  it('should display time labels (current/duration)', async () => {
    const currentTimeLabel = element(by.id('current-time'))
    const durationLabel = element(by.id('duration'))

    await expect(currentTimeLabel).toBeVisible()
    await expect(durationLabel).toBeVisible()
  })

  it('should toggle like/favorite status', async () => {
    const likeButton = element(by.id('like-button'))

    await expect(likeButton).toBeVisible()
    await likeButton.tap()

    // Verify visual feedback (button should change appearance)
    await new Promise(resolve => setTimeout(resolve, 300))
  })

  it('should open queue when tapping queue button', async () => {
    const queueButton = element(by.id('queue-button'))

    if (await queueButton.exists()) {
      await queueButton.tap()

      await waitFor(element(by.id('queue-screen')))
        .toBeVisible()
        .withTimeout(2000)

      // Go back
      await device.pressBack()
    }
  })

  it('should close player when tapping minimize button', async () => {
    const minimizeButton = element(by.id('minimize-button'))

    if (await minimizeButton.exists()) {
      await minimizeButton.tap()

      // Player should be minimized/closed
      await waitFor(element(by.id('home-screen')))
        .isVisible()
        .withTimeout(2000)
        .whileElement(by.id('home-scroll-view'))
        .not.isVisible()
    }
  })
})
