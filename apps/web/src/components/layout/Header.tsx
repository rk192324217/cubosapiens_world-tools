"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
// import { fetchCounters } from "@/lib/api"

const navLinks = [
  { href: "/", label: "Home", icon: <i className="fa-regular fa-house"></i> },
  { href: "/tools", label: "Tools", icon: <i className="fa-solid fa-screwdriver-wrench"></i> },
  { href: "/games", label: "Games", icon: <i className="fa-solid fa-gamepad"></i> },
  { href: "/ai", label: "AI", icon: <i className="fa-solid fa-robot"></i> },
  { href: "/blog",  label: "Blog",  icon: <i className="fa-solid fa-newspaper"></i> },
]

const moreLinks = [
  { href: "/about", label: "About", icon: <i className="fa-solid fa-circle-info"></i> },
  { href: "/contact", label: "Contact", icon: <i className="fa-regular fa-circle-user"></i> },
  { href: "/privacy", label: "Privacy Policy", icon: <i className="fa-solid fa-user-shield"></i> },
  { href: "/terms", label: "Terms of Use", icon: <i className="fa-solid fa-file-contract"></i> },
]

export default function Header() {
  const [visitors, setVisitors] = useState<number | null>(null)
  const [search, setSearch] = useState("")
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const menuRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const hamburgerRef = useRef<HTMLButtonElement>(null)

  // useEffect(() => {
  //   fetchCounters().then(d => setVisitors(d.visits))
  // }, [])

  // Close menu on route change
  useEffect(() => { setMenuOpen(false) }, [pathname])

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        hamburgerRef.current && !hamburgerRef.current.contains(e.target as Node)
      )
        setMenuOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [menuOpen])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (search.trim()) {
      router.push(`/search?q=${encodeURIComponent(search.trim())}`)
      setSearchOpen(false)
      setSearch("")
    }
  }
  const handleShare = async () => {
    const shareData = {
      title: "CUBOSAPIENS",
      text: "Free tools, games & AI — no signup needed!",
      url: "https://cubosapiens.world",
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(shareData.url)
        alert("Link copied to clipboard!")
      }
    } catch (error) {
      console.error("Share failed:", error)
    }
  }

  return (
    <>
      {/* Inject Font Awesome once */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
      />

      <div className="header-wrap relative">
        <header className="header flex items-center justify-between w-full px-4 lg:px-6">

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
          <nav className="header-nav hidden lg:flex items-center gap-2 xl:gap-4 shrink-0">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`header-nav-link px-1 xl:px-3 ${pathname === link.href ? "header-nav-active" : ""}`}
              >
                {link.label}
              </Link>
            ))}
            <button
              className="header-nav-link"
              onClick={handleShare}
              aria-label="Share website"
            >
              <i className="fa-solid fa-share-nodes"></i>
            </button>
          </nav>

          {/* ── RIGHT SIDE ── */}
          <div className="header-right flex items-center gap-3">

            {/* Desktop search bar */}
            <form onSubmit={handleSearch} className="header-search-form !hidden lg:!flex items-center">
              <span className="header-search-icon">⌕</span>
              <input
                className="header-search !w-full max-w-[140px] xl:max-w-[220px]"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search tools & games..."
              />
            </form>

            {/* Mobile search toggle */}
            <button
              className="header-icon-btn !flex lg:!hidden relative text-xl p-2 z-10 items-center justify-center text-white" //made the screen medium from tablet to laptop point of view
              onClick={() => setSearchOpen(p => !p)}
              aria-label="Search"
            >
              ⌕
            </button>

            {/* Visitor counter */}
            {/* <div className="header-counter">
              <i className="fa-solid fa-users" />
              <span>{visitors !== null ? visitors.toLocaleString() : "—"}</span>
            </div> */}

            {/* Mobile hamburger */}
            <button
              ref={hamburgerRef}
              className={`header-hamburger relative lg:hidden z-10 ${menuOpen ? "header-hamburger-open" : ""}`}
              onClick={() => setMenuOpen(p => !p)}
              aria-label="Menu"
            >
              <span /><span /><span />
            </button>

          </div>
        </header>
        {/* ── MOBILE SEARCH BAR (slides down) ── */}
        {searchOpen && ( // added a fluid mobile search instead of a rigid one, below the header so while ensuring the text below isnt overlapping
          <div className="absolute left-0 right-0 top-full z-50 w-full flex justify-center px-4 pt-2 pb-3 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5">
            <form onSubmit={handleSearch} className="header-search-mobile-form flex items-center">
              <span className="header-search-icon">⌕</span>
              <input
                className="header-search !w-full"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search tools & games..."
                autoFocus
              />
            </form>
          </div>
        )}

        {/* ── MOBILE DROPDOWN MENU ── */}
        {menuOpen && ( // added an additional functionality so that the X works and the menu is closeable in phone.
          <div className="header-dropdown" ref={menuRef}>
            <button
              className="dropdown-promo-btn"
              onClick={handleShare}
            >
              <i className="fa-solid fa-share-nodes"></i> Share Website
            </button>

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



          </div>
        )}
      </div>
    </>
  )
}