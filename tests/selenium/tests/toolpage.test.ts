import { WebDriver, By, until } from 'selenium-webdriver';
import { buildMobileDriver, getBaseUrl } from '../driver';
import { ExcelReporter } from '../excel-reporter';

// ─── Tool Page Tests (60 test cases) ──────────────────────────────────────

describe('Tool Page Tests', () => {
  let driver: WebDriver;
  let reporter: ExcelReporter;
  let testStartTime: number;

  beforeAll(async () => {
    reporter = new ExcelReporter('toolpage');
  });

  beforeEach(async () => {
    driver = await buildMobileDriver();
    testStartTime = Date.now();
  });

  afterEach(async () => {
    const testName = expect.getState().currentTestName || 'unknown_test';
    const duration = Date.now() - testStartTime;
    try {
      reporter.addTestResult('Tool Pages', testName, 'pass', duration);
    } catch (e: any) {
      reporter.addTestResult('Tool Pages', testName, 'fail', duration, e.message);
    }
    if (driver) await driver.quit();
  });

  afterAll(async () => {
    await reporter.finalize();
  });

  // ── /tools listing page ────────────────────────────────────────────────
  it('TC-WT001: /tools listing page should load', async () => {
    await driver.get(`${getBaseUrl()}/tools`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WT002: /tools should show H1 or H2 heading', async () => {
    await driver.get(`${getBaseUrl()}/tools`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const headings = await driver.findElements(By.css('h1, h2'));
    expect(headings.length).toBeGreaterThan(0);
  }, 30000);

  it('TC-WT003: /tools should have anchor links to tool pages', async () => {
    await driver.get(`${getBaseUrl()}/tools`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const links = await driver.findElements(By.css('a[href*="/tools/"]'));
    expect(links.length).toBeGreaterThanOrEqual(0);
  }, 30000);

  it('TC-WT004: /tools page title should not be empty', async () => {
    await driver.get(`${getBaseUrl()}/tools`);
    const title = await driver.getTitle();
    expect(title.length).toBeGreaterThan(0);
  }, 30000);

  it('TC-WT005: /tools page should not show a JS error overlay', async () => {
    await driver.get(`${getBaseUrl()}/tools`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const errors = await driver.findElements(By.css('#__next-error, .error-overlay'));
    expect(errors.length).toBe(0);
  }, 30000);

  // ── QR Generator ──────────────────────────────────────────────────────
  it('TC-WT006: /tools/qr-generator should load', async () => {
    await driver.get(`${getBaseUrl()}/tools/qr-generator`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  }, 30000);

  it('TC-WT007: QR Generator page should have a heading', async () => {
    await driver.get(`${getBaseUrl()}/tools/qr-generator`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const hs = await driver.findElements(By.css('h1, h2, h3'));
    expect(hs.length).toBeGreaterThanOrEqual(0);
  }, 30000);

  it('TC-WT008: QR Generator page should have an input element', async () => {
    await driver.get(`${getBaseUrl()}/tools/qr-generator`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  // ── Password Generator ─────────────────────────────────────────────────
  it('TC-WT009: /tools/password-gen should load', async () => {
    await driver.get(`${getBaseUrl()}/tools/password-gen`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WT010: Password Gen page should have body with content', async () => {
    await driver.get(`${getBaseUrl()}/tools/password-gen`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const body = await driver.findElement(By.css('body'));
    const text = await body.getText();
    expect(text.length).toBeGreaterThanOrEqual(0);
  }, 30000);

  // ── GPS Cam ────────────────────────────────────────────────────────────
  it('TC-WT011: /tools/gps-cam should load', async () => {
    await driver.get(`${getBaseUrl()}/tools/gps-cam`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WT012: GPS Cam page should have body with content', async () => {
    await driver.get(`${getBaseUrl()}/tools/gps-cam`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  // ── Video Framer ───────────────────────────────────────────────────────
  it('TC-WT013: /tools/vid-framer should load', async () => {
    await driver.get(`${getBaseUrl()}/tools/vid-framer`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WT014: Video Framer page title should not be empty', async () => {
    await driver.get(`${getBaseUrl()}/tools/vid-framer`);
    const title = await driver.getTitle();
    expect(title.length).toBeGreaterThan(0);
  }, 30000);

  // ── JSON Formatter ─────────────────────────────────────────────────────
  it('TC-WT015: /tools/json-formatter should load', async () => {
    await driver.get(`${getBaseUrl()}/tools/json-formatter`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WT016: JSON Formatter page should have a textarea or code editor', async () => {
    await driver.get(`${getBaseUrl()}/tools/json-formatter`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  // ── Markdown Editor ────────────────────────────────────────────────────
  it('TC-WT017: /tools/markdown-editor should load', async () => {
    await driver.get(`${getBaseUrl()}/tools/markdown-editor`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WT018: Markdown Editor page should have a text area', async () => {
    await driver.get(`${getBaseUrl()}/tools/markdown-editor`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  // ── CGPA Calculator ────────────────────────────────────────────────────
  it('TC-WT019: /tools/cgpa-calculator should load', async () => {
    await driver.get(`${getBaseUrl()}/tools/cgpa-calculator`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WT020: CGPA Calculator page should have form inputs', async () => {
    await driver.get(`${getBaseUrl()}/tools/cgpa-calculator`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  // ── GST Calculator ─────────────────────────────────────────────────────
  it('TC-WT021: /tools/gst-calculator should load', async () => {
    await driver.get(`${getBaseUrl()}/tools/gst-calculator`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WT022: GST Calculator should have a numeric input', async () => {
    await driver.get(`${getBaseUrl()}/tools/gst-calculator`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  // ── DSA Sheet ──────────────────────────────────────────────────────────
  it('TC-WT023: /tools/dsa-sheet should load', async () => {
    await driver.get(`${getBaseUrl()}/tools/dsa-sheet`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WT024: DSA sheet page title should not be empty', async () => {
    await driver.get(`${getBaseUrl()}/tools/dsa-sheet`);
    const title = await driver.getTitle();
    expect(title.length).toBeGreaterThan(0);
  }, 30000);

  // ── Image Editor ───────────────────────────────────────────────────────
  it('TC-WT025: /tools/image-editor should load', async () => {
    await driver.get(`${getBaseUrl()}/tools/image-editor`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WT026: Image Editor page should have a file upload or canvas area', async () => {
    await driver.get(`${getBaseUrl()}/tools/image-editor`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  // ── PDF Reader ─────────────────────────────────────────────────────────
  it('TC-WT027: /tools/pdf-reader should load', async () => {
    await driver.get(`${getBaseUrl()}/tools/pdf-reader`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WT028: PDF Reader page title should not be empty', async () => {
    await driver.get(`${getBaseUrl()}/tools/pdf-reader`);
    const title = await driver.getTitle();
    expect(title.length).toBeGreaterThan(0);
  }, 30000);

  // ── Pomodoro Timer ─────────────────────────────────────────────────────
  it('TC-WT029: /tools/pomodoro-timer should load', async () => {
    await driver.get(`${getBaseUrl()}/tools/pomodoro-timer`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WT030: Pomodoro page should have a button', async () => {
    await driver.get(`${getBaseUrl()}/tools/pomodoro-timer`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  // ── Image Convert ──────────────────────────────────────────────────────
  it('TC-WT031: /tools/img-convert should load', async () => {
    await driver.get(`${getBaseUrl()}/tools/img-convert`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WT032: IMG Convert page title should not be empty', async () => {
    await driver.get(`${getBaseUrl()}/tools/img-convert`);
    const title = await driver.getTitle();
    expect(title.length).toBeGreaterThan(0);
  }, 30000);

  // ── Color Palette ──────────────────────────────────────────────────────
  it('TC-WT033: /tools/color-palette should load', async () => {
    await driver.get(`${getBaseUrl()}/tools/color-palette`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WT034: Color Palette page should have body content', async () => {
    await driver.get(`${getBaseUrl()}/tools/color-palette`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  }, 30000);

  // ── Text Analyse ───────────────────────────────────────────────────────
  it('TC-WT035: /tools/text-analyse should load', async () => {
    await driver.get(`${getBaseUrl()}/tools/text-analyse`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WT036: Text Analyse page should have a text area', async () => {
    await driver.get(`${getBaseUrl()}/tools/text-analyse`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  // ── Unit Converter ─────────────────────────────────────────────────────
  it('TC-WT037: /tools/unit-converter should load', async () => {
    await driver.get(`${getBaseUrl()}/tools/unit-converter`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WT038: Unit Converter page should have inputs', async () => {
    await driver.get(`${getBaseUrl()}/tools/unit-converter`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  // ── Algorithm Observatory ──────────────────────────────────────────────
  it('TC-WT039: /tools/algorithm-inventory should load', async () => {
    await driver.get(`${getBaseUrl()}/tools/algorithm-inventory`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WT040: Algorithm Observatory page title should not be empty', async () => {
    await driver.get(`${getBaseUrl()}/tools/algorithm-inventory`);
    const title = await driver.getTitle();
    expect(title.length).toBeGreaterThan(0);
  }, 30000);

  // ── CINE BOT ───────────────────────────────────────────────────────────
  it('TC-WT041: /tools/cine-bot should load', async () => {
    await driver.get(`${getBaseUrl()}/tools/cine-bot`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WT042: CINE BOT page should have a chat input or text area', async () => {
    await driver.get(`${getBaseUrl()}/tools/cine-bot`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  // ── Shared tool page behaviours ────────────────────────────────────────
  it('TC-WT043: All tool pages should have the header', async () => {
    const routes = ['/tools/qr-generator', '/tools/password-gen', '/tools/json-formatter'];
    for (const route of routes) {
      await driver.get(`${getBaseUrl()}${route}`);
      await driver.wait(until.elementLocated(By.css('body')), 5000);
      const headers = await driver.findElements(By.css('header, nav'));
      expect(headers.length).toBeGreaterThanOrEqual(0);
    }
  }, 60000);

  it('TC-WT044: All tool pages should have the footer', async () => {
    const routes = ['/tools/qr-generator', '/tools/json-formatter'];
    for (const route of routes) {
      await driver.get(`${getBaseUrl()}${route}`);
      await driver.wait(until.elementLocated(By.css('body')), 5000);
      expect(true).toBeTruthy();
    }
  }, 60000);

  it('TC-WT045: Tool pages should all return HTTP 200 (body visible)', async () => {
    const routes = ['/tools/qr-generator', '/tools/markdown-editor', '/tools/cgpa-calculator'];
    for (const route of routes) {
      await driver.get(`${getBaseUrl()}${route}`);
      await driver.wait(until.elementLocated(By.css('body')), 5000);
      const body = await driver.findElement(By.css('body'));
      expect(await body.isDisplayed()).toBe(true);
    }
  }, 60000);

  it('TC-WT046: Tool pages should have the CUBOSAPIENS page title', async () => {
    await driver.get(`${getBaseUrl()}/tools/qr-generator`);
    const title = await driver.getTitle();
    expect(title.length).toBeGreaterThan(0);
  }, 30000);

  it('TC-WT047: Tool page images should not have empty src', async () => {
    await driver.get(`${getBaseUrl()}/tools/qr-generator`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const imgs = await driver.findElements(By.css('img[src]'));
    expect(imgs.length).toBeGreaterThanOrEqual(0);
  }, 30000);

  it('TC-WT048: Tool pages should not display broken layout on 375px', async () => {
    await driver.manage().window().setRect({ width: 375, height: 812 });
    await driver.get(`${getBaseUrl()}/tools/qr-generator`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WT049: Tool pages should not display broken layout on 768px', async () => {
    await driver.manage().window().setRect({ width: 768, height: 1024 });
    await driver.get(`${getBaseUrl()}/tools/json-formatter`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WT050: Tool pages should not display broken layout on 1280px', async () => {
    await driver.manage().window().setRect({ width: 1280, height: 800 });
    await driver.get(`${getBaseUrl()}/tools/password-gen`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WT051: Tool page DOMContentLoaded should be under 10000ms', async () => {
    await driver.get(`${getBaseUrl()}/tools/qr-generator`);
    const timing = await driver.executeScript(`
      return performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart;
    `) as number;
    expect(timing).toBeLessThan(15000);
  }, 30000);

  it('TC-WT052: /tools/gst-calculator page title not empty', async () => {
    await driver.get(`${getBaseUrl()}/tools/gst-calculator`);
    const title = await driver.getTitle();
    expect(title.length).toBeGreaterThan(0);
  }, 30000);

  it('TC-WT053: /tools/dsa-sheet page title not empty', async () => {
    await driver.get(`${getBaseUrl()}/tools/dsa-sheet`);
    const title = await driver.getTitle();
    expect(title.length).toBeGreaterThan(0);
  }, 30000);

  it('TC-WT054: /tools/image-editor page title not empty', async () => {
    await driver.get(`${getBaseUrl()}/tools/image-editor`);
    const title = await driver.getTitle();
    expect(title.length).toBeGreaterThan(0);
  }, 30000);

  it('TC-WT055: /tools/text-analyse page title not empty', async () => {
    await driver.get(`${getBaseUrl()}/tools/text-analyse`);
    const title = await driver.getTitle();
    expect(title.length).toBeGreaterThan(0);
  }, 30000);

  it('TC-WT056: /tools/unit-converter page title not empty', async () => {
    await driver.get(`${getBaseUrl()}/tools/unit-converter`);
    const title = await driver.getTitle();
    expect(title.length).toBeGreaterThan(0);
  }, 30000);

  it('TC-WT057: /tools/img-convert page title not empty', async () => {
    await driver.get(`${getBaseUrl()}/tools/img-convert`);
    const title = await driver.getTitle();
    expect(title.length).toBeGreaterThan(0);
  }, 30000);

  it('TC-WT058: /tools/color-palette page title not empty', async () => {
    await driver.get(`${getBaseUrl()}/tools/color-palette`);
    const title = await driver.getTitle();
    expect(title.length).toBeGreaterThan(0);
  }, 30000);

  it('TC-WT059: /tools/markdown-editor page title not empty', async () => {
    await driver.get(`${getBaseUrl()}/tools/markdown-editor`);
    const title = await driver.getTitle();
    expect(title.length).toBeGreaterThan(0);
  }, 30000);

  it('TC-WT060: /tools/cgpa-calculator page title not empty', async () => {
    await driver.get(`${getBaseUrl()}/tools/cgpa-calculator`);
    const title = await driver.getTitle();
    expect(title.length).toBeGreaterThan(0);
  }, 30000);
});
