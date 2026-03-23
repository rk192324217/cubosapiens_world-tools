export const metadata = { title: "Cookie Policy — CUBOSAPIENS" }

export default function CookiesPage()
{
  return (
    <div className="page-container">
      <div className="page-hero">
        <span className="section-tag">Legal</span>
        <h1 className="page-hero-title">Cookie Policy</h1>
        <p className="page-hero-sub">Last updated: 15 March 2026</p>
      </div>
      <div className="legal-content">

        <h2>1. What Are Cookies</h2>
        <p>Cookies are small text files stored on your device when you visit a website.</p>

        <h2>2. Cookies We Use</h2>
        <h3>Essential</h3>
        <ul>
          <li><strong>theme</strong> — remembers your dark/light mode preference</li>
          <li><strong>cookie_consent</strong> — remembers your cookie choice</li>
          <li><strong>visited</strong> — prevents counting the same session twice</li>
        </ul>

        <h3>Advertising</h3>
        <p>We use Google AdSense which may use cookies for ad targeting. Opt out at <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener" className="about-link">Google Ads Settings</a>.</p>

        <h2>3. How to Control Cookies</h2>
        <p>You can control cookies through your browser settings or via the cookie banner shown on your first visit.</p>

      </div>
    </div>
  )
}