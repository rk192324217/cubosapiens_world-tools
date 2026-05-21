// ─────────────────────────────────────────────────────────────
// blogLoader.ts
// Server-only utility.  Reads .md files from content/blogs/,
// parses gray-matter frontmatter, and returns typed BlogPost
// objects.  Never import this in a client component.
// ─────────────────────────────────────────────────────────────

import fs     from "fs"
import path   from "path"
import matter from "gray-matter"
import type { BlogTag } from "@/types"

const BLOGS_DIR = path.join(process.cwd(), "content", "blogs")

// ── Public type ───────────────────────────────────────────────
// Use this everywhere instead of the old API-backed Blog type.

export interface BlogPost {
  slug:           string        // derived from filename, used as URL
  title:          string
  description:    string        // shown on listing card + meta description
  author:         string
  authorGithub:   string | null // optional — links to github.com/<handle>
  date:           string        // ISO "YYYY-MM-DD"
  tags:           BlogTag[]
  content:        string        // raw markdown body
  readingTimeMin: number
}

// ── Helpers ───────────────────────────────────────────────────

function calcReadingTime(markdown: string): number {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

// ── Public API ────────────────────────────────────────────────

/** Returns every slug (filename minus .md) in the blogs directory. */
export function getAllBlogSlugs(): string[] {
  if (!fs.existsSync(BLOGS_DIR)) return []
  return fs
    .readdirSync(BLOGS_DIR)
    .filter(f => f.endsWith(".md"))
    .map(f => f.replace(/\.md$/, ""))
}

/** Reads and parses a single blog file.  Returns null if not found. */
export function getBlogBySlug(slug: string): BlogPost | null {
  const filePath = path.join(BLOGS_DIR, `${slug}.md`)
  if (!fs.existsSync(filePath)) return null

  const raw               = fs.readFileSync(filePath, "utf-8")
  const { data, content } = matter(raw)

  return {
    slug,
    title:          data.title          ?? "Untitled",
    description:    data.description    ?? "",
    author:         data.author         ?? "Anonymous",
    authorGithub:   data.authorGithub   ?? null,
    date:           data.date           ? String(data.date) : "",
    tags:           (data.tags          ?? []) as BlogTag[],
    content,
    readingTimeMin: calcReadingTime(content),
  }
}

/** Returns all posts sorted newest-first. */
export function getAllBlogs(): BlogPost[] {
  return getAllBlogSlugs()
    .map(getBlogBySlug)
    .filter((b): b is BlogPost => b !== null)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}

/** Returns posts that include a given tag, newest-first. */
export function getBlogsByTag(tag: BlogTag): BlogPost[] {
  return getAllBlogs().filter(b => b.tags.includes(tag))
}
