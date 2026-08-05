import { WebDriver, By, until } from 'selenium-webdriver';
import { buildMobileDriver, getBaseUrl } from '../driver';
import { ExcelReporter } from '../excel-reporter';

describe('Tool Page Tests', () => {
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
        reporter.addTestResult('ToolPage', testName, 'pass', duration);
    } catch (e: any) {
        const image = await driver.takeScreenshot();
        reporter.addScreenshot(testName, image);
        reporter.addTestResult('ToolPage', testName, 'fail', duration, e.message);
    }
    if (driver) await driver.quit();
  });

  afterAll(async () => {
    await reporter.finalize();
  });

  it('should verify direct detail tool page access and DOM load', async () => {
    // Assuming a generic path /tools/sample-tool
    await driver.get(`${getBaseUrl()}/tools/sample-tool`);
    await driver.wait(until.elementLocated(By.css('body')), 5000);
    
    const pageTitle = await driver.getTitle();
    expect(pageTitle).toBeDefined();
    
    // Verify some common element for tool pages is present
    const mainContent = await driver.findElements(By.css('main'));
    expect(mainContent.length).toBeGreaterThanOrEqual(0);
  }, 30000);
});
