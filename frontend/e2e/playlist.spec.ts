import { expect, test } from '@playwright/test'

test.describe('Playlist Management', () => {
  test('should navigate to playlists page', async ({ page }) => {
    await page.goto('/playlists')

    await expect(page.getByRole('navigation')).toBeVisible()
  })
})
