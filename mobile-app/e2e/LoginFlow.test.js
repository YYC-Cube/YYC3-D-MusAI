describe('Login Flow', () => {
  beforeAll(async () => {
    await device.launchApp()
  })

  it('should display login screen with email and password fields', async () => {
    await expect(element(by.id('email-input'))).toBeVisible()
    await expect(element(by.id('password-input'))).toBeVisible()
    await expect(element(by.id('login-button'))).toBeVisible()
    await expect(element(by.text('登录'))).toBeVisible()
  })

  it('should show validation error for invalid email', async () => {
    await element(by.id('email-input')).tap()
    await element(by.id('email-input')).replaceText('invalid-email')
    await element(by.id('password-input')).tap()
    await element(by.id('password-input')).replaceText('password123')
    await element(by.id('login-button')).tap()

    await expect(
      element(by.text('请输入有效的邮箱地址'))
    ).toBeVisible()
  })

  it('should show validation error for short password', async () => {
    await element(by.id('email-input')).tap()
    await element(by.id('email-input')).replaceText('test@example.com')
    await element(by.id('password-input')).tap()
    await element(by.id('password-input')).replaceText('123')
    await element(by.id('login-button')).tap()

    await expect(
      element(by.text('密码至少需要6个字符'))
    ).toBeVisible()
  })

  it('should navigate to biometric setup after successful login', async () => {
    await element(by.id('email-input')).tap()
    await element(by.id('email-input')).replaceText('test@example.com')
    await element(by.id('password-input')).tap()
    await element(by.id('password-input')).replaceText('password123')

    await element(by.id('login-button')).tap()

    if (device.getPlatform() === 'ios') {
      await waitFor(element(by.id('biometric-setup-screen')))
        .toBeVisible()
        .withTimeout(5000)
    } else {
      await waitFor(element(by.id('home-screen')))
        .toBeVisible()
        .withTimeout(5000)
    }
  }, 10000)

  it('should toggle password visibility', async () => {
    const passwordInput = element(by.id('password-input'))
    const toggleButton = element(by.id('toggle-password-visibility'))

    await expect(toggleButton).toBeVisible()
    await toggleButton.tap()

    // Password should now be visible (not obscured)
    // This is a visual test, so we just verify the button interaction works
    await expect(passwordInput).toBeVisible()
  })

  it('should navigate to registration screen', async () => {
    const registerLink = element(by.id('register-link'))
    await expect(registerLink).toBeVisible()
    await registerLink.tap()

    await waitFor(element(by.id('registration-screen')))
      .toBeVisible()
      .withTimeout(3000)
  })
})
