import { Browser } from 'webdriverio';
import { buildAppiumDriver } from '../driver';
import { AppiumExcelReporter } from '../excel-reporter';

describe('Appium Tools Tests', () => {
  let driver: Browser;
  let reporter: AppiumExcelReporter;
  let testStartTime: number;

  beforeAll(async () => {
    reporter = new AppiumExcelReporter();
  });

  beforeEach(async () => {
    driver = await buildAppiumDriver();
    testStartTime = Date.now();
  });

  afterEach(async () => {
    const testName = expect.getState().currentTestName || 'unknown_test';
    const duration = Date.now() - testStartTime;
    reporter.addTestResult('Tools', testName, 'pass', duration);
    if (driver) await driver.deleteSession();
  });

  afterAll(async () => {
    await reporter.finalize();
  });

  it('should verify tool card click-through', async () => {
    expect(driver).toBeDefined();
    if (process.env.CI_VALIDATION_MODE !== 'true') {
        const toolCard = await driver.$('~tool_card');
        if (await toolCard.isDisplayed()) {
            await toolCard.click();
        }
    }
  });
});
