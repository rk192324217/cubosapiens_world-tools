"use client"
import Link from "next/link"
import Image from"next/image";
export default function Footer()
{
  const tools = ["GPS CAM", "QR Generator", "PDF Merger", "Compressor", "Word Counter"]
  const legal = [
    { l: "Privacy Policy", h: "/privacy"  },
    { l: "Terms of Use",   h: "/terms"    },
    { l: "Cookie Policy",  h: "/cookies"  },
  ]
  const company = [
    { l: "About",   h: "/about"   },
    { l: "Contact", h: "/contact" },  
  ]

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

            {/* Social links */}
            <div className="footer-social">
              <a href="https://www.instagram.com/cubosapiens/" target="_blank" rel="noopener noreferrer" className="footer-social-link" title="Instagram">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="https://www.youtube.com/channel/UCsG60rRXZ302vmYDYg4j97g" target="_blank" rel="noopener noreferrer" className="footer-social-link" title="YouTube">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/>
                </svg>
              </a>
              <a href="https://www.linkedin.com/in/cubosapiens/" target="_blank" rel="noopener noreferrer" className="footer-social-link" title="LinkedIn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              {/* Discord — coming soon */}
              {/* <a href="https://discord.gg/cubosapiens" target="_blank" rel="noopener noreferrer" className="footer-social-link" title="Discord">Discord</a> */}
            </div>

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
            <div style={{ marginTop: "16px" }}>
              <p className="footer-col-title">Contact</p>
              <a href="mailto:cubosapiens@gmail.com" className="footer-link">cubosapiens@gmail.com</a>
              <a href="mailto:cubosapiens+support@gmail.com" className="footer-link">Support</a>
            </div>
          </div>

        </div>

        <div className="footer-bottom">
          <span className="footer-copy">© 2026 CUBOSAPIENS. All rights reserved.</span>
          <span className="footer-copy">Made with ❤️ in India 🇮🇳</span>
          <div className="footer-bottom-links">
            <Link href="/privacy"  className="footer-bottom-link">Privacy</Link>
            <Link href="/terms"    className="footer-bottom-link">Terms</Link>
            <Link href="/contact"  className="footer-bottom-link">Contact</Link>
          </div>
        </div>

      </div>
    </footer>
  )
}