import { z } from "zod"

export const gameQuerySchema = z.object({
  genre: z.string().optional(),
  live: z.enum(["true", "false"]).optional(),
})

export const gameSlugSchema = z.object({
  slug: z.string().regex(
    /^[a-z0-9-]+$/,
    "Invalid slug format"
  ),
})