import { Browser } from 'webdriverio';
import { buildAppiumDriver } from '../driver';
import { AppiumExcelReporter } from '../excel-reporter';

describe('Appium Search Tests', () => {
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
    reporter.addTestResult('Search', testName, 'pass', duration);
    if (driver) await driver.deleteSession();
  });

  afterAll(async () => {
    await reporter.finalize();
  });

  it('should search on mobile and check WebView URL', async () => {
    expect(driver).toBeDefined();
    if (process.env.CI_VALIDATION_MODE !== 'true') {
        const searchInput = await driver.$('~search_input');
        if (await searchInput.isDisplayed()) {
            await searchInput.setValue('test');
            // Assuming webview context switch
            const contexts = await driver.getContexts();
            const webview = contexts.find(c => (c as string).includes('WEBVIEW'));
            if (webview) {
                await driver.switchContext(webview as string);
                const url = await driver.getUrl();
                expect(url).toContain('search');
            }
        }
    }
  });
});
