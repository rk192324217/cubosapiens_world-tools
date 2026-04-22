import Link from "next/link"

export const metadata = {
  title:       "About",
  description: "CUBOSAPIENS is a free browser-based platform for tools, games and AI. Built by a student developer from Chennai, India. No accounts, no cost, everything in one place.",
  openGraph: {
    title:       "About CUBOSAPIENS — Free Tools, Games & AI",
    description: "Learn about CUBOSAPIENS — why it was built, what it offers, and where it is going.",
    url:         "https://cubosapiens.world/about",
  },
}

export default function AboutPage()
{
  const values = [
    {
      icon:  "fa-solid fa-shield-halved",
      title: "Privacy First",
      desc:  "All tool processing happens in your browser. We never upload or store your files on any server. Your data stays on your device.",
    },
    {
      icon:  "fa-solid fa-infinity",
      title: "Always Free",
      desc:  "Core tools will always be completely free. We sustain the platform through non-intrusive advertising — never paywalls.",
    },
    {
      icon:  "fa-solid fa-earth-asia",
      title: "Built for Everyone",
      desc:  "Simple enough for any internet user. Powerful enough for developers and professionals. No technical knowledge required.",
    },
    {
      icon:  "fa-solid fa-code-branch",
      title: "Open Source",
      desc:  "CUBOSAPIENS is fully open source on GitHub. Developers can contribute tools, fix bugs, or build entirely new features.",
    },
  ]

  const stats = [
    { value: "10+",  label: "Live Tools"      },
    { value: "Free", label: "Always"           },
    { value: "0",    label: "Accounts Needed"  },
    { value: "100%", label: "Browser-Based"    },
  ]

  const tools = [
    { name: "GPS CAM",         desc: "Stamp your GPS location, satellite map, date and time onto any photo — entirely in your browser.",     slug: "gps-cam"          },
    { name: "QR Generator",    desc: "Generate QR codes for any URL, text, or contact information instantly.",                               slug: "qr-generator"     },
    { name: "Image Compressor",desc: "Reduce image file size without losing quality.",                                                       slug: "image-compressor" },
    { name: "PDF Merger",      desc: "Combine multiple PDF files into one with a single click.",                                             slug: "pdf-merger"       },
    { name: "Word Counter",    desc: "Count words, characters, sentences and estimate reading time instantly.",                              slug: "word-counter"     },
  ]

  return (
    <div className="page-container">

      {/* Hero */}
      <div className="page-hero">
        <span className="section-tag">Our story</span>
        <h1 className="page-hero-title">
          Built by a student.<br />Free for everyone.
        </h1>
        <p className="page-hero-sub">
          CUBOSAPIENS was born from a simple frustration — why do you need to open ten different websites to use ten different tools? We built one place where you can find everything you need, free, without signing up.
        </p>
      </div>

      {/* Stats */}
      <div className="about-stats">
        {stats.map((s, i) => (
          <div key={i} className="about-stat-item">
            <span className="about-stat-value">{s.value}</span>
            <span className="about-stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Values */}
      <div className="about-values">
        {values.map((v, i) => (
          <div key={i} className="about-card">
            <div className="about-card-icon-wrap">
              <i className={v.icon}></i>
            </div>
            <h3 className="about-card-title">{v.title}</h3>
            <p className="about-card-desc">{v.desc}</p>
          </div>
        ))}
      </div>

      {/* Story */}
      <div className="about-section">

        <h2 className="about-heading">The Problem We Solve</h2>
        <p className="about-text">
          Every day, millions of people search separately for an image compressor, a QR code generator, a PDF merger, a word counter. Each search leads to a different website — some with paywalls, some requiring sign-ups, some cluttered with ads, some that do not work on mobile. This is a frustrating, time-consuming experience that most people just accept as normal.
        </p>
        <p className="about-text">
          CUBOSAPIENS exists to solve this. We are building a single destination where developers, students, professionals, and everyday internet users can find every tool they need — organised, fast, free, and always available in the browser.
        </p>

        <h2 className="about-heading">How It Works</h2>
        <p className="about-text">
          Each tool on CUBOSAPIENS is an independent microservice deployed on its own subdomain. This means tools are isolated from each other — one tool being updated or having an issue never affects the others. When you open a tool, it runs entirely within your browser using modern Web APIs. No server receives your files. No data leaves your device.
        </p>
        <p className="about-text">
          The main platform at cubosapiens.world serves as the directory and launcher — pulling the tool list from our database and presenting them in a clean, fast interface. Clicking a tool opens it within the platform in a YouTube-style layout with recommended tools alongside.
        </p>

        <h2 className="about-heading">Our Tools</h2>
        <p className="about-text">Here are some of the tools currently available on CUBOSAPIENS:</p>
        <div className="about-tools-grid">
          {tools.map((t, i) => (
            <Link key={i} href={`/tools/${t.slug}`} className="about-tool-card">
              <p className="about-tool-name">{t.name}</p>
              <p className="about-tool-desc">{t.desc}</p>
            </Link>
          ))}
        </div>

        <h2 className="about-heading">The Technology</h2>
        <p className="about-text">
          CUBOSAPIENS is built with a modern, production-grade stack. The frontend is built with Next.js 15 and TypeScript, deployed on Cloudflare Pages for instant global delivery across 200+ cities. The REST API is built with Hono.js running on Cloudflare Workers at the edge. Tool metadata is stored in PostgreSQL on Supabase with Prisma as the ORM.
        </p>
        <p className="about-text">
          The entire codebase is open source on GitHub. We use a Turborepo monorepo structure with each tool as an independent deployment, allowing contributors to build and deploy new tools without touching the main platform.
        </p>

        <h2 className="about-heading">Open Source and Community</h2>
        <p className="about-text">
          CUBOSAPIENS is participating in GirlScript Summer of Code (GSSoC) 2025. We welcome contributors of all skill levels — whether you want to fix a bug, improve the UI, write documentation, or build an entirely new tool. Every contribution helps make the platform better for everyone.
        </p>
        <p className="about-text">
          If you are a developer who wants to contribute a tool, check out our contribution guide on GitHub. If you have an idea for a tool you wish existed, open an issue and we will prioritise it.
        </p>

        <h2 className="about-heading">What is Coming Next</h2>
        <p className="about-text">
          We are actively building more tools across image processing, PDF utilities, text tools, converters, and developer utilities. We are also building a games section with browser-based games and an AI tools section powered by large language models.
        </p>
        <p className="about-text">
          Our long-term vision is a platform with 50+ tools covering every common task an internet user might need — a true one-stop destination for free browser utilities.
        </p>

        <h2 className="about-heading">Get Involved</h2>
        <p className="about-text">
          Have a tool idea? Found a bug? Want to collaborate or contribute?{" "}
          <Link href="/contact" className="about-link">Contact us</Link>{" "}
          or find us on{" "}
          <a href="https://www.instagram.com/cubosapiens/" target="_blank" rel="noopener noreferrer" className="about-link">Instagram</a>,{" "}
          <a href="https://www.youtube.com/channel/UCsG60rRXZ302vmYDYg4j97g" target="_blank" rel="noopener noreferrer" className="about-link">YouTube</a>, and{" "}
          <a href="https://www.linkedin.com/in/cubosapiens/" target="_blank" rel="noopener noreferrer" className="about-link">LinkedIn</a>.
        </p>

      </div>
    </div>
  )
}