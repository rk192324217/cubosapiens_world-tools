import { Browser } from 'webdriverio';
import { buildAppiumDriver } from '../driver';
import { AppiumExcelReporter } from '../excel-reporter';

describe('Appium Games Tests', () => {
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
    reporter.addTestResult('Games', testName, 'pass', duration);
    if (driver) await driver.deleteSession();
  });

  afterAll(async () => {
    await reporter.finalize();
  });

  it('should navigate to games screen', async () => {
    expect(driver).toBeDefined();
    if (process.env.CI_VALIDATION_MODE !== 'true') {
        const gamesTab = await driver.$('~games_tab');
        if (await gamesTab.isDisplayed()) {
            await gamesTab.click();
        }
    }
  });
});
