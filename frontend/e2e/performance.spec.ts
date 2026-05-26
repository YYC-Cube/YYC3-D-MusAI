import { expect, test } from '@playwright/test'

test.describe('Performance Tests', () => {
  test('home page should load within performance budget', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const loadTime = Date.now() - startTime

    expect(loadTime).toBeLessThan(5000)
  })

  test('login page should have good first paint', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('domcontentloaded')

    await expect(page.getByText(/欢迎回来/i)).toBeVisible()
  })
})
