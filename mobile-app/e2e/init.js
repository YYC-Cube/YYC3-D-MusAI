const detox = require('detox')
const config = require('../detox.config')

beforeAll(async () => {
  await detox.init(config, { initGlobals: true, reuse: true })
})

afterAll(async () => {
  await detox.cleanup()
})

beforeEach(async () => {
  await device.reloadReactNative()
})
