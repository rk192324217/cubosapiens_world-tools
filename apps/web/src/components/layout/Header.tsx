"use client"

import { useState, useEffect, useLayoutEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { fetchCounters } from "@/lib/api"

export default function Header() {
  // ✅ Initialize from localStorage safely
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return false
    return localStorage.getItem("theme") === "dark"
  })

  const [visitors, setVisitors] = useState<number | null>(null)
  const [search, setSearch] = useState("")
  const router = useRouter()

  // ✅ Only sync DOM, no setState here
  useLayoutEffect(() => {
    document.body.classList.toggle("dark", isDark)
    document.body.classList.toggle("light", !isDark)
  }, [isDark])

  // ✅ Fetch once
  useEffect(() => {
    fetchCounters().then(d => setVisitors(d.visits))
  }, [])

  function toggleTheme() {
    const next = !isDark
    setIsDark(next)
    localStorage.setItem("theme", next ? "dark" : "light")
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (search.trim()) {
      router.push(`/search?q=${encodeURIComponent(search.trim())}`)
    }
  }

  return (
    <div className="header-wrap">
      <header className="header">

        {/* Logo */}
        <Link href="/" className="header-logo">
          <div className="header-logo-icon">C</div>
          <span className="header-logo-text">CUBOSAPIENS</span>
        </Link>

        {/* Nav */}
        <nav className="header-nav">
          <Link href="/">Home</Link>
          <Link href="/tools">Tools</Link>
          <Link href="/games">Games</Link>
          <Link href="/ai">AI</Link>
        </nav>

        {/* Right */}
        <div className="header-right">

          <form onSubmit={handleSearch}>
            <input
              className="header-search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search tools..."
            />
          </form>

          <div className="header-counter">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
            </svg>
            <span>{visitors !== null ? visitors.toLocaleString() : "—"}</span>
          </div>

          <button className="header-toggle" onClick={toggleTheme}>
            {isDark ? "☀" : "☾"}
          </button>

        </div>
      </header>
    </div>
  )
}