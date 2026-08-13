import { WebDriver, By, until } from 'selenium-webdriver';
import { buildMobileDriver, getBaseUrl } from '../driver';
import { ExcelReporter } from '../excel-reporter';

describe('Navigation Tests', () => {
  let driver: WebDriver;
  let reporter: ExcelReporter;
  let testStartTime: number;

  beforeAll(async () => {
    reporter = new ExcelReporter();
  });

  beforeEach(async () => {
    driver = await buildMobileDriver();
    testStartTime = Date.now();
  });

  afterEach(async () => {
    const testName = expect.getState().currentTestName || 'unknown_test';
    const duration = Date.now() - testStartTime;
    try {
        reporter.addTestResult('Navigation', testName, 'pass', duration);
    } catch (e: any) {
        const image = await driver.takeScreenshot();
        reporter.addScreenshot(testName, image);
        reporter.addTestResult('Navigation', testName, 'fail', duration, e.message);
    }
    if (driver) await driver.quit();
  });

  afterAll(async () => {
    await reporter.finalize();
  });

  it('should traverse header links and update URL', async () => {
    await driver.get(getBaseUrl());
    await driver.wait(until.elementLocated(By.css('body')), 5000);
    
    // Find all links in the header/nav
    const links = await driver.findElements(By.css('nav a, header a'));
    if (links.length > 0) {
        const href = await links[0].getAttribute('href');
        if (href) {
            await driver.get(href);
            const currentUrl = await driver.getCurrentUrl();
            expect(currentUrl).toContain(href);
        }
    }
  }, 30000);
});
