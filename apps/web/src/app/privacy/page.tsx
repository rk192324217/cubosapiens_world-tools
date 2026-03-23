export const metadata = {
  title: "Privacy Policy — CUBOSAPIENS",
}

export default function PrivacyPage()
{
  return (
    <div className="page-container">
      <div className="page-hero">
        <span className="section-tag">Legal</span>
        <h1 className="page-hero-title">Privacy Policy</h1>
        <p className="page-hero-sub">Last updated: 15 March 2026</p>
      </div>
      <div className="legal-content">

        <h2>1. Who We Are</h2>
        <p>CUBOSAPIENS operates cubosapiens.world and its tools. We are an independent project run by a student developer based in India.</p>

        <h2>2. What Data We Collect</h2>
        <p>We collect minimal data:</p>
        <ul>
          <li><strong>Usage data</strong> — pages visited, anonymous visit counts stored in Cloudflare KV</li>
          <li><strong>Location data</strong> — only if you use "Use Current Location". Processed in your browser only, never sent to our servers</li>
          <li><strong>Photos</strong> — processed entirely in your browser. Never uploaded to any server</li>
          <li><strong>Cookies</strong> — see our Cookie Policy</li>
        </ul>

        <h2>3. Google AdSense</h2>
        <p>We use Google AdSense to display advertisements. Google may use cookies to serve personalised ads. You can opt out at <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener" className="about-link">Google Ads Settings</a>.</p>

        <h2>4. Third-Party Services</h2>
        <ul>
          <li><strong>OpenStreetMap / Nominatim</strong> — reverse geocoding</li>
          <li><strong>Esri World Imagery</strong> — satellite map thumbnails</li>
          <li><strong>Cloudflare</strong> — hosting and analytics</li>
        </ul>

        <h2>5. Your Rights</h2>
        <p>You have the right to access, correct, or delete your data. Contact us via the contact page.</p>

        <h2>6. Contact</h2>
        <p>For privacy questions, visit our <a href="/contact" className="about-link">contact page</a>.</p>

      </div>
    </div>
  )
}