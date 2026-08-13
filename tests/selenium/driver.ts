import { Builder, WebDriver } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';

export const buildMobileDriver = async (): Promise<WebDriver> => {
  const options = new chrome.Options();
  options.addArguments('--headless=new');
  options.addArguments('--disable-gpu');
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  // Mobile viewport: 375x812 (iPhone X/11 Pro)
  options.windowSize({ width: 375, height: 812 });

  return new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();
};

export const getBaseUrl = () => {
    return process.env.BASE_URL || 'https://cubosapiens.world';
};
