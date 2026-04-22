export const metadata = {
  title:       "Privacy Policy",
  description: "CUBOSAPIENS privacy policy. We process all data in your browser. No file uploads, no user accounts, no data collection beyond anonymous analytics.",
  openGraph: {
    title:       "Privacy Policy",
    description: "Learn how CUBOSAPIENS handles your data. We are privacy-first by design.",
    url:         "https://cubosapiens.world/privacy",
  },
}

export default function PrivacyPage()
{
  return (
    <div className="page-container">
      <div className="page-hero">
        <span className="section-tag">Legal</span>
        <h1 className="page-hero-title">Privacy Policy</h1>
        <p className="page-hero-sub">Last updated: 22 April 2026. We keep this simple and honest.</p>
      </div>

      <div className="legal-content">

        <h2>1. Who We Are</h2>
        <p>CUBOSAPIENS operates cubosapiens.world and its associated tool subdomains. We are an independent open-source project built and maintained by a student developer based in Chennai, India. Our mission is to give everyone on the internet access to free, useful browser tools — without accounts, subscriptions, or data collection.</p>

        <h2>2. Our Privacy-First Approach</h2>
        <p>CUBOSAPIENS is designed from the ground up to respect your privacy. We do not require you to create an account. We do not store your files, photos, or personal documents on any server. All tool processing happens entirely within your own browser on your own device. Your data never leaves your device unless you explicitly choose to share it.</p>

        <h2>3. What Data We Collect</h2>
        <p>We collect the absolute minimum required to operate the platform:</p>
        <ul>
          <li><strong>Anonymous visit counts</strong> — a simple counter stored in Cloudflare KV that increments when you visit the site. No personal information is attached to this count.</li>
          <li><strong>Theme preference</strong> — stored locally in your browser&apos;s localStorage. Never sent to our servers.</li>
          <li><strong>Session data</strong> — a sessionStorage flag to prevent counting your visit multiple times in one session. Cleared when you close your browser.</li>
          <li><strong>Contact form submissions</strong> — if you use our contact form, your name, email, and message are processed by Formspree (a third-party form service). See their privacy policy at formspree.io.</li>
        </ul>

        <h2>4. Device Permissions</h2>
        <p>Some tools require device permissions to function. These are always requested explicitly by your browser before any access is granted:</p>
        <ul>
          <li><strong>Camera</strong> — requested by tools that process photos. Your camera feed is processed locally in your browser and never transmitted to our servers.</li>
          <li><strong>Location (GPS)</strong> — requested by GPS CAM to stamp your coordinates onto photos. Location data is processed in your browser only and never sent to our servers.</li>
          <li><strong>Microphone</strong> — may be requested by future audio tools. Will always be opt-in and locally processed.</li>
        </ul>
        <p>You can revoke any permission at any time through your browser settings. Revoking a permission will disable the relevant feature but will not affect your use of other tools.</p>

        <h2>5. Third-Party Services</h2>
        <p>We use the following third-party services to operate the platform. Each has its own privacy policy:</p>
        <ul>
          <li><strong>Cloudflare</strong> — our hosting provider. Cloudflare may log IP addresses and request metadata as part of its infrastructure. See cloudflare.com/privacypolicy.</li>
          <li><strong>Supabase</strong> — our database provider, used to store tool metadata (names, descriptions, categories). No user data is stored here.</li>
          <li><strong>OpenStreetMap / Nominatim</strong> — used for reverse geocoding in GPS CAM. Your coordinates are sent to Nominatim&apos;s servers only when you use the location feature.</li>
          <li><strong>Esri World Imagery</strong> — provides satellite map tiles in GPS CAM. Tile requests may include your approximate location.</li>
          <li><strong>Formspree</strong> — processes contact form submissions. See formspree.io/legal/privacy-policy.</li>
          <li><strong>Google AdSense</strong> — we display advertisements to support the platform. Google may use cookies and your browsing data to serve personalised ads. See section 6 below.</li>
        </ul>

        <h2>6. Google AdSense and Advertising</h2>
        <p>CUBOSAPIENS uses Google AdSense to display advertisements. Google AdSense uses cookies and similar tracking technologies to serve ads that are relevant to you based on your browsing history across websites. This is how we keep CUBOSAPIENS free for everyone.</p>
        <p>You can opt out of personalised advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="about-link">Google Ads Settings</a> or by using the <a href="https://optout.aboutads.info/" target="_blank" rel="noopener noreferrer" className="about-link">Digital Advertising Alliance opt-out tool</a>.</p>

        <h2>7. Cookies</h2>
        <p>We use a small number of cookies and browser storage items. See our <a href="/cookies" className="about-link">Cookie Policy</a> for full details.</p>

        <h2>8. Children&apos;s Privacy</h2>
        <p>CUBOSAPIENS is a general-purpose tool platform not directed at children under 13. We do not knowingly collect any personal information from children. If you believe a child has submitted personal information through our contact form, please contact us and we will delete it immediately.</p>

        <h2>9. Your Rights</h2>
        <p>Because we collect minimal personal data, most rights under GDPR and Indian data protection law are automatically satisfied. Specifically:</p>
        <ul>
          <li><strong>Right to access</strong> — we hold no personal profile about you.</li>
          <li><strong>Right to deletion</strong> — there is nothing to delete on our end. Clear your browser&apos;s localStorage and cookies to remove all locally stored preferences.</li>
          <li><strong>Right to object</strong> — you can opt out of personalised Google ads at any time (see section 6).</li>
          <li><strong>Contact form data</strong> — if you submitted a contact form and want your message deleted, email us at <a href="mailto:cubosapiens@gmail.com" className="about-link">cubosapiens@gmail.com</a>.</li>
        </ul>

        <h2>10. Changes to This Policy</h2>
        <p>We may update this policy as we add new tools or services. The date at the top of this page will always reflect the latest revision. Continued use of CUBOSAPIENS after changes constitutes acceptance of the updated policy.</p>

        <h2>11. Contact</h2>
        <p>For privacy questions or data requests, contact us at <a href="mailto:cubosapiens@gmail.com" className="about-link">cubosapiens@gmail.com</a> or visit our <a href="/contact" className="about-link">contact page</a>.</p>

      </div>
    </div>
  )
}