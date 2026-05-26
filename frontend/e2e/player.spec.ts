import { test, expect } from '@playwright/test'

test.describe('Music Player Core Flow', () => {
  test('should display home page with music content', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByText(/发现音乐/i)).toBeVisible()
    await expect(page.getByRole('navigation')).toBeVisible()
  })

  test('should navigate to player page', async ({ page }) => {
    await page.goto('/player')

    await expect(page.getByRole('navigation')).toBeVisible()
  })
})
