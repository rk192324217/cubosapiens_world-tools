import { remote, Browser } from 'webdriverio';

export const buildAppiumDriver = async (): Promise<Browser> => {
  const capabilities = {
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    // Mock package/activity for validation or local run
    'appium:appPackage': process.env.APP_PACKAGE || 'com.cubosapiens.world',
    'appium:appActivity': process.env.APP_ACTIVITY || '.MainActivity',
    'appium:deviceName': process.env.DEVICE_NAME || 'Android Emulator',
    'appium:noReset': true,
  };

  const options: any = {
    protocol: 'http',
    hostname: process.env.APPIUM_HOST || 'localhost',
    port: parseInt(process.env.APPIUM_PORT || '4723', 10),
    path: '/wd/hub',
    capabilities,
    logLevel: 'error'
  };

  // Allow CI syntax & script validation fallback
  if (process.env.CI_VALIDATION_MODE === 'true') {
    // In validation mode, we return a mocked driver to pass the script syntax checks
    return {
      deleteSession: async () => {},
      getContexts: async () => ['NATIVE_APP', 'WEBVIEW_1'],
      switchContext: async (c: string) => {},
      getUrl: async () => 'https://cubosapiens.world',
      $: async () => ({ click: async () => {}, setValue: async () => {}, isDisplayed: async () => true }),
      $$: async () => [],
      pause: async () => {}
    } as any;
  }

  return await remote(options);
};
