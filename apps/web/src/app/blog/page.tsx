// apps/web/src/app/blog/page.tsx
// Server component — reads all blog posts from the filesystem at
// request time (ISR every hour).  Passes the list to BlogFilter
// as a prop; no client-side API fetch needed.

import type { Metadata } from "next"
import { getAllBlogs }    from "@/lib/blogLoader"
import BlogFilter        from "@/components/blog/BlogFilter"

export const revalidate = 3600   // rebuild at most once per hour

export const metadata: Metadata = {
  title:       "Blog - Cubosapiens",
  description: "Community blogs on technical topics, open source, engineering guides and more.",
  keywords:    ["blog", "technical blog", "open source", "engineering", "guides", "cubosapiens"],
  authors:     [{ name: "CUBOSAPIENS", url: "https://cubosapiens.world/blog" }],
  creator:     "CUBOSAPIENS",
  metadataBase: new URL("https://cubosapiens.world/blog"),
  alternates: { canonical: "https://cubosapiens.world/blog" },
  openGraph: {
    type:        "website",
    locale:      "en_US",
    url:         "https://cubosapiens.world/blog",
    siteName:    "CUBOSAPIENS",
    title:       "Blog — CUBOSAPIENS",
    description: "Community blogs on technical topics, open source, engineering guides and more.",
    images: [{ url: "https://cubosapiens.world/og-image.png", width: 1200, height: 630, alt: "CUBOSAPIENS Blog" }],
  },
  twitter: {
    card:        "summary_large_image",
    title:       "Blog — CUBOSAPIENS",
    description: "Community blogs on technical topics, open source, engineering guides and more.",
    images:      ["https://cubosapiens.world/og-image.png"],
  },
}

export default function BlogPage() {
  const blogs = getAllBlogs()

  return (
    <div className="page-container">

      {/* Page hero */}
      <div className="page-hero">
        <span className="section-tag">Community articles</span>
        <h1 className="page-hero-title">Blog</h1>
        <p className="page-hero-sub">
          Technical write-ups, OSS learnings, guides and engineering stories from the community.
        </p>
      </div>

      {/* Client filter + grid — all blog data passed as prop, no fetch */}
      <BlogFilter blogs={blogs} />

    </div>
  )
}
