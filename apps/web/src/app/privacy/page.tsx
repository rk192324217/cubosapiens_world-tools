import {
  ShieldCheck,
  Zap,
  BarChart3,
  Camera,
  MapPinned,
  Mic,
  Database,
  Mail,
} from "lucide-react"

export const metadata = {
  title: "Privacy Policy",
  description:
    "CUBOSAPIENS privacy policy. We process all data in your browser with a privacy-first approach.",
}

export default function PrivacyPage() {
  return (
    <div className="privacyPage">
      <section className="privacyHero">
        <div className="heroBadge">
          PRIVACY • TRANSPARENCY • SECURITY
        </div>

        <h1>Privacy Policy</h1>

        <p>
          We believe privacy should be simple, transparent, and easy to
          understand.
        </p>

        <div className="heroMeta">
          <span>Last Updated: 22 April 2026</span>
          <span>Privacy-First Platform</span>
        </div>
      </section>

      <section className="summaryGrid">
        <div className="summaryCard">
          <div className="summaryIcon">
            <ShieldCheck size={28} />
          </div>

          <h3>No File Uploads</h3>

          <p>
            Your files stay on your device and are never stored on our servers.
          </p>
        </div>

        <div className="summaryCard">
          <div className="summaryIcon">
            <Zap size={28} />
          </div>

          <h3>Browser Processing</h3>

          <p>Most tools work completely inside your browser.</p>
        </div>

        <div className="summaryCard">
          <div className="summaryIcon">
            <BarChart3 size={28} />
          </div>

          <h3>Minimal Analytics</h3>

          <p>
            We only collect basic anonymous visit statistics.
          </p>
        </div>
      </section>

      <section className="privacyLayout">
        <aside className="privacySidebar">
          <div className="sidebarCard">
            <h4>Contents</h4>

            <a href="#who">Who We Are</a>
            <a href="#collect">Data Collection</a>
            <a href="#permissions">Permissions</a>
            <a href="#rights">Your Rights</a>
            <a href="#contact">Contact</a>
          </div>
        </aside>

        <div className="privacyContent">
          <div className="contentCard" id="who">
            <div className="contentTop">
              <span className="contentNumber">01</span>

              <div>
                <h2>Who We Are</h2>

                <p className="sectionSubtitle">
                  Open-source browser tools built with privacy in mind.
                </p>
              </div>
            </div>

            <p>
              CUBOSAPIENS operates browser-based tools designed to work without
              accounts, subscriptions, or invasive tracking systems.
            </p>
          </div>

          <div className="contentCard" id="collect">
            <div className="contentTop">
              <span className="contentNumber">02</span>

              <div>
                <h2>What We Collect</h2>

                <p className="sectionSubtitle">
                  Only the minimum required information.
                </p>
              </div>
            </div>

            <div className="featureList">
              <div className="featureItem">
                <div className="featureTitle">
                  <BarChart3 size={18} />
                  <h4>Anonymous Analytics</h4>
                </div>

                <p>
                  Simple visit counts without identifying users.
                </p>
              </div>

              <div className="featureItem">
                <div className="featureTitle">
                  <Database size={18} />
                  <h4>Theme Preferences</h4>
                </div>

                <p>
                  Stored locally in your browser for convenience.
                </p>
              </div>

              <div className="featureItem">
                <div className="featureTitle">
                  <Mail size={18} />
                  <h4>Contact Forms</h4>
                </div>

                <p>
                  Securely processed through Formspree.
                </p>
              </div>
            </div>
          </div>

          <div className="contentCard" id="permissions">
            <div className="contentTop">
              <span className="contentNumber">03</span>

              <div>
                <h2>Device Permissions</h2>

                <p className="sectionSubtitle">
                  Always optional and browser-controlled.
                </p>
              </div>
            </div>

            <div className="permissionsGrid">
              <div className="permissionCard">
                <Camera size={34} />
                <h4>Camera</h4>
              </div>

              <div className="permissionCard">
                <MapPinned size={34} />
                <h4>Location</h4>
              </div>

              <div className="permissionCard">
                <Mic size={34} />
                <h4>Microphone</h4>
              </div>
            </div>
          </div>

          <div className="contentCard" id="rights">
            <div className="contentTop">
              <span className="contentNumber">04</span>

              <div>
                <h2>Your Rights</h2>

                <p className="sectionSubtitle">
                  Transparency and control over your data.
                </p>
              </div>
            </div>

            <div className="rightsBanner">
              You can clear local browser data anytime and opt out of
              personalized ads.
            </div>
          </div>
        </div>
      </section>

      <section className="privacyContact" id="contact">
        <h2>Questions About Privacy?</h2>

        <p>
          Reach out anytime for privacy-related questions or requests.
        </p>

        <a href="mailto:cubosapiens@gmail.com">
          cubosapiens@gmail.com
        </a>
      </section>
    </div>
  )
}