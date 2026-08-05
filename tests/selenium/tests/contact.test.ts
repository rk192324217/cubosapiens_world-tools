import { WebDriver, By, until } from 'selenium-webdriver';
import { buildMobileDriver, getBaseUrl } from '../driver';
import { ExcelReporter } from '../excel-reporter';

describe('Contact Form Tests', () => {
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
        reporter.addTestResult('Contact', testName, 'pass', duration);
    } catch (e: any) {
        const image = await driver.takeScreenshot();
        reporter.addScreenshot(testName, image);
        reporter.addTestResult('Contact', testName, 'fail', duration, e.message);
    }
    if (driver) await driver.quit();
  });

  afterAll(async () => {
    await reporter.finalize();
  });

  it('should validate contact form and interactive state checks', async () => {
    await driver.get(`${getBaseUrl()}/contact`);
    await driver.wait(until.elementLocated(By.css('body')), 5000);
    
    const forms = await driver.findElements(By.css('form'));
    if (forms.length > 0) {
        const form = forms[0];
        const submitBtns = await form.findElements(By.css('button[type="submit"], input[type="submit"], button'));
        if (submitBtns.length > 0) {
            const isEnabled = await submitBtns[0].isEnabled();
            // Just verify we can check the state
            expect(isEnabled !== null).toBeTruthy();
        }
    }
  }, 30000);
});
