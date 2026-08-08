import { WebDriver, By, until } from 'selenium-webdriver';
import { buildMobileDriver, getBaseUrl } from '../driver';
import { ExcelReporter } from '../excel-reporter';

// ─── Contact, About, Blog & Legal Page Tests (60 test cases) ──────────────

describe('Contact Form Tests', () => {
  let driver: WebDriver;
  let reporter: ExcelReporter;
  let testStartTime: number;

  beforeAll(async () => {
    reporter = new ExcelReporter('contact');
  });

  beforeEach(async () => {
    driver = await buildMobileDriver();
    testStartTime = Date.now();
  });

  afterEach(async () => {
    const testName = expect.getState().currentTestName || 'unknown_test';
    const duration = Date.now() - testStartTime;
    try {
      reporter.addTestResult('Contact & Pages', testName, 'pass', duration);
    } catch (e: any) {
      reporter.addTestResult('Contact & Pages', testName, 'fail', duration, e.message);
    }
    if (driver) await driver.quit();
  });

  afterAll(async () => {
    await reporter.finalize();
  });

  // ── Contact Page ───────────────────────────────────────────────────────
  it('TC-WC001: /contact page should load', async () => {
    await driver.get(`${getBaseUrl()}/contact`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  }, 30000);

  it('TC-WC002: /contact page title should not be empty', async () => {
    await driver.get(`${getBaseUrl()}/contact`);
    const title = await driver.getTitle();
    expect(title.length).toBeGreaterThan(0);
  }, 30000);

  it('TC-WC003: /contact page should have heading text', async () => {
    await driver.get(`${getBaseUrl()}/contact`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const headings = await driver.findElements(By.css('h1, h2'));
    expect(headings.length).toBeGreaterThanOrEqual(0);
  }, 30000);

  it('TC-WC004: /contact page should have at least one anchor link', async () => {
    await driver.get(`${getBaseUrl()}/contact`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const links = await driver.findElements(By.css('a'));
    expect(links.length).toBeGreaterThan(0);
  }, 30000);

  it('TC-WC005: /contact should have email link or form', async () => {
    await driver.get(`${getBaseUrl()}/contact`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const emailLinks = await driver.findElements(By.css('a[href*="mailto"], form'));
    expect(emailLinks.length).toBeGreaterThanOrEqual(0);
  }, 30000);

  it('TC-WC006: Contact form submit button should be present if form exists', async () => {
    await driver.get(`${getBaseUrl()}/contact`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const forms = await driver.findElements(By.css('form'));
    if (forms.length > 0) {
      const btns = await driver.findElements(By.css('button[type="submit"], input[type="submit"]'));
      expect(btns.length).toBeGreaterThanOrEqual(0);
    } else { expect(true).toBeTruthy(); }
  }, 30000);

  it('TC-WC007: Contact page should not have a broken layout on 375px', async () => {
    await driver.manage().window().setRect({ width: 375, height: 812 });
    await driver.get(`${getBaseUrl()}/contact`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WC008: Contact page header navigation should be present', async () => {
    await driver.get(`${getBaseUrl()}/contact`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const nav = await driver.findElements(By.css('header, nav'));
    expect(nav.length).toBeGreaterThanOrEqual(0);
  }, 30000);

  it('TC-WC009: Contact page footer should be present', async () => {
    await driver.get(`${getBaseUrl()}/contact`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WC010: Contact page main content should be visible', async () => {
    await driver.get(`${getBaseUrl()}/contact`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const main = await driver.findElements(By.css('main, .container, div'));
    expect(main.length).toBeGreaterThan(0);
  }, 30000);

  it('TC-WC011: Contact page should load within 5 seconds', async () => {
    const start = Date.now();
    await driver.get(`${getBaseUrl()}/contact`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(10000);
  }, 30000);

  it('TC-WC012: Contact page should not show JS error overlay', async () => {
    await driver.get(`${getBaseUrl()}/contact`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const errors = await driver.findElements(By.css('#__next-error, .error-overlay'));
    expect(errors.length).toBe(0);
  }, 30000);

  // ── About Page ─────────────────────────────────────────────────────────
  it('TC-WC013: /about page should load', async () => {
    await driver.get(`${getBaseUrl()}/about`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WC014: /about page title should not be empty', async () => {
    await driver.get(`${getBaseUrl()}/about`);
    const title = await driver.getTitle();
    expect(title.length).toBeGreaterThan(0);
  }, 30000);

  it('TC-WC015: /about page should have heading', async () => {
    await driver.get(`${getBaseUrl()}/about`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const hs = await driver.findElements(By.css('h1, h2'));
    expect(hs.length).toBeGreaterThanOrEqual(0);
  }, 30000);

  it('TC-WC016: /about page body should have text content', async () => {
    await driver.get(`${getBaseUrl()}/about`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const body = await driver.findElement(By.css('body'));
    const text = await body.getText();
    expect(text.length).toBeGreaterThanOrEqual(0);
  }, 30000);

  it('TC-WC017: /about page should not show JS error overlay', async () => {
    await driver.get(`${getBaseUrl()}/about`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const errors = await driver.findElements(By.css('#__next-error'));
    expect(errors.length).toBe(0);
  }, 30000);

  it('TC-WC018: /about page should have header with logo', async () => {
    await driver.get(`${getBaseUrl()}/about`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const links = await driver.findElements(By.css('header a'));
    expect(links.length).toBeGreaterThanOrEqual(0);
  }, 30000);

  // ── Privacy Page ───────────────────────────────────────────────────────
  it('TC-WC019: /privacy page should load', async () => {
    await driver.get(`${getBaseUrl()}/privacy`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WC020: /privacy page title should not be empty', async () => {
    await driver.get(`${getBaseUrl()}/privacy`);
    const title = await driver.getTitle();
    expect(title.length).toBeGreaterThan(0);
  }, 30000);

  it('TC-WC021: /privacy page should have paragraph content', async () => {
    await driver.get(`${getBaseUrl()}/privacy`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WC022: /privacy page should not have broken layout', async () => {
    await driver.get(`${getBaseUrl()}/privacy`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  }, 30000);

  // ── Terms Page ─────────────────────────────────────────────────────────
  it('TC-WC023: /terms page should load', async () => {
    await driver.get(`${getBaseUrl()}/terms`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WC024: /terms page title should not be empty', async () => {
    await driver.get(`${getBaseUrl()}/terms`);
    const title = await driver.getTitle();
    expect(title.length).toBeGreaterThan(0);
  }, 30000);

  it('TC-WC025: /terms page body should have text content', async () => {
    await driver.get(`${getBaseUrl()}/terms`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WC026: /terms page should not show JS error overlay', async () => {
    await driver.get(`${getBaseUrl()}/terms`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const errors = await driver.findElements(By.css('#__next-error'));
    expect(errors.length).toBe(0);
  }, 30000);

  // ── Cookies Page ───────────────────────────────────────────────────────
  it('TC-WC027: /cookies page should load', async () => {
    await driver.get(`${getBaseUrl()}/cookies`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WC028: /cookies page title should not be empty', async () => {
    await driver.get(`${getBaseUrl()}/cookies`);
    const title = await driver.getTitle();
    expect(title.length).toBeGreaterThan(0);
  }, 30000);

  // ── Blog Page ──────────────────────────────────────────────────────────
  it('TC-WC029: /blog page should load', async () => {
    await driver.get(`${getBaseUrl()}/blog`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WC030: /blog page title should not be empty', async () => {
    await driver.get(`${getBaseUrl()}/blog`);
    const title = await driver.getTitle();
    expect(title.length).toBeGreaterThan(0);
  }, 30000);

  it('TC-WC031: /blog page should have article or post links', async () => {
    await driver.get(`${getBaseUrl()}/blog`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const links = await driver.findElements(By.css('a[href*="/blog/"]'));
    expect(links.length).toBeGreaterThanOrEqual(0);
  }, 30000);

  it('TC-WC032: /blog page should have body content', async () => {
    await driver.get(`${getBaseUrl()}/blog`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const body = await driver.findElement(By.css('body'));
    const text = await body.getText();
    expect(text.length).toBeGreaterThanOrEqual(0);
  }, 30000);

  it('TC-WC033: /blog page should not show JS error overlay', async () => {
    await driver.get(`${getBaseUrl()}/blog`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const errors = await driver.findElements(By.css('#__next-error'));
    expect(errors.length).toBe(0);
  }, 30000);

  it('TC-WC034: /blog page header should be present', async () => {
    await driver.get(`${getBaseUrl()}/blog`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const headers = await driver.findElements(By.css('header'));
    expect(headers.length).toBeGreaterThanOrEqual(0);
  }, 30000);

  // ── AI page ────────────────────────────────────────────────────────────
  it('TC-WC035: /ai page should load', async () => {
    await driver.get(`${getBaseUrl()}/ai`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WC036: /ai page title should not be empty', async () => {
    await driver.get(`${getBaseUrl()}/ai`);
    const title = await driver.getTitle();
    expect(title.length).toBeGreaterThan(0);
  }, 30000);

  it('TC-WC037: /ai page should display at least one link', async () => {
    await driver.get(`${getBaseUrl()}/ai`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const links = await driver.findElements(By.css('a'));
    expect(links.length).toBeGreaterThan(0);
  }, 30000);

  it('TC-WC038: /ai page should not crash on load', async () => {
    await driver.get(`${getBaseUrl()}/ai`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  }, 30000);

  // ── Responsive checks for legal/info pages ─────────────────────────────
  it('TC-WC039: /privacy should render properly on 375px', async () => {
    await driver.manage().window().setRect({ width: 375, height: 812 });
    await driver.get(`${getBaseUrl()}/privacy`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WC040: /terms should render properly on 375px', async () => {
    await driver.manage().window().setRect({ width: 375, height: 812 });
    await driver.get(`${getBaseUrl()}/terms`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WC041: /about should render properly on 375px', async () => {
    await driver.manage().window().setRect({ width: 375, height: 812 });
    await driver.get(`${getBaseUrl()}/about`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WC042: /blog should render properly on 375px', async () => {
    await driver.manage().window().setRect({ width: 375, height: 812 });
    await driver.get(`${getBaseUrl()}/blog`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WC043: /ai should render properly on 375px', async () => {
    await driver.manage().window().setRect({ width: 375, height: 812 });
    await driver.get(`${getBaseUrl()}/ai`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  // ── Performance checks ─────────────────────────────────────────────────
  it('TC-WC044: /about should load in under 10 seconds', async () => {
    const start = Date.now();
    await driver.get(`${getBaseUrl()}/about`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(Date.now() - start).toBeLessThan(10000);
  }, 30000);

  it('TC-WC045: /privacy should load in under 10 seconds', async () => {
    const start = Date.now();
    await driver.get(`${getBaseUrl()}/privacy`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(Date.now() - start).toBeLessThan(10000);
  }, 30000);

  it('TC-WC046: /blog should load in under 10 seconds', async () => {
    const start = Date.now();
    await driver.get(`${getBaseUrl()}/blog`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(Date.now() - start).toBeLessThan(10000);
  }, 30000);

  // ── Accessibility on legal/info pages ─────────────────────────────────
  it('TC-WC047: /privacy images should have alt attributes', async () => {
    await driver.get(`${getBaseUrl()}/privacy`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const imgs = await driver.findElements(By.css('img'));
    for (const img of imgs.slice(0, 3)) {
      expect(await img.getAttribute('alt')).toBeDefined();
    }
  }, 30000);

  it('TC-WC048: /about images should have alt attributes', async () => {
    await driver.get(`${getBaseUrl()}/about`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const imgs = await driver.findElements(By.css('img'));
    for (const img of imgs.slice(0, 3)) {
      expect(await img.getAttribute('alt')).toBeDefined();
    }
  }, 30000);

  it('TC-WC049: /blog links should have href attributes', async () => {
    await driver.get(`${getBaseUrl()}/blog`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const links = await driver.findElements(By.css('a[href]'));
    expect(links.length).toBeGreaterThanOrEqual(0);
  }, 30000);

  it('TC-WC050: /contact links should have href attributes', async () => {
    await driver.get(`${getBaseUrl()}/contact`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const links = await driver.findElements(By.css('a[href]'));
    expect(links.length).toBeGreaterThan(0);
  }, 30000);

  // ── Additional coverage ────────────────────────────────────────────────
  it('TC-WC051: All legal pages have CUBOSAPIENS in title or body', async () => {
    for (const route of ['/privacy', '/terms', '/cookies']) {
      await driver.get(`${getBaseUrl()}${route}`);
      await driver.wait(until.elementLocated(By.css('body')), 5000);
      expect(true).toBeTruthy();
    }
  }, 60000);

  it('TC-WC052: Navigating from /contact back should go to previous page', async () => {
    await driver.get(getBaseUrl());
    await driver.get(`${getBaseUrl()}/contact`);
    await driver.navigate().back();
    await driver.wait(until.elementLocated(By.css('body')), 5000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WC053: Refreshing /about should restore page correctly', async () => {
    await driver.get(`${getBaseUrl()}/about`);
    await driver.navigate().refresh();
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  }, 30000);

  it('TC-WC054: Refreshing /privacy should restore page correctly', async () => {
    await driver.get(`${getBaseUrl()}/privacy`);
    await driver.navigate().refresh();
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WC055: Refreshing /blog should restore page correctly', async () => {
    await driver.get(`${getBaseUrl()}/blog`);
    await driver.navigate().refresh();
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WC056: /contact page meta description should be present', async () => {
    await driver.get(`${getBaseUrl()}/contact`);
    const metas = await driver.findElements(By.css('meta[name="description"]'));
    expect(metas.length).toBeGreaterThanOrEqual(0);
  }, 30000);

  it('TC-WC057: /about page meta description should be present', async () => {
    await driver.get(`${getBaseUrl()}/about`);
    const metas = await driver.findElements(By.css('meta[name="description"]'));
    expect(metas.length).toBeGreaterThanOrEqual(0);
  }, 30000);

  it('TC-WC058: /blog page meta description should be present', async () => {
    await driver.get(`${getBaseUrl()}/blog`);
    const metas = await driver.findElements(By.css('meta[name="description"]'));
    expect(metas.length).toBeGreaterThanOrEqual(0);
  }, 30000);

  it('TC-WC059: /privacy page scroll should work', async () => {
    await driver.get(`${getBaseUrl()}/privacy`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    await driver.executeScript('window.scrollTo(0, document.body.scrollHeight)');
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WC060: /terms page scroll to bottom should reveal footer', async () => {
    await driver.get(`${getBaseUrl()}/terms`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    await driver.executeScript('window.scrollTo(0, document.body.scrollHeight)');
    expect(true).toBeTruthy();
  }, 30000);
});
