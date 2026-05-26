/** @type {import('detox').DetoxConfig} */
module.exports = {
  /**
   * Test Runner Configuration (Detox 20.x style)
   * Using 'jest' as test runner with custom config
   */
  runnerConfig: 'e2e/config.js',

  /**
   * Apps Configuration
   * Define all build artifacts (iOS apps, Android APKs)
   *
   * Note for Expo projects:
   * - iOS workspace name is based on app.json "name" field (hyphens removed)
   * - Build paths use standard Xcode output locations
   */
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath:
        'ios/build/Build/Products/Debug-iphonesimulator/DMusic.app',
      build:
        'xcodebuild -workspace ios/DMusic.xcworkspace -scheme DMusic -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build',
    },
    'ios.release': {
      type: 'ios.app',
      binaryPath:
        'ios/build/Build/Products/Release-iphonesimulator/DMusic.app',
      build:
        'xcodebuild -workspace ios/DMusic.xcworkspace -scheme DMusic -configuration Release -sdk iphonesimulator -derivedDataPath ios/build',
    },
    'android.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build:
        'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug',
      testBinaryPath:
        'android/app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk',
    },
    'android.release': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/release/app-release.apk',
      build:
        'cd android && ./gradlew assembleRelease assembleAndroidTest -DtestBuildType=release',
      testBinaryPath:
        'android/app/build/outputs/apk/androidTest/release/app-release-androidTest.apk',
    },
  },

  /**
   * Devices Configuration
   * Define test devices (iOS simulators, Android emulators, physical devices)
   */
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 15 Pro',
        os: 'iOS 17.0',
      },
    },
    emulator: {
      type: 'android.emulator',
      device: {
        avdName: 'Pixel_6_API_34',
      },
    },
    attached: {
      type: 'android.attached',
      device: {
        adbName: '.*',
      },
    },
  },

  /**
   * Configurations
   * Map devices to apps for specific test scenarios
   */
  configurations: {
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug',
    },
    'ios.sim.release': {
      device: 'simulator',
      app: 'ios.release',
    },
    'android.emu.debug': {
      device: 'emulator',
      app: 'android.debug',
    },
    'android.emu.release': {
      device: 'emulator',
      app: 'android.release',
    },
    'android.device.debug': {
      device: 'attached',
      app: 'android.debug',
    },
  },

  /**
   * Behavior Settings
   */
  behavior: {
    init: {
      exposeGlobals: true,
      reinstallApp: true,
    },
    cleanup: {
      shutdownDevice: false,
    },
  },
}
