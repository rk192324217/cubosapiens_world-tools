// Build-time only. Reads content/blogs/*.md and writes
// src/lib/blogData.generated.ts so the app never needs `fs` at
// runtime (the Cloudflare Worker has no filesystem access to
// bundled project files).
// Runs via the "generate:blogs" script, wired into "predev"/"prebuild".

import fs     from "fs"
import path   from "path"
import matter from "gray-matter"

const ROOT      = path.join(import.meta.dirname, "..")
const BLOGS_DIR = path.join(ROOT, "content", "blogs")
const OUT_FILE  = path.join(ROOT, "src", "lib", "blogData.generated.ts")

function calcReadingTime(markdown) {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

function loadPosts() {
  if (!fs.existsSync(BLOGS_DIR)) return []

  return fs
    .readdirSync(BLOGS_DIR)
    .filter(f => f.endsWith(".md"))
    .map(f => {
      const slug              = f.replace(/\.md$/, "")
      const raw               = fs.readFileSync(path.join(BLOGS_DIR, f), "utf-8")
      const { data, content } = matter(raw)

      return {
        slug,
        title:          data.title        ?? "Untitled",
        description:    data.description  ?? "",
        author:         data.author       ?? "Anonymous",
        authorGithub:   data.authorGithub ?? null,
        date:           data.date         ? String(data.date) : "",
        tags:           data.tags         ?? [],
        content,
        readingTimeMin: calcReadingTime(content),
      }
    })
}

const posts = loadPosts()

const banner = `// GENERATED FILE — do not edit by hand.
// Produced by scripts/generate-blog-data.mjs from content/blogs/*.md
// at build time. Regenerate via \`npm run generate:blogs\`.

import type { BlogPost } from "./blogLoader"

export const generatedBlogPosts: BlogPost[] = ${JSON.stringify(posts, null, 2)}
`

fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true })
fs.writeFileSync(OUT_FILE, banner)

console.log(`[generate-blog-data] wrote ${posts.length} post(s) to ${path.relative(ROOT, OUT_FILE)}`)
