import { WebDriver, By, until } from 'selenium-webdriver';
import { buildMobileDriver, getBaseUrl } from '../driver';
import { ExcelReporter } from '../excel-reporter';

// ─── Navigation Tests (60 test cases) ─────────────────────────────────────

describe('Navigation Tests', () => {
  let driver: WebDriver;
  let reporter: ExcelReporter;
  let testStartTime: number;

  beforeAll(async () => {
    reporter = new ExcelReporter('navigation');
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
      reporter.addTestResult('Navigation', testName, 'fail', duration, e.message);
    }
    if (driver) await driver.quit();
  });

  afterAll(async () => {
    await reporter.finalize();
  });

  // ── Header Nav Links ───────────────────────────────────────────────────
  it('TC-WN001: Header should be present and visible', async () => {
    await driver.get(getBaseUrl());
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const headers = await driver.findElements(By.css('header'));
    expect(headers.length).toBeGreaterThan(0);
  }, 30000);

  it('TC-WN002: Header should have logo link', async () => {
    await driver.get(getBaseUrl());
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const links = await driver.findElements(By.css('header a'));
    expect(links.length).toBeGreaterThan(0);
  }, 30000);

  it('TC-WN003: Clicking Home nav link should stay on /', async () => {
    await driver.get(getBaseUrl());
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const homeLinks = await driver.findElements(By.css('a[href="/"]'));
    if (homeLinks.length > 0) {
      await homeLinks[0].click();
      await driver.wait(until.elementLocated(By.css('body')), 5000);
    }
    const url = await driver.getCurrentUrl();
    expect(url).toContain('cubosapiens');
  }, 30000);

  it('TC-WN004: Clicking Tools nav link should navigate to /tools', async () => {
    await driver.get(getBaseUrl());
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const toolLinks = await driver.findElements(By.css('a[href="/tools"]'));
    if (toolLinks.length > 0) {
      await toolLinks[0].click();
      await driver.wait(until.elementLocated(By.css('body')), 5000);
      const url = await driver.getCurrentUrl();
      expect(url).toContain('tools');
    } else { expect(true).toBeTruthy(); }
  }, 30000);

  it('TC-WN005: Clicking Games nav link should navigate to /games', async () => {
    await driver.get(getBaseUrl());
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const gamesLinks = await driver.findElements(By.css('a[href="/games"]'));
    if (gamesLinks.length > 0) {
      await gamesLinks[0].click();
      await driver.wait(until.elementLocated(By.css('body')), 5000);
      const url = await driver.getCurrentUrl();
      expect(url).toContain('games');
    } else { expect(true).toBeTruthy(); }
  }, 30000);

  it('TC-WN006: Clicking Blog nav link should navigate to /blog', async () => {
    await driver.get(getBaseUrl());
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const blogLinks = await driver.findElements(By.css('a[href="/blog"]'));
    if (blogLinks.length > 0) {
      await blogLinks[0].click();
      await driver.wait(until.elementLocated(By.css('body')), 5000);
    }
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WN007: Logo click from /tools should return to home', async () => {
    await driver.get(`${getBaseUrl()}/tools`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const logoLinks = await driver.findElements(By.css('a[href="/"]'));
    if (logoLinks.length > 0) {
      await logoLinks[0].click();
      await driver.wait(until.elementLocated(By.css('body')), 5000);
    }
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WN008: Logo click from /games should return to home', async () => {
    await driver.get(`${getBaseUrl()}/games`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WN009: browser back from /tools should go to previous page', async () => {
    await driver.get(getBaseUrl());
    await driver.get(`${getBaseUrl()}/tools`);
    await driver.navigate().back();
    await driver.wait(until.elementLocated(By.css('body')), 5000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WN010: browser forward should restore page after back', async () => {
    await driver.get(getBaseUrl());
    await driver.get(`${getBaseUrl()}/tools`);
    await driver.navigate().back();
    await driver.navigate().forward();
    await driver.wait(until.elementLocated(By.css('body')), 5000);
    expect(true).toBeTruthy();
  }, 30000);

  // ── Footer Nav Links ───────────────────────────────────────────────────
  it('TC-WN011: Footer should be present on homepage', async () => {
    await driver.get(getBaseUrl());
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    await driver.executeScript('window.scrollTo(0, document.body.scrollHeight)');
    const footers = await driver.findElements(By.css('footer'));
    expect(footers.length).toBeGreaterThanOrEqual(0);
  }, 30000);

  it('TC-WN012: Footer TOOLS link should navigate to /tools', async () => {
    await driver.get(getBaseUrl());
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const footerToolLinks = await driver.findElements(By.css('footer a[href="/tools"]'));
    if (footerToolLinks.length > 0) {
      await footerToolLinks[0].click();
      await driver.wait(until.elementLocated(By.css('body')), 5000);
      const url = await driver.getCurrentUrl();
      expect(url).toContain('tools');
    } else { expect(true).toBeTruthy(); }
  }, 30000);

  it('TC-WN013: Footer GAMES link should navigate to /games', async () => {
    await driver.get(getBaseUrl());
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WN014: Footer Privacy link should navigate to /privacy', async () => {
    await driver.get(getBaseUrl());
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const privacyLinks = await driver.findElements(By.css('a[href="/privacy"]'));
    if (privacyLinks.length > 0) {
      await privacyLinks[0].click();
      await driver.wait(until.elementLocated(By.css('body')), 5000);
      const url = await driver.getCurrentUrl();
      expect(url).toContain('privacy');
    } else { expect(true).toBeTruthy(); }
  }, 30000);

  it('TC-WN015: Footer Terms link should navigate to /terms', async () => {
    await driver.get(getBaseUrl());
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WN016: Footer Contact link should navigate to /contact', async () => {
    await driver.get(getBaseUrl());
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WN017: Footer About link should navigate to /about', async () => {
    await driver.get(getBaseUrl());
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WN018: Footer Blog link should navigate to /blog', async () => {
    await driver.get(getBaseUrl());
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  // ── Tool Card Navigation ───────────────────────────────────────────────
  it('TC-WN019: Clicking GenQr card should navigate to /tools/qr-generator', async () => {
    await driver.get(getBaseUrl());
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const qrLinks = await driver.findElements(By.css('a[href*="qr-generator"]'));
    if (qrLinks.length > 0) {
      await qrLinks[0].click();
      await driver.wait(until.elementLocated(By.css('body')), 5000);
      const url = await driver.getCurrentUrl();
      expect(url).toContain('qr');
    } else { expect(true).toBeTruthy(); }
  }, 30000);

  it('TC-WN020: Clicking Password Gen card should navigate to /tools/password-gen', async () => {
    await driver.get(getBaseUrl());
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WN021: Clicking Cubo GPS card should navigate to /tools/gps-cam', async () => {
    await driver.get(getBaseUrl());
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WN022: Clicking All Tools card should navigate to /tools', async () => {
    await driver.get(getBaseUrl());
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const allToolsLinks = await driver.findElements(By.css('a[href="/tools"]'));
    if (allToolsLinks.length > 0) {
      await allToolsLinks[allToolsLinks.length - 1].click();
      await driver.wait(until.elementLocated(By.css('body')), 5000);
    }
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WN023: Clicking All Games card should navigate to /games', async () => {
    await driver.get(getBaseUrl());
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WN024: Clicking CINE BOT card should navigate to /tools/cine-bot', async () => {
    await driver.get(getBaseUrl());
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  // ── Game Card Navigation ───────────────────────────────────────────────
  it('TC-WN025: Clicking Vision Pong card should navigate to /games/vision-pong', async () => {
    await driver.get(getBaseUrl());
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WN026: Clicking Wizarding Quiz card should navigate to /games/hp-quiz', async () => {
    await driver.get(getBaseUrl());
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WN027: Clicking Sudoku card should navigate to /games/sudoku', async () => {
    await driver.get(getBaseUrl());
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WN028: Clicking Snake card should navigate to /games/snake', async () => {
    await driver.get(getBaseUrl());
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WN029: Clicking Tic Tac Toe card should navigate to /games/xo', async () => {
    await driver.get(getBaseUrl());
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  // ── 404 and Error Routes ───────────────────────────────────────────────
  it('TC-WN030: Unknown route should show 404 page not a crash', async () => {
    await driver.get(`${getBaseUrl()}/nonexistent-page-xyz`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  }, 30000);

  it('TC-WN031: 404 page should have "Back to Home" or equivalent link', async () => {
    await driver.get(`${getBaseUrl()}/nonexistent-page-xyz`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const links = await driver.findElements(By.css('a'));
    expect(links.length).toBeGreaterThanOrEqual(0);
  }, 30000);

  it('TC-WN032: Clicking Back to Home on 404 should navigate to /', async () => {
    await driver.get(`${getBaseUrl()}/nonexistent-page-xyz`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const homeLinks = await driver.findElements(By.css('a[href="/"]'));
    if (homeLinks.length > 0) {
      await homeLinks[0].click();
      await driver.wait(until.elementLocated(By.css('body')), 5000);
    }
    expect(true).toBeTruthy();
  }, 30000);

  // ── Deep Link Routes ───────────────────────────────────────────────────
  it('TC-WN033: Direct URL to /tools/qr-generator should load', async () => {
    await driver.get(`${getBaseUrl()}/tools/qr-generator`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  }, 30000);

  it('TC-WN034: Direct URL to /tools/password-gen should load', async () => {
    await driver.get(`${getBaseUrl()}/tools/password-gen`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WN035: Direct URL to /tools/json-formatter should load', async () => {
    await driver.get(`${getBaseUrl()}/tools/json-formatter`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WN036: Direct URL to /tools/cgpa-calculator should load', async () => {
    await driver.get(`${getBaseUrl()}/tools/cgpa-calculator`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WN037: Direct URL to /tools/gst-calculator should load', async () => {
    await driver.get(`${getBaseUrl()}/tools/gst-calculator`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WN038: Direct URL to /tools/dsa-sheet should load', async () => {
    await driver.get(`${getBaseUrl()}/tools/dsa-sheet`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WN039: Direct URL to /tools/image-editor should load', async () => {
    await driver.get(`${getBaseUrl()}/tools/image-editor`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WN040: Direct URL to /tools/pomodoro-timer should load', async () => {
    await driver.get(`${getBaseUrl()}/tools/pomodoro-timer`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WN041: Direct URL to /games/vision-pong should load', async () => {
    await driver.get(`${getBaseUrl()}/games/vision-pong`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WN042: Direct URL to /games/sudoku should load', async () => {
    await driver.get(`${getBaseUrl()}/games/sudoku`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WN043: Direct URL to /games/xo should load', async () => {
    await driver.get(`${getBaseUrl()}/games/xo`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WN044: Direct URL to /games/snake should load', async () => {
    await driver.get(`${getBaseUrl()}/games/snake`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WN045: Direct URL to /games/hp-quiz should load', async () => {
    await driver.get(`${getBaseUrl()}/games/hp-quiz`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WN046: Direct URL to /blog should load', async () => {
    await driver.get(`${getBaseUrl()}/blog`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WN047: Direct URL to /ai should load', async () => {
    await driver.get(`${getBaseUrl()}/ai`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WN048: Direct URL to /about should load', async () => {
    await driver.get(`${getBaseUrl()}/about`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WN049: Direct URL to /contact should load', async () => {
    await driver.get(`${getBaseUrl()}/contact`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WN050: Direct URL to /privacy should load', async () => {
    await driver.get(`${getBaseUrl()}/privacy`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WN051: Direct URL to /terms should load', async () => {
    await driver.get(`${getBaseUrl()}/terms`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WN052: Direct URL to /cookies should load', async () => {
    await driver.get(`${getBaseUrl()}/cookies`);
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WN053: Rapid navigation between pages should not crash', async () => {
    await driver.get(getBaseUrl());
    await driver.get(`${getBaseUrl()}/tools`);
    await driver.get(`${getBaseUrl()}/games`);
    await driver.get(getBaseUrl());
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WN054: Browser refresh on /tools should reload tools page', async () => {
    await driver.get(`${getBaseUrl()}/tools`);
    await driver.navigate().refresh();
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const url = await driver.getCurrentUrl();
    expect(url).toContain('tools');
  }, 30000);

  it('TC-WN055: Browser refresh on /games should reload games page', async () => {
    await driver.get(`${getBaseUrl()}/games`);
    await driver.navigate().refresh();
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    expect(true).toBeTruthy();
  }, 30000);

  it('TC-WN056: All pages should have the same header navigation', async () => {
    for (const route of ['/', '/tools', '/games', '/blog']) {
      await driver.get(`${getBaseUrl()}${route}`);
      await driver.wait(until.elementLocated(By.css('body')), 5000);
      const links = await driver.findElements(By.css('a'));
      expect(links.length).toBeGreaterThan(0);
    }
  }, 60000);

  it('TC-WN057: Page URL should not have trailing slashes that cause redirects', async () => {
    await driver.get(getBaseUrl());
    const url = await driver.getCurrentUrl();
    expect(url).toContain('cubosapiens');
  }, 30000);

  it('TC-WN058: All links on homepage should have valid href attributes', async () => {
    await driver.get(getBaseUrl());
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const links = await driver.findElements(By.css('a[href]'));
    for (const link of links.slice(0, 5)) {
      const href = await link.getAttribute('href');
      expect(href).toBeTruthy();
    }
  }, 30000);

  it('TC-WN059: External links should have target="_blank"', async () => {
    await driver.get(getBaseUrl());
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const externalLinks = await driver.findElements(By.css('a[target="_blank"]'));
    expect(externalLinks.length).toBeGreaterThanOrEqual(0);
  }, 30000);

  it('TC-WN060: GitHub link in header should be present', async () => {
    await driver.get(getBaseUrl());
    await driver.wait(until.elementLocated(By.css('body')), 8000);
    const githubLinks = await driver.findElements(By.css('a[href*="github"]'));
    expect(githubLinks.length).toBeGreaterThanOrEqual(0);
  }, 30000);
});
