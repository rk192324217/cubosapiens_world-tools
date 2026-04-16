"use client"

import { useState, useEffect, useRef } from "react"
import Link       from "next/link"
import Image      from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { fetchCounters } from "@/lib/api"

const navLinks = [
  { href: "/",      label: "Home",  icon: <i className="fa-regular fa-house"></i> },
  { href: "/tools", label: "Tools", icon: <i className="fa-solid fa-screwdriver-wrench"></i>},
  { href: "/games", label: "Games", icon: <i className="fa-solid fa-gamepad"></i> },
  { href: "/ai",    label: "AI",    icon: <i className="fa-solid fa-robot"></i> },
]

const moreLinks = [
  { href: "/about",   label: "About",          icon: <i className="fa-solid fa-circle-info"></i> },
  { href: "/contact", label: "Contact",         icon: <i className="fa-regular fa-circle-user"></i> },
  { href: "/privacy", label: "Privacy Policy",  icon: <i className="fa-solid fa-user-shield"></i> },
  { href: "/terms",   label: "Terms of Use",    icon: <i className="fa-solid fa-file-contract"></i>},
]

export default function Header()
{
  const [visitors,    setVisitors]    = useState<number | null>(null)
  const [search,      setSearch]      = useState("")
  const [menuOpen,    setMenuOpen]    = useState(false)
  const [searchOpen,  setSearchOpen]  = useState(false)
  const pathname = usePathname()
  const router   = useRouter()
  const menuRef  = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchCounters().then(d => setVisitors(d.visits))
  }, [])

  // Close menu on route change
  useEffect(() => { setMenuOpen(false) }, [pathname])

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if(menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenuOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  // Focus search input when opened
  useEffect(() => {
    if(searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if(search.trim()) {
      router.push(`/search?q=${encodeURIComponent(search.trim())}`)
      setSearchOpen(false)
      setSearch("")
    }
  }

  return (
    <>
      {/* Inject Font Awesome once */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
      />

      <div className="header-wrap">
        <header className="header">

          {/* ── LOGO ── */}
          <Link href="/" className="header-logo">
            <Image
              src="/logo.png"
              alt="CUBOSAPIENS"
              className="header-logo-icon"
              width={36}
              height={36}
              priority
              unoptimized
            />
            <span className="header-logo-text">CUBOSAPIENS</span>
          </Link>

          {/* ── DESKTOP NAV ── */}
          <nav className="header-nav">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`header-nav-link ${pathname === link.href ? "header-nav-active" : ""}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* ── RIGHT SIDE ── */}
          <div className="header-right">

            {/* Desktop search bar */}
            <form onSubmit={handleSearch} className="header-search-form">
              <span className="header-search-icon">⌕</span>
              <input
                className="header-search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search tools & games..."
              />
            </form>

            {/* Mobile search toggle */}
            <button
              className="header-icon-btn header-search-toggle"
              onClick={() => setSearchOpen(p => !p)}
              aria-label="Search"
            >
              ⌕
            </button>

            {/* Visitor counter */}
            <div className="header-counter">
              <i className="fa-solid fa-users" />
              <span>{visitors !== null ? visitors.toLocaleString() : "—"}</span>
            </div>

            {/* Mobile hamburger */}
            <button
              className={`header-hamburger ${menuOpen ? "header-hamburger-open" : ""}`}
              onClick={() => setMenuOpen(p => !p)}
              aria-label="Menu"
            >
              <span /><span /><span />
            </button>

          </div>
        </header>

        {/* ── MOBILE SEARCH BAR (slides down) ── */}
        {searchOpen && (
          <div className="header-search-mobile">
            <form onSubmit={handleSearch} className="header-search-mobile-form">
              <span className="header-search-icon"><i className="fa-solid fa-magnifying-glass"></i></span>
              <input
                ref={searchRef}
                className="header-search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search tools & games..."
              />
              <button type="submit" className="header-search-go">Go</button>
            </form>
          </div>
        )}

        {/* ── MOBILE DROPDOWN MENU ── */}
        {menuOpen && (
          <div className="header-dropdown" ref={menuRef}>

            {/* Nav links */}
            <div className="dropdown-section">
              <p className="dropdown-label">Navigate</p>
              <div className="dropdown-links">
                {navLinks.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`dropdown-link ${pathname === link.href ? "dropdown-link-active" : ""}`}
                  >
                    <span className="dropdown-link-icon">{link.icon}</span>
                    <span>{link.label}</span>
                    {link.href === "/games" && (
                      <span className="dropdown-badge-live">LIVE</span>
                    )}
                  </Link>
                ))}
              </div>
            </div>

            <div className="dropdown-divider" />

            {/* More links */}
            <div className="dropdown-section">
              <p className="dropdown-label">More</p>
              <div className="dropdown-links">
                {moreLinks.map(link => (
                  <Link key={link.href} href={link.href} className="dropdown-link">
                    <span className="dropdown-link-icon">{link.icon}</span>
                    <span>{link.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="dropdown-divider" />

            {/* Promo */}
            <div className="dropdown-promo">
              <p className="dropdown-promo-title"><i className="fa-solid fa-share-nodes"></i> Share CUBOSAPIENS</p>
              <p className="dropdown-promo-desc">Free tools & games for everyone — share with friends!</p>
              <button
                className="dropdown-promo-btn"
                onClick={() => {
                  navigator.share?.({
                    title: "CUBOSAPIENS",
                    text:  "Free tools, games & AI — no signup needed!",
                    url:   "https://cubosapiens.world",
                  }) ?? navigator.clipboard.writeText("https://cubosapiens.world")
                }}
              >
                Share Link
              </button>
            </div>

          </div>
        )}
      </div>
    </>
  )
}