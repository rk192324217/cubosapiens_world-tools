import type { MetadataRoute } from "next"
import { fetchTools, fetchGames, }         from "@/lib/api"

export default async function sitemap(): Promise<MetadataRoute.Sitemap>
{
  const tools = await fetchTools()
  const games= await fetchGames()

  const toolPages = tools.map(tool => ({
    url:          `https://cubosapiens.world/tools/${tool.slug}`,
    lastModified: new Date(tool.createdAt),
    changeFrequency: "weekly" as const,
    priority:     tool.isLive ? 0.8 : 0.4,
  }))
  const gamePages = games.map(game => ({
    url:          `https://cubosapiens.world/games/${game.slug}`,
    lastModified: new Date(game.createdAt),
    changeFrequency: "weekly" as const,
    priority:     game.isLive ? 0.9 : 0.4,
  }))

  return [
    {
      url:             "https://cubosapiens.world",
      lastModified:    new Date(),
      changeFrequency: "daily",
      priority:        1.0,
    },
    {
      url:             "https://cubosapiens.world/tools",
      lastModified:    new Date(),
      changeFrequency: "daily",
      priority:        0.9,
    },
    {
      url:             "https://cubosapiens.world/about",
      lastModified:    new Date(),
      changeFrequency: "monthly",
      priority:        0.5,
    },
    {
      url:             "https://cubosapiens.world/contact",
      lastModified:    new Date(),
      changeFrequency: "monthly",
      priority:        0.5,
    },
    {
      url:             "https://cubosapiens.world/privacy",
      lastModified:    new Date(),
      changeFrequency: "yearly",
      priority:        0.3,
    },
    {
      url:             "https://cubosapiens.world/terms",
      lastModified:    new Date(),
      changeFrequency: "yearly",
      priority:        0.3,
    },
    ...toolPages,...gamePages,
  ]
}