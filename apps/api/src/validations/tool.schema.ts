import { z } from "zod"

export const toolQuerySchema = z.object({
  category: z.string().optional(),
  live: z.enum(["true", "false"]).optional(),
})

export const toolSlugSchema = z.object({
  slug: z.string().regex(
    /^[a-z0-9-]+$/,
    "Invalid slug format"
  ),
})