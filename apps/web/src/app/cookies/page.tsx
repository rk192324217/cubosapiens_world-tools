export const metadata = {
  title:       "Cookie Policy",
  description: "CUBOSAPIENS cookie policy. We use minimal cookies — only what is needed to remember your preferences and display ads.",
  openGraph: {
    title:       "Cookie Policy",
    description: "Learn about the cookies used on CUBOSAPIENS. We keep it minimal.",
    url:         "https://cubosapiens.world/cookies",
  },
}

export default function CookiesPage()
{
  return (
    <div className="page-container">
      <div className="page-hero">
        <span className="section-tag">Legal</span>
        <h1 className="page-hero-title">Cookie Policy</h1>
        <p className="page-hero-sub">Last updated: 15 March 2026. We use as few cookies as possible.</p>
      </div>

      <div className="legal-content">

        <h2>1. What Are Cookies</h2>
        <p>Cookies are small text files that a website stores on your device when you visit. They are widely used to make websites work efficiently, remember your preferences, and provide information to website owners. CUBOSAPIENS uses a minimal number of cookies and browser storage items.</p>

        <h2>2. Types of Storage We Use</h2>
        <p>We distinguish between three types of browser storage:</p>
        <ul>
          <li><strong>Cookies</strong> — small files set by our domain, readable by both browser and server</li>
          <li><strong>localStorage</strong> — browser storage that persists until manually cleared</li>
          <li><strong>sessionStorage</strong> — browser storage that is automatically cleared when you close your browser tab</li>
        </ul>

        <h2>3. Essential Storage</h2>
        <p>These are required for the platform to function correctly and cannot be disabled:</p>
        <ul>
          <li><strong>theme</strong> (localStorage) — stores your dark or light mode preference so the correct theme loads on your next visit</li>
          <li><strong>cookie_consent</strong> (localStorage) — remembers that you have acknowledged our cookie banner so it does not appear on every visit</li>
          <li><strong>visited</strong> (sessionStorage) — a temporary flag that prevents your visit from being counted multiple times in a single browser session. Automatically cleared when you close the tab.</li>
          <li><strong>pwa_dismissed</strong> (localStorage) — remembers if you dismissed the PWA install prompt so it does not appear repeatedly</li>
        </ul>

        <h2>4. Advertising Cookies</h2>
        <p>CUBOSAPIENS uses Google AdSense to display advertisements. Google AdSense sets its own cookies to serve relevant advertisements based on your interests and browsing history. These cookies are set by Google&apos;s domains, not by CUBOSAPIENS directly.</p>
        <p>Google AdSense advertising cookies may include:</p>
        <ul>
          <li><strong>__gads</strong> — used by Google to track ad performance and prevent the same ad being shown too many times</li>
          <li><strong>IDE</strong> — used by Google DoubleClick to track user actions after viewing or clicking an ad</li>
          <li><strong>DSID</strong> — used to identify a signed-in user on non-Google sites to serve personalised ads</li>
        </ul>
        <p>You can opt out of personalised advertising at any time by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="about-link">Google Ads Settings</a>.</p>

        <h2>5. No Tracking Cookies</h2>
        <p>CUBOSAPIENS does not use any first-party tracking cookies. We do not track your behaviour across websites, build user profiles, or sell your data to any third party. Our only analytics is an anonymous visit counter that counts site visits without storing any personal information.</p>

        <h2>6. How to Control Cookies</h2>
        <p>You have full control over cookies in your browser. You can:</p>
        <ul>
          <li>Block all cookies through your browser settings (note: this may affect site functionality)</li>
          <li>Delete existing cookies at any time through your browser&apos;s history or privacy settings</li>
          <li>Use your browser &apos;s incognito or private mode to browse without storing cookies</li>
          <li>Install browser extensions such as uBlock Origin to block advertising cookies specifically</li>
          <li>Opt out of Google personalised ads at <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="about-link">Google Ads Settings</a></li>
        </ul>
        <p>Instructions for managing cookies in popular browsers:</p>
        <ul>
          <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="about-link">Google Chrome</a></li>
          <li><a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer" className="about-link">Mozilla Firefox</a></li>
          <li><a href="https://support.apple.com/en-gb/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="about-link">Apple Safari</a></li>
        </ul>

        <h2>7. Changes to This Policy</h2>
        <p>We may update this cookie policy when we add new features or services. The date at the top of this page reflects the latest revision. We encourage you to check this page periodically.</p>

        <h2>8. Contact</h2>
        <p>For questions about our use of cookies, contact us at <a href="mailto:cubosapiens@gmail.com" className="about-link">cubosapiens@gmail.com</a> or visit our <a href="/contact" className="about-link">contact page</a>.</p>

      </div>
    </div>
  )
}