// apps/web/src/app/blog/[slug]/page.tsx
// Statically generated at build time for every .md file in
// content/blogs/.  Uses react-markdown for proper rendering
// with syntax highlighting and GFM support.

import { notFound }       from "next/navigation"
import Link               from "next/link"
import type { Metadata }  from "next"
import ReactMarkdown      from "react-markdown"
import remarkGfm          from "remark-gfm"
import rehypeHighlight    from "rehype-highlight"
import rehypeSlug         from "rehype-slug"
import { getAllBlogSlugs, getBlogBySlug } from "@/lib/blogLoader"
import { TAG_LABELS, formatDate }         from "@/lib/utils"

// Pre-generate a static page for every blog post at build time.
// New posts added via PR get a page on next deploy.
export async function generateStaticParams() {
  return getAllBlogSlugs().map(slug => ({ slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const post = getBlogBySlug(slug)
  if (!post) return { title: "Blog Not Found" }

  return {
    title:       `${post.title} — CUBOSAPIENS Blog`,
    description: post.description || post.content.slice(0, 160).replace(/[#*`]/g, ""),
    authors:     [{ name: post.author }],
    alternates:  { canonical: `https://cubosapiens.world/blog/${slug}` },
    openGraph: {
      type:          "article",
      title:         post.title,
      description:   post.description,
      publishedTime: post.date,
      url:           `https://cubosapiens.world/blog/${slug}`,
      siteName:      "CUBOSAPIENS",
      images: [{ url: "https://cubosapiens.world/og-image.png", width: 1200, height: 630 }],
    },
    twitter: {
      card:        "summary_large_image",
      title:       post.title,
      description: post.description,
      images:      ["https://cubosapiens.world/og-image.png"],
    },
  }
}

export default async function BlogDetailPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const post = getBlogBySlug(slug)

  if (!post) notFound()

  return (
    <div className="page-container">

      {/* Breadcrumb */}
      <div className="blog-breadcrumb">
        <Link href="/blog" className="blog-breadcrumb-link">← Blog</Link>
        <span className="blog-breadcrumb-sep">/</span>
        <span className="blog-breadcrumb-current">{post.title}</span>
      </div>

      <article className="blog-article">

        {/* Tags */}
        <div className="blog-card-tags">
          {post.tags.map(tag => (
            <span key={tag} className={`blog-tag blog-tag-${tag}`}>
              {TAG_LABELS[tag]}
            </span>
          ))}
        </div>

        {/* Title */}
        <h1 className="blog-article-title">{post.title}</h1>

        {/* Author + meta row */}
        <div className="blog-article-meta">
          <div>
            <p className="blog-author-name">
              {post.authorGithub ? (
                <a
                  href={`https://github.com/${post.authorGithub}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="blog-author-github-link"
                >
                  {post.author}
                </a>
              ) : (
                post.author
              )}
            </p>
            <p className="blog-article-date">
              {formatDate(post.date)} · {post.readingTimeMin} min read
            </p>
          </div>
        </div>

        {/* Divider */}
        <hr className="blog-article-divider" />

        {/* Content — rendered via react-markdown with GFM + syntax highlighting */}
        <div className="blog-article-body">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight, rehypeSlug]}
          >
            {post.content}
          </ReactMarkdown>
        </div>

        {/* Back link */}
        <div className="blog-article-back">
          <Link href="/blog" className="blog-breadcrumb-link">← Back to all articles</Link>
        </div>

      </article>
    </div>
  )
}
