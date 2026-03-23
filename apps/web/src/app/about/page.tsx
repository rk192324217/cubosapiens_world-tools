export const metadata = {
  title: "About — CUBOSAPIENS",
  description: "About CUBOSAPIENS — free tools for everyone, built by a student developer from India",
}

export default function AboutPage()
{
  const values = [
    { icon: "🔒", title: "Privacy First",  desc: "All processing happens in your browser. We never upload or store your files." },
    { icon: "⚡", title: "Always Free",    desc: "Core tools will always be free. We earn through non-intrusive ads."           },
    { icon: "🌍", title: "Built for All",  desc: "Simple enough for anyone. Powerful enough for professionals."                 },
    { icon: "🇮🇳", title: "Made in India", desc: "Built by a student developer from Chennai, India."                           },
  ]

  return (
    <div className="page-container">

      <div className="page-hero">
        <span className="section-tag">Our story</span>
        <h1 className="page-hero-title">Built by a student.<br/>Free for everyone.</h1>
        <p className="page-hero-sub">
          CUBOSAPIENS started as a personal project to build useful tools that anyone on the internet can use — for free, forever.
        </p>
      </div>

      <div className="about-values">
        {values.map((v, i) => (
          <div key={i} className="about-card">
            <div className="about-card-icon">{v.icon}</div>
            <h3 className="about-card-title">{v.title}</h3>
            <p className="about-card-desc">{v.desc}</p>
          </div>
        ))}
      </div>

      <div className="about-section">
        <h2 className="about-heading">What is CUBOSAPIENS?</h2>
        <p className="about-text">
          CUBOSAPIENS is a growing collection of free browser-based tools. No accounts, no subscriptions, no data collection. Just open the tool and use it.
        </p>
        <p className="about-text">
          Our first tool — CUBO GPS CAM — lets you stamp GPS location, satellite map, date and time onto any photo, right in your browser. Your photos never leave your device.
        </p>

        <h2 className="about-heading">The Tech</h2>
        <p className="about-text">
          Built with Next.js, TypeScript, Hono.js on Cloudflare Workers, and PostgreSQL on Supabase. Each tool is independently deployed as its own microservice on a subdomain. The platform is hosted on Cloudflare Pages for instant global delivery.
        </p>

        <h2 className="about-heading">Get in Touch</h2>
        <p className="about-text">
          Have a tool idea? Found a bug? Want to collaborate?{" "}
          <a href="/contact" className="about-link">Contact us →</a>
        </p>
      </div>

    </div>
  )
}