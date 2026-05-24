// apps/web/src/components/blog/BlogFilter.tsx
// Pure client-side filter.  All blog data is passed in as a prop
// from the server component (blog/page.tsx) — no useEffect, no
// loading spinner, no API call.

"use client"

import { useState, useMemo } from "react"
import BlogCard from "@/components/blog/BlogCard"
import type { BlogPost } from "@/lib/blogLoader"
import type { BlogTag }  from "@/types"

const CATEGORIES: { key: string; label: string }[] = [
  { key: "all",       label: "All"            },
  { key: "technical", label: "Technical"      },
  { key: "oss",       label: "OSS"            },
  { key: "guides",    label: "Guides"         },
  { key: "general",   label: "General (Engg)" },
  { key: "others",    label: "Others"         },
]

// Points contributors to the PR workflow instead of a form page.
const CONTRIBUTE_URL =
  "https://github.com/rk192324217/cubosapiens_world-tools/blob/main/CONTRIBUTING.md#writing-a-blog-post"

interface Props {
  blogs: BlogPost[]
}

export default function BlogFilter({ blogs }: Props) {
  const [active, setActive] = useState("all")

  const filtered = useMemo(() =>
    active === "all"
      ? blogs
      : blogs.filter(b => b.tags.includes(active as BlogTag)),
    [active, blogs]
  )

  return (
    <>
      {/* Filter tabs */}
      <div className="filter-tabs">
        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            className={`filter-tab ${active === cat.key ? "filter-tab-active" : ""}`}
            onClick={() => setActive(cat.key)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="tools-count">
        {filtered.length} article{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* Grid */}
      <div className="blog-grid">

        {/* Contribute CTA — links to CONTRIBUTING.md PR guide */}
        <a
          href={CONTRIBUTE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="blog-new-card"
        >
          <span className="blog-new-plus">+</span>
          <span className="blog-new-label">Contribute a blog via PR</span>
        </a>

        {filtered.map(blog => (
          <BlogCard key={blog.slug} blog={blog} />
        ))}

      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <p>No articles in this category yet</p>
          <span>Be the first to contribute one!</span>
        </div>
      )}
    </>
  )
}
