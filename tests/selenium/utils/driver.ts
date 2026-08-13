import { Builder, WebDriver, Capabilities } from 'selenium-webdriver';
import { Options } from 'selenium-webdriver/chrome';

export interface DriverOptions {
  headless?: boolean;
  width?: number;
  height?: number;
}

/**
 * Creates and configures a Chrome WebDriver instance.
 */
export async function createDriver(options: DriverOptions = {}): Promise<WebDriver> {
  const { headless = true, width = 1280, height = 800 } = options;

  const chromeOptions = new Options();
  
  if (headless) {
    chromeOptions.addArguments('--headless=new');
  }

  chromeOptions.addArguments(
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    `--window-size=${width},${height}`
  );

  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(chromeOptions)
    .build();

  return driver;
}

/**
 * Safely quits the WebDriver instance.
 */
export async function quitDriver(driver: WebDriver | null): Promise<void> {
  if (driver) {
    try {
      await driver.quit();
    } catch (error) {
      console.error('Error quitting driver:', error);
    }
  }
}