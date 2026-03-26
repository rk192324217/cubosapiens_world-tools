"use client"
import Link from "next/link"
import Image from"next/image"

export default function Footer()
{
  const tools   = ["GPS CAM", "QR Generator", "PDF Merger", "Compressor", "Word Counter"]
  const legal   = [{ l: "Privacy Policy", h: "/privacy" }, { l: "Terms of Use", h: "/terms" }, { l: "Cookie Policy", h: "/cookies" }]
  const company = [{ l: "About", h: "/about" }, { l: "Contact", h: "/contact" }]

  return (
    <footer className="footer">
      <div className="footer-inner">

        <div className="footer-top">

          <div className="footer-brand">
            <Image
                      
                        src="/logo.png"
                        alt="logo"
                        className="footer-brand-icon"
                        width={100}
                        height={100}
                        priority
                        unoptimized
                      />
            <p className="footer-brand-text">
              Free tools, games and AI for everyone on the internet.
              No signup. No cost. Always free.
            </p>
          </div>

          <div>
            <p className="footer-col-title">Tools</p>
            {tools.map(t => (
              <Link key={t} href={`/tools/${t.toLowerCase().replace(/ /g, "-")}`} className="footer-link">{t}</Link>
            ))}
          </div>

          <div>
            <p className="footer-col-title">Legal</p>
            {legal.map(l => (
              <Link key={l.h} href={l.h} className="footer-link">{l.l}</Link>
            ))}
          </div>

          <div>
            <p className="footer-col-title">Company</p>
            {company.map(l => (
              <Link key={l.h} href={l.h} className="footer-link">{l.l}</Link>
            ))}
          </div>

        </div>

        <div className="footer-bottom">
          <span className="footer-copy">© 2026 CUBOSAPIENS. All rights reserved.</span>
          <span className="footer-copy">Made with ❤️ in India 🇮🇳</span>
          <div className="footer-bottom-links">
            <Link href="/privacy" className="footer-bottom-link">Privacy</Link>
            <Link href="/terms"   className="footer-bottom-link">Terms</Link>
            <Link href="/contact" className="footer-bottom-link">Contact</Link>
          </div>
        </div>

      </div>
    </footer>
  )
}