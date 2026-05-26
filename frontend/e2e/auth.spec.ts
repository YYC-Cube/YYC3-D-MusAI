import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText(/欢迎回来/i)).toBeVisible()
    await expect(page.getByLabel(/邮箱地址/i)).toBeVisible()
    await expect(page.getByLabel(/密码/i)).toBeVisible()
  })

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('link', { name: /注册/i }).click()
    await expect(page).toHaveURL(/.*register/)
  })
})

test.describe('Home Page', () => {
  test('should display home page with navigation', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('navigation')).toBeVisible()
    await expect(page.getByText(/发现音乐/i)).toBeVisible()
  })
})
