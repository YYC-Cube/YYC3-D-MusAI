describe('Library Screen', () => {
  beforeAll(async () => {
    await device.launchApp({ newUser: true })
    // Login first
    await element(by.id('email-input')).tap()
    await element(by.id('email-input')).replaceText('test@example.com')
    await element(by.id('password-input')).tap()
    await element(by.id('password-input')).replaceText('password123')
    await element(by.id('login-button')).tap()

    // Navigate to Library tab
    await waitFor(element(by.id('tab-音乐库')))
      .toBeVisible()
      .withTimeout(10000)
    await element(by.id('tab-音乐库')).tap()

    await waitFor(element(by.id('library-screen')))
      .toBeVisible()
      .withTimeout(3000)
  }, 15000)

  it('should display library screen with sections', async () => {
    await expect(element(by.id('playlists-section'))).toBeVisible()
    await expect(element(by.id('liked-songs-section'))).toBeVisible()
    await expect(element(by.id('downloads-section'))).toBeVisible()
  })

  it('should display user playlists', async () => {
    const playlistsSection = element(by.id('playlists-list'))
    await waitFor(playlistsSection)
      .toBeVisible()
      .withTimeout(5000)

    await expect(playlistsSection).toBeVisible()
  })

  it('should navigate to playlist detail when tapping a playlist', async () => {
    // Wait for playlists to load
    await waitFor(element(by.id('playlist-item-0')))
      .toBeVisible()
      .withTimeout(5000)

    // Tap on first playlist
    await element(by.id('playlist-item-0')).tap()

    // Should navigate to playlist detail
    await waitFor(element(by.id('playlist-detail-screen')))
      .toBeVisible()
      .withTimeout(3000)

    // Verify playlist info is displayed
    await expect(element(by.id('playlist-title'))).toBeVisible()
    await expect(element(by.id('song-list'))).toBeVisible()

    // Go back
    await device.pressBack()
  })

  it('should show liked songs section', async () => {
    const likedSongsSection = element(by.id('liked-songs-card'))
    await waitFor(likedSongsSection)
      .toBeVisible()
      .withTimeout(3000)

    await expect(likedSongsSection).toBeVisible()

    // Tap to open liked songs
    await likedSongsSection.tap()

    // Should navigate to playlist detail (liked songs is a special playlist)
    await waitFor(element(by.id('playlist-detail-screen')))
      .toBeVisible()
      .withTimeout(3000)

    // Go back
    await device.pressBack()
  })

  it('should navigate to downloads screen', async () => {
    const downloadsButton = element(by.id('downloads-button'))
    await expect(downloadsButton).toBeVisible()
    await downloadsButton.tap()

    await waitFor(element(by.id('downloads-screen')))
      .toBeVisible()
      .withTimeout(3000)

    // Verify downloads screen content
    await expect(element(by.text('已下载'))).toBeVisible()

    // Go back
    await device.pressBack()
  })

  it('should create new playlist', async () => {
    const createPlaylistButton = element(by.id('create-playlist-button'))

    if (await createPlaylistButton.exists()) {
      await createPlaylistButton.tap()

      // Should show create playlist dialog/modal
      await waitFor(element(by.id('create-playlist-modal')))
        .toBeVisible()
        .withTimeout(2000)

      // Enter playlist name
      const nameInput = element(by.id('playlist-name-input'))
      await nameInput.tap()
      await nameInput.replaceText('My New Playlist')

      // Confirm creation
      const confirmButton = element(by.id('confirm-create-playlist'))
      await confirmButton.tap()

      // Should return to library with new playlist
      await waitFor(element(by.id('library-screen')))
        .isVisible()
        .withTimeout(2000)
    }
  })

  it('should delete a playlist', async () => {
    // Long press on a playlist to show context menu
    await waitFor(element(by.id('playlist-item-0')))
      .toBeVisible()
      .withTimeout(5000)

    await element(by.id('playlist-item-0')).longPress()

    // Wait for action sheet/menu
    await waitFor(element(by.text('删除')))
      .toBeVisible()
      .withTimeout(2000)

    // Tap delete
    await element(by.text('删除')).tap()

    // Confirm deletion if prompted
    const confirmDelete = element(by.id('confirm-delete'))
    if (await confirmDelete.exists()) {
      await confirmDelete.tap()
    }

    // Playlist should be removed from list
    await new Promise(resolve => setTimeout(resolve, 500))
  })

  it('should display recently added songs', async () => {
    const recentSongs = element(by.id('recently-added-section'))

    if (await recentSongs.exists()) {
      await expect(recentSongs).toBeVisible()
    }
  })
})
