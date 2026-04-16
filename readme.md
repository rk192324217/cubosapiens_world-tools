# CUBOSAPIENS — Free Tools, Games & AI

> One platform. Free tools, games and AI for everyone.
> No signup. No cost. Always free.

🌐 **Live:** [cubosapiens.world](https://cubosapiens.world)

## What is CUBOSAPIENS?

A growing collection of free browser-based tools, games and AI
built for everyone on the internet. All processing happens in
your browser — we never upload or store your files.

## Tech Stack

| Layer     | Technology                    |
|-----------|-------------------------------|
| Frontend  | Next.js 15, TypeScript        |
| Styling   | Tailwind CSS v4, Custom CSS   |
| Backend   | Hono.js on Cloudflare Workers |
| Database  | PostgreSQL (Supabase)         |
| ORM       | Prisma 6                      |
| Hosting   | Cloudflare Pages + Workers    |
| Monorepo  | Turborepo                     |

## Live Tools

| Tool            | URL                                    |
|-----------------|----------------------------------------|
| GPS CAM         | gps-cam.cubosapiens.world              |
| QR Generator    | qr.cubosapiens.world                   |

## Project Structure

\`\`\`
cubosapiens/
├── apps/
│   ├── web/        ← Next.js frontend
│   └── api/        ← Hono.js REST API
└── packages/
    └── shared/     ← Shared TypeScript types
\`\`\`

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md)

## GirlScript Summer of Code 2025

This project is participating in GSSoC 2025.
Check [Issues](https://github.com/rk192324217/cubosapiens_world-tools/issues)
for tasks labeled `gssoc`.

## License

MIT License — see [LICENSE](./LICENSE)