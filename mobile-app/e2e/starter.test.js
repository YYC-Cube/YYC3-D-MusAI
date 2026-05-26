describe('Mobile App E2E Smoke Test', () => {
  beforeAll(async () => {
    await device.launchApp()
  })

  beforeEach(async () => {
    await device.reloadReactNative()
  })

  it('should show home screen with navigation tabs', async () => {
    await expect(element(by.text('首页'))).toBeVisible()
    await expect(element(by.text('发现'))).toBeVisible()
    await expect(element(by.text('我的'))).toBeVisible()
  })

  it('should navigate to discover tab', async () => {
    await element(by.text('发现')).tap()
    await expect(element(by.text('推荐'))).toBeVisible()
  })

  it('should navigate to library tab', async () => {
    await element(by.text('我的')).tap()
    await expect(element(by.text('我喜欢的音乐'))).toBeVisible()
  })
})
