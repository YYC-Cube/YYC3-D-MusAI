describe('Discover Screen', () => {
  beforeAll(async () => {
    await device.launchApp({ newUser: true })
    // Login first
    await element(by.id('email-input')).tap()
    await element(by.id('email-input')).replaceText('test@example.com')
    await element(by.id('password-input')).tap()
    await element(by.id('password-input')).replaceText('password123')
    await element(by.id('login-button')).tap()

    // Navigate to Discover tab
    await waitFor(element(by.id('tab-发现')))
      .toBeVisible()
      .withTimeout(10000)
    await element(by.id('tab-发现')).tap()

    await waitFor(element(by.id('discover-screen')))
      .toBeVisible()
      .withTimeout(3000)
  }, 15000)

  it('should display discover screen with search bar', async () => {
    await expect(element(by.id('search-bar'))).toBeVisible()
    await expect(element(by.id('search-input'))).toBeVisible()
  })

  it('should show trending songs section', async () => {
    const trendingSection = element(by.id('trending-songs-section'))
    await waitFor(trendingSection)
      .toBeVisible()
      .withTimeout(5000)

    await expect(trendingSection).toBeVisible()
  })

  it('should search for songs and display results', async () => {
    const searchInput = element(by.id('search-input'))

    // Tap on search input
    await searchInput.tap()

    // Type search query
    await searchInput.replaceText('周杰伦')

    // Wait for search results
    await waitFor(element(by.id('search-results-list')))
      .toBeVisible()
      .withTimeout(5000)

    // Verify search results are displayed
    const searchResults = element(by.id('search-results-list'))
    await expect(searchResults).toBeVisible()
  }, 8000)

  it('should switch between search tabs (songs, artists, albums)', async () => {
    // First perform a search
    const searchInput = element(by.id('search-input'))
    await searchInput.tap()
    await searchInput.replaceText('test')

    // Wait for results
    await waitFor(element(by.id('search-results')))
      .toBeVisible()
      .withTimeout(3000)

    // Switch to Artists tab
    const artistsTab = element(by.id('tab-artists'))
    await artistsTab.tap()
    await waitFor(element(by.text('艺术家')))
      .toBeVisible()
      .withTimeout(2000)

    // Switch to Albums tab
    const albumsTab = element(by.id('tab-albums'))
    await albumsTab.tap()
    await waitFor(element(by.text('专辑')))
      .toBeVisible()
      .withTimeout(2000)
  })

  it('should navigate to artist detail when tapping artist', async () => {
    // Search for an artist
    const searchInput = element(by.id('search-input'))
    await searchInput.tap()
    await searchInput.replaceText('artist')

    // Switch to artists tab
    await element(by.id('tab-artists')).tap()

    // Wait for artist list
    await waitFor(element(by.id('artists-list')))
      .toBeVisible()
      .withTimeout(3000)

    // Tap on first artist
    await element(by.id('artist-item-0')).tap()

    // Should navigate to artist detail
    await waitFor(element(by.id('artist-detail-screen')))
      .toBeVisible()
      .withTimeout(3000)

    // Verify artist info is displayed
    await expect(element(by.id('artist-name'))).toBeVisible()
    await expect(element(by.id('artist-bio'))).toBeVisible()

    // Go back
    await device.pressBack()
  })

  it('should navigate to album detail when tapping album', async () => {
    // Search for album
    const searchInput = element(by.id('search-input'))
    await searchInput.tap()
    await searchInput.replaceText('album')

    // Switch to albums tab
    await element(by.id('tab-albums')).tap()

    // Wait for album list
    await waitFor(element(by.id('albums-list')))
      .toBeVisible()
      .withTimeout(3000)

    // Tap on first album
    await element(by.id('album-item-0')).tap()

    // Should navigate to album detail
    await waitFor(element(by.id('album-detail-screen')))
      .toBeVisible()
      .withTimeout(3000)

    // Verify album info is displayed
    await expect(element(by.id('album-title'))).toBeVisible()
    await expect(element(by.id('song-list'))).toBeVisible()

    // Go back
    await device.pressBack()
  })

  it('should clear search when tapping clear button', async () => {
    const searchInput = element(by.id('search-input'))
    await searchInput.tap()
    await searchInput.replaceText('some text')

    // Tap clear button
    const clearButton = element(by.id('clear-search-button'))
    await clearButton.tap()

    // Verify input is cleared
    await expect(searchInput).toHaveText('')
  })
})
