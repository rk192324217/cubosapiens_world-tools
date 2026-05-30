---
title: "How to Contribute Blogs to cubosapiens_world-tools"
description: "A practical step-by-step guide to making your first blog on this website."
author: "Jane Dev"
authorGithub: "janedev"
date: "2025-05-21"
tags: ["guides"]
---

# Blog Posts

The directory that contains all blog posts for `cubosapiens_world-tools` is: [cubosapiens.world/blog](https://cubosapiens.world/blog). Each `.md` file becomes a page at `/blog/<filename-without-extension>` dynamically at runtime by utilizing a provision presented by `Next.js`.

## Adding a post

See the [Contributing Guide](../../../../CONTRIBUTING.md#writing-a-blog-post) for full instructions.

Quick summary:
1. Create a new `.md` file in the directory mentioned above.
2. Add the required frontmatter (title, description, author, date, tags). The template is given below:

```
---
title: "How to Contribute Blogs to cubosapiens_world-tools"
description: "A practical step-by-step guide to making your first blog on this website."
author: "Jane Dev"
authorGithub: "janedev"
date: "2025-05-21"
tags: ["guides"]
---

# Heading 1
## Heading 2
### Heading 3
Normal content.

Inline code and Code blocks are also incorporated using relevant Markdown syntax.
```

3. Write your post in Markdown below the frontmatter.
4. Open a Pull Request: after review and merge your post goes live on the next deploy.

And that's how you just created your first blog! Congratulations!

## Frontmatter fields

| Field | Required | Description |
|---|---|---|
| `title` | Yes | Post title shown on card and article page |
| `description` | Yes | Short summary (≤ 160 chars) for card + SEO |
| `author` | Yes | Your display name |
| `authorGithub` | optional | Your GitHub username — links your name |
| `date` | Yes | Publish date in `YYYY-MM-DD` format |
| `tags` | Yes | Array of one or more: `technical`, `oss`, `guides`, `general`, `others` |
