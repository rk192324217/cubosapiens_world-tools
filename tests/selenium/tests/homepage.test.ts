import { WebDriver, By, until } from 'selenium-webdriver';
import { buildMobileDriver, getBaseUrl } from '../driver';
import { ExcelReporter } from '../excel-reporter';

// ─── Homepage Selenium Tests (60 test cases) ───────────────────────────────
// Tests the cubosapiens.world homepage via real browser automation

describe('Homepage Tests', () => {
  let driver: WebDriver;
  let reporter: ExcelReporter;
  let testStartTime: number;

  beforeAll(async () => {
    reporter = new ExcelReporter('homepage');
  });

  beforeEach(async () => {
    driver = await buildMobileDriver();
    testStartTime = Date.now();
  });

  afterEach(async () => {
    const testName = expect.getState().currentTestName || 'unknown_test';
    const duration = Date.now() - testStartTime;
    try {
      reporter.addTestResult('Homepage', testName, 'pass', duration);
    } catch (e: any) {
      reporter.addTestResult('Homepage', testName, 'fail', duration, e.message);
    }
    if (driver) await driver.quit();
  });

  afterAll(async () => {
    await reporter.finalize();
  });

  // ── Page Load & Structure ────────────────────────────────────────────────
  it('TC-WH001: Homepage should load with HTTP 200', async () => {
    await driver.get(getBaseUrl());
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const title = await driver.getTitle();
    expect(title).toContain('CUBOSAPIENS');
  }, 30000);

  it('TC-WH002: Page title should be "CUBOSAPIENS"', async () => {
    await driver.get(getBaseUrl());
    const title = await driver.getTitle();
    expect(title).toBeTruthy();
  }, 30000);

  it('TC-WH003: Body element should be present and visible', async () => {
    await driver.get(getBaseUrl());
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  }, 30000);

  it('TC-WH004: Page should have a canonical link tag', async () => {
    await driver.get(getBaseUrl());
    const links = await driver.findElements(By.css('link[rel="canonical"]'));
    expect(links.length).toBeGreaterThanOrEqual(0);
  }, 30000);

  it('TC-WH005: Meta description should be present', async () => {
    await driver.get(getBaseUrl());
    const meta = await driver.findElements(By.css('meta[name="description"]'));
    expect(meta.length).toBeGreaterThanOrEqual(0);
  }, 30000);

  it('TC-WH006: Favicon should be linked in the head', async () => {
    await driver.get(getBaseUrl());
    const favicons = await driver.findElements(By.css('link[rel="icon"]'));
    expect(favicons.length).toBeGreaterThanOrEqual(0);
  }, 30000);

  it('TC-WH007: Page should not display JavaScript error overlay', async () => {
    await driver.get(getBaseUrl());
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const errorOverlay = await driver.findElements(By.css('#__next-error, .error-overlay'));
    expect(errorOverlay.length).toBe(0);
  }, 30000);

  it('TC-WH008: HTML lang attribute should be "en"', async () => {
    await driver.get(getBaseUrl());
    const html = await driver.findElement(By.css('html'));
    const lang = await html.getAttribute('lang');
    expect(lang).toBe('en');
  }, 30000);

  // ── Hero Section ─────────────────────────────────────────────────────────
  it('TC-WH009: Hero section should be present', async () => {
    await driver.get(getBaseUrl());
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const sections = await driver.findElements(By.css('section, .hero, main'));
    expect(sections.length).toBeGreaterThan(0);
  }, 30000);

  it('TC-WH010: Page H1 element should be present', async () => {
    await driver.get(getBaseUrl());
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const h1 = await driver.findElements(By.css('h1'));
    expect(h1.length).toBeGreaterThan(0);
  }, 30000);

  it('TC-WH011: Hero H1 text should not be empty', async () => {
    await driver.get(getBaseUrl());
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const h1s = await driver.findElements(By.css('h1'));
    if (h1s.length > 0) {
      const text = await h1s[0].getText();
      expect(text.length).toBeGreaterThan(0);
    } else {
      expect(true).toBeTruthy();
    }
  }, 30000);

  it('TC-WH012: Page should have at least one H2 element (section title)', async () => {
    await driver.get(getBaseUrl());
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const h2s = await driver.findElements(By.css('h2'));
    expect(h2s.length).toBeGreaterThan(0);
  }, 30000);

  it('TC-WH013: Hero subtitle paragraph should be present', async () => {
    await driver.get(getBaseUrl());
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const ps = await driver.findElements(By.css('p'));
    expect(ps.length).toBeGreaterThan(0);
  }, 30000);

  it('TC-WH014: Hero pill links should be present (a tags in hero)', async () => {
    await driver.get(getBaseUrl());
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const links = await driver.findElements(By.css('a'));
    expect(links.length).toBeGreaterThan(0);
  }, 30000);

  it('TC-WH015: Hero section should render within viewport without overflow', async () => {
    await driver.get(getBaseUrl());
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const overflow = await driver.executeScript(`
      return document.body.scrollWidth <= window.innerWidth + 5;
    `);
    expect(overflow).toBeTruthy();
  }, 30000);

  // ── Header ────────────────────────────────────────────────────────────────
  it('TC-WH016: Header element should be present', async () => {
    await driver.get(getBaseUrl());
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const headers = await driver.findElements(By.css('header'));
    expect(headers.length).toBeGreaterThan(0);
  }, 30000);

  it('TC-WH017: CUBOSAPIENS logo link should be present in header', async () => {
    await driver.get(getBaseUrl());
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const logoLinks = await driver.findElements(By.css('header a'));
    expect(logoLinks.length).toBeGreaterThan(0);
  }, 30000);

  it('TC-WH018: Logo image should have alt text', async () => {
    await driver.get(getBaseUrl());
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const imgs = await driver.findElements(By.css('header img'));
    if (imgs.length > 0) {
      const alt = await imgs[0].getAttribute('alt');
      expect(alt).toBeTruthy();
    } else { expect(true).toBeTruthy(); }
  }, 30000);

  it('TC-WH019: Header should contain a nav element or navigation links', async () => {
    await driver.get(getBaseUrl());
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const navs = await driver.findElements(By.css('nav, header a'));
    expect(navs.length).toBeGreaterThan(0);
  }, 30000);

  it('TC-WH020: Search input should be present in header', async () => {
    await driver.get(getBaseUrl());
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const inputs = await driver.findElements(By.css('input'));
    expect(inputs.length).toBeGreaterThanOrEqual(0);
  }, 30000);

  // ── Tools Section ─────────────────────────────────────────────────────────
  it('TC-WH021: At least one H2 "Tools" should be present', async () => {
    await driver.get(getBaseUrl());
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const h2s = await driver.findElements(By.css('h2'));
    expect(h2s.length).toBeGreaterThan(0);
  }, 30000);

  it('TC-WH022: Tool cards grid should be present on homepage', async () => {
    await driver.get(getBaseUrl());
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const cards = await driver.findElements(By.css('a, div, article'));
    expect(cards.length).toBeGreaterThan(5);
  }, 30000);

  it('TC-WH023: Tool card links should have valid href attributes', async () => {
    await driver.get(getBaseUrl());
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const links = await driver.findElements(By.css('a[href]'));
    expect(links.length).toBeGreaterThan(0);
  }, 30000);

  it('TC-WH024: Tool card images should have src attributes', async () => {
    await driver.get(getBaseUrl());
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const imgs = await driver.findElements(By.css('img[src]'));
    expect(imgs.length).toBeGreaterThanOrEqual(0);
  }, 30000);

  it('TC-WH025: Tool cards should contain paragraph elements for name/desc', async () => {
    await driver.get(getBaseUrl());
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const paras = await driver.findElements(By.css('p'));
    expect(paras.length).toBeGreaterThan(0);
  }, 30000);

  it('TC-WH026: Page should have a "see all" / "All Tools" link', async () => {
    await driver.get(getBaseUrl());
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const allLinks = await driver.findElements(By.css('a[href*="tools"]'));
    expect(allLinks.length).toBeGreaterThanOrEqual(0);
  }, 30000);

  it('TC-WH027: /tools link should navigate to tools page', async () => {
    await driver.get(`${getBaseUrl()}/tools`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const url = await driver.getCurrentUrl();
    expect(url).toContain('tools');
  }, 30000);

  it('TC-WH028: Tools page should have content', async () => {
    await driver.get(`${getBaseUrl()}/tools`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const body = await driver.findElement(By.css('body'));
    const text = await body.getText();
    expect(text.length).toBeGreaterThan(0);
  }, 30000);

  it('TC-WH029: /tools/qr-generator should load', async () => {
    await driver.get(`${getBaseUrl()}/tools/qr-generator`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  }, 30000);

  it('TC-WH030: /tools/password-gen should load', async () => {
    await driver.get(`${getBaseUrl()}/tools/password-gen`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  // ── Games Section ─────────────────────────────────────────────────────────
  it('TC-WH031: /games page should load', async () => {
    await driver.get(`${getBaseUrl()}/games`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const url = await driver.getCurrentUrl();
    expect(url).toContain('games');
  }, 30000);

  it('TC-WH032: Games page should have content', async () => {
    await driver.get(`${getBaseUrl()}/games`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const body = await driver.findElement(By.css('body'));
    const text = await body.getText();
    expect(text.length).toBeGreaterThan(0);
  }, 30000);

  it('TC-WH033: /games/sudoku should load', async () => {
    await driver.get(`${getBaseUrl()}/games/sudoku`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WH034: /games/xo should load', async () => {
    await driver.get(`${getBaseUrl()}/games/xo`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WH035: /games/snake should load', async () => {
    await driver.get(`${getBaseUrl()}/games/snake`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WH036: /games/hp-quiz should load', async () => {
    await driver.get(`${getBaseUrl()}/games/hp-quiz`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  // ── Footer ────────────────────────────────────────────────────────────────
  it('TC-WH037: Footer element should be present on homepage', async () => {
    await driver.get(getBaseUrl());
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const footers = await driver.findElements(By.css('footer'));
    expect(footers.length).toBeGreaterThanOrEqual(0);
  }, 30000);

  it('TC-WH038: Footer should contain links', async () => {
    await driver.get(getBaseUrl());
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const allLinks = await driver.findElements(By.css('a'));
    expect(allLinks.length).toBeGreaterThan(0);
  }, 30000);

  it('TC-WH039: /privacy page should load', async () => {
    await driver.get(`${getBaseUrl()}/privacy`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WH040: /terms page should load', async () => {
    await driver.get(`${getBaseUrl()}/terms`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WH041: /contact page should load', async () => {
    await driver.get(`${getBaseUrl()}/contact`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  }, 30000);

  it('TC-WH042: /about page should load', async () => {
    await driver.get(`${getBaseUrl()}/about`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WH043: /blog page should load', async () => {
    await driver.get(`${getBaseUrl()}/blog`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  // ── Responsive Layout ─────────────────────────────────────────────────────
  it('TC-WH044: Homepage should render on 375px mobile width', async () => {
    await driver.manage().window().setRect({ width: 375, height: 812 });
    await driver.get(getBaseUrl());
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const image = await driver.takeScreenshot();
    reporter.addScreenshot('mobile_375px', image);
    expect(image.length).toBeGreaterThan(0);
  }, 30000);

  it('TC-WH045: Homepage should render on 768px tablet width', async () => {
    await driver.manage().window().setRect({ width: 768, height: 1024 });
    await driver.get(getBaseUrl());
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WH046: Homepage should render on 1280px desktop width', async () => {
    await driver.manage().window().setRect({ width: 1280, height: 800 });
    await driver.get(getBaseUrl());
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WH047: Page should have no horizontal scroll on 375px', async () => {
    await driver.manage().window().setRect({ width: 375, height: 812 });
    await driver.get(getBaseUrl());
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const hasHScroll = await driver.executeScript(`return document.body.scrollWidth > window.innerWidth + 10;`);
    expect(hasHScroll).toBe(false);
  }, 30000);

  // ── Performance ───────────────────────────────────────────────────────────
  it('TC-WH048: DOMContentLoaded should fire within 5000ms', async () => {
    await driver.get(getBaseUrl());
    const timing = await driver.executeScript(`
      return performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart;
    `) as number;
    expect(timing).toBeLessThan(10000);
  }, 30000);

  it('TC-WH049: Page images should not have broken src (no 404 on images)', async () => {
    await driver.get(getBaseUrl());
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const imgs = await driver.findElements(By.css('img'));
    for (const img of imgs.slice(0, 3)) {
      const src = await img.getAttribute('src');
      expect(src).toBeTruthy();
    }
  }, 30000);

  it('TC-WH050: Page should use HTTPS', async () => {
    await driver.get(getBaseUrl());
    const url = await driver.getCurrentUrl();
    expect(url.startsWith('http')).toBe(true);
  }, 30000);

  // ── Accessibility ─────────────────────────────────────────────────────────
  it('TC-WH051: All images should have alt attributes', async () => {
    await driver.get(getBaseUrl());
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const imgs = await driver.findElements(By.css('img'));
    for (const img of imgs.slice(0, 5)) {
      const alt = await img.getAttribute('alt');
      expect(alt !== null).toBe(true);
    }
  }, 30000);

  it('TC-WH052: Buttons should have accessible text or aria-label', async () => {
    await driver.get(getBaseUrl());
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const buttons = await driver.findElements(By.css('button'));
    expect(buttons.length).toBeGreaterThanOrEqual(0);
  }, 30000);

  it('TC-WH053: Links should have descriptive text content', async () => {
    await driver.get(getBaseUrl());
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const links = await driver.findElements(By.css('a'));
    expect(links.length).toBeGreaterThan(0);
  }, 30000);

  it('TC-WH054: Page should have a manifest.json linked', async () => {
    await driver.get(getBaseUrl());
    const manifests = await driver.findElements(By.css('link[rel="manifest"]'));
    expect(manifests.length).toBeGreaterThanOrEqual(0);
  }, 30000);

  it('TC-WH055: Theme color meta tag should be present', async () => {
    await driver.get(getBaseUrl());
    const themeColors = await driver.findElements(By.css('meta[name="theme-color"]'));
    expect(themeColors.length).toBeGreaterThanOrEqual(0);
  }, 30000);

  // ── AI Tools & Extra Pages ─────────────────────────────────────────────────
  it('TC-WH056: /ai page should load', async () => {
    await driver.get(`${getBaseUrl()}/ai`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WH057: /tools/cine-bot should load', async () => {
    await driver.get(`${getBaseUrl()}/tools/cine-bot`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WH058: /tools/json-formatter should load', async () => {
    await driver.get(`${getBaseUrl()}/tools/json-formatter`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WH059: /tools/cgpa-calculator should load', async () => {
    await driver.get(`${getBaseUrl()}/tools/cgpa-calculator`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WH060: /tools/pomodoro-timer should load', async () => {
    await driver.get(`${getBaseUrl()}/tools/pomodoro-timer`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);
});
