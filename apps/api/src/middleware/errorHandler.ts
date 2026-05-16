// ─────────────────────────────────────────────────────────────
// CUBOSAPIENS API — Global Error Handling Middleware
// Catches all thrown errors and returns a standardized response
// ─────────────────────────────────────────────────────────────

import type { ErrorHandler } from "hono"
import { ApiError }          from "../errors"


/**
 * Standard error response shape:
 * {
 *   "success": false,
 *   "data":    null,
 *   "error": {
 *     "message":    "Human-readable description",
 *     "code":       "MACHINE_READABLE_CODE",
 *     "statusCode": 404
 *   }
 * }
 *
 * Key behaviors:
 * - Known ApiError instances → return the error's own status, message, and code
 * - Unknown errors          → return generic 500 without leaking internals
 * - All errors are logged server-side with full details for debugging
 */
export const errorHandler: ErrorHandler = (err, c) => {

  // ── Log the full error server-side ─────────────────────────
  // This is visible in Cloudflare Workers logs / wrangler tail
  // We always log the real error, even if we hide it from clients
  console.error(`[API ERROR] ${err.message}`, {
    name:    err.name,
    stack:   err.stack,
    path:    c.req.path,
    method:  c.req.method,
  })


  // ── Known API errors ───────────────────────────────────────
  // These are errors we explicitly threw (e.g. NotFoundError)
  // Safe to return their message to the client

  if (err instanceof ApiError) {
    return c.json(
      {
        success: false as const,
        data:    null,
        error: {
          message:    err.message,
          code:       err.code,
          statusCode: err.statusCode,
        },
      },
      err.statusCode as 400 | 401 | 403 | 404 | 429 | 500
    )
  }


  // ── Unknown / unexpected errors ────────────────────────────
  // Never expose internal details (stack traces, DB errors, etc.)
  // Return a safe generic message instead

  return c.json(
    {
      success: false as const,
      data:    null,
      error: {
        message:    "An unexpected error occurred",
        code:       "INTERNAL_ERROR",
        statusCode: 500,
      },
    },
    500
  )
}
