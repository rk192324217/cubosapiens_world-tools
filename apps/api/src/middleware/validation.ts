import { zValidator } from "@hono/zod-validator"

export const validate = (
  target: "query" | "param" | "json",
  schema: any
) =>
  zValidator(target, schema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          success: false,
          error: "Validation Error",
          details: result.error.issues,
        },
        400
      )
    }
  })