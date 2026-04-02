"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { fetchCounters } from "@/lib/api"
import Image from "next/image";

export default function Header() {
  //setIsDark
  const [isDark] = useState(() => {
    if (typeof window === "undefined") return false
    return localStorage.getItem("theme") === "dark"
  })

  const [visitors, setVisitors] = useState<number | null>(null)
  const [search, setSearch] = useState("")
  const router = useRouter()

  useEffect(() => {
    document.body.classList.toggle("dark", isDark)
    // document.body.classList.toggle("light", !isDark)
    // localStorage.setItem("theme", isDark ? "dark" : "light")
  }, [isDark])

  useEffect(() => {
    fetchCounters().then(d => setVisitors(d.visits))
  }, [])

  // function toggleTheme() {
  //   setIsDark(prev => !prev)
  // }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (search.trim()) {
      router.push(`/search?q=${encodeURIComponent(search.trim())}`)
    }
  }

  return (
    <div className="header-wrap">
      <header className="header">
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
        <Link href="/" className="header-logo">

          <Image

            src="/logo.png"
            alt="logo"
            className="header-logo-icon"
            width={38}
            height={38}
            priority
            unoptimized
          />
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
              placeholder="Search"
            />
          </form>

          <div className="header-counter">
            <i className="fa-solid fa-users counter-icon"></i>
            <span>
              {visitors !== null ? visitors.toLocaleString() : "—"}
            </span>
          </div>

          {/* <button className="header-toggle" onClick={toggleTheme}>
            {isDark ? "☀" : "☾"}
          </button> */}

        </div>
      </header>
    </div>
  )
}