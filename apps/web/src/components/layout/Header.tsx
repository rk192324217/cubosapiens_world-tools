"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { fetchCounters } from "@/lib/api"

export default function Header() {

  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return false
    return localStorage.getItem("theme") === "dark"
  })

  const [visitors, setVisitors] = useState<number | null>(null)
  const [search, setSearch] = useState("")
  const router = useRouter()

  useEffect(() => {
    document.body.classList.toggle("dark", isDark)
    document.body.classList.toggle("light", !isDark)
    localStorage.setItem("theme", isDark ? "dark" : "light")
  }, [isDark])

  useEffect(() => {
    fetchCounters().then(d => setVisitors(d.visits))
  }, [])

  function toggleTheme() {
    setIsDark(prev => !prev)
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

        <Link href="/" className="header-logo">
          <div className="header-logo-icon">C</div>
          <span className="header-logo-text">CUBOSAPIENS</span>
        </Link>

        <nav className="header-nav">
          <Link href="/">Home</Link>
          <Link href="/tools">Tools</Link>
          <Link href="/games">Games</Link>
          <Link href="/ai">AI</Link>
        </nav>

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