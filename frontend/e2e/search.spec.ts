import { expect, test } from '@playwright/test'

test.describe('Search Functionality', () => {
  test('should display discover page', async ({ page }) => {
    await page.goto('/discover')

    await expect(page.getByRole('navigation')).toBeVisible()
  })
})
