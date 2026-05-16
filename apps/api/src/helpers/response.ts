// ─────────────────────────────────────────────────────────────
// CUBOSAPIENS API — Standardized Response Helpers
// Ensures every successful response has the same shape
// ─────────────────────────────────────────────────────────────

import type { Context }              from "hono"
import type { ContentfulStatusCode } from "hono/utils/http-status"


/**
 * Standard success response shape:
 * {
 *   "success": true,
 *   "data":    <T>,
 *   "error":   null
 * }
 *
 * Use this everywhere instead of raw c.json() to guarantee
 * the frontend always receives a consistent structure.
 */
export function successResponse<T>(
  c:          Context,
  data:       T,
  statusCode: ContentfulStatusCode = 200
) {
  return c.json(
    {
      success: true  as const,
      data,
      error:   null,
    },
    statusCode
  )
}
