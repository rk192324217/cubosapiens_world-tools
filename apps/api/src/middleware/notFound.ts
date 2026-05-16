// ─────────────────────────────────────────────────────────────
// CUBOSAPIENS API — 404 Not Found Handler
// Returns a standardized response for undefined routes
// ─────────────────────────────────────────────────────────────

import type { NotFoundHandler } from "hono"


/**
 * Handles requests to routes that don't exist.
 *
 * Without this, Hono returns its own default "404 Not Found" text,
 * which doesn't match our API response structure.
 *
 * Now accessing /api/some-random-path returns:
 * {
 *   "success": false,
 *   "data":    null,
 *   "error": {
 *     "message":    "Route GET /api/some-random-path not found",
 *     "code":       "ROUTE_NOT_FOUND",
 *     "statusCode": 404
 *   }
 * }
 */
export const notFoundHandler: NotFoundHandler = (c) => {
  return c.json(
    {
      success: false as const,
      data:    null,
      error: {
        message:    `Route ${c.req.method} ${c.req.path} not found`,
        code:       "ROUTE_NOT_FOUND",
        statusCode: 404,
      },
    },
    404
  )
}
