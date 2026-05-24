// apps/web/src/components/blog/BlogCard.tsx
import Link from "next/link"
import type { BlogPost } from "@/lib/blogLoader"
import { formatDate, TAG_LABELS } from "@/lib/utils"

interface Props {
  blog: BlogPost
}

export default function BlogCard({ blog }: Props) {
  // Use the frontmatter description as excerpt; fall back to stripping
  // markdown from the content body.
  const excerpt = blog.description
    || blog.content
         .replace(/```[\s\S]*?```/g, "")
         .replace(/`[^`]*`/g, "")
         .replace(/!\[.*?\]\(.*?\)/g, "")
         .replace(/\[([^\]]+)\]\(.*?\)/g, "$1")
         .replace(/#{1,6}\s+/g, "")
         .replace(/[*_~>|]/g, "")
         .replace(/\n+/g, " ")
         .trim()
         .slice(0, 140) + "…"

  return (
    <Link href={`/blog/${blog.slug}`} className="blog-card">

      {/* Tags */}
      <div className="blog-card-tags">
        {blog.tags.map(tag => (
          <span key={tag} className={`blog-tag blog-tag-${tag}`}>
            {TAG_LABELS[tag]}
          </span>
        ))}
      </div>

      {/* Title */}
      <h2 className="blog-card-title">{blog.title}</h2>

      {/* Excerpt */}
      <p className="blog-card-excerpt">{excerpt}</p>

      {/* Footer */}
      <div className="blog-card-footer">
        <div className="blog-card-author">
          <span className="blog-author-name">{blog.author}</span>
        </div>
        <div className="blog-card-meta">
          <span>{formatDate(blog.date)}</span>
          <span className="blog-meta-dot">·</span>
          <span>{blog.readingTimeMin} min read</span>
        </div>
      </div>

    </Link>
  )
}
