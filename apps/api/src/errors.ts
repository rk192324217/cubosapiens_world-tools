// ─────────────────────────────────────────────────────────────
// CUBOSAPIENS API — Custom Error Classes
// Typed error hierarchy for consistent API error handling
// ─────────────────────────────────────────────────────────────

/**
 * Base API error class.
 * All custom errors extend this so the global error handler
 * can distinguish known errors from unexpected crashes.
 *
 * @param statusCode  HTTP status code (e.g. 400, 404, 500)
 * @param message     Human-readable error message for the client
 * @param code        Machine-readable error code (e.g. "NOT_FOUND")
 */
export class ApiError extends Error {
  public readonly statusCode: number
  public readonly code: string

  constructor(statusCode: number, message: string, code?: string) {
    super(message)
    this.name       = "ApiError"
    this.statusCode = statusCode
    this.code       = code || "API_ERROR"

    // Maintains proper stack trace in V8 environments
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}


// ── 400 — Bad Request ─────────────────────────────────────────
// Use when the client sends invalid or malformed input
// Example: missing required query param, invalid slug format

export class ValidationError extends ApiError {
  constructor(message = "Invalid request data") {
    super(400, message, "VALIDATION_ERROR")
    this.name = "ValidationError"
  }
}


// ── 401 — Unauthorized ───────────────────────────────────────
// Use when authentication is required but not provided
// Example: missing API key, expired token

export class UnauthorizedError extends ApiError {
  constructor(message = "Authentication required") {
    super(401, message, "UNAUTHORIZED")
    this.name = "UnauthorizedError"
  }
}


// ── 403 — Forbidden ──────────────────────────────────────────
// Use when the user is authenticated but lacks permission
// Example: trying to access admin-only routes

export class ForbiddenError extends ApiError {
  constructor(message = "Access denied") {
    super(403, message, "FORBIDDEN")
    this.name = "ForbiddenError"
  }
}


// ── 404 — Not Found ──────────────────────────────────────────
// Use when the requested resource doesn't exist
// Example: /api/tools/nonexistent-slug

export class NotFoundError extends ApiError {
  constructor(message = "Resource not found") {
    super(404, message, "NOT_FOUND")
    this.name = "NotFoundError"
  }
}


// ── 429 — Too Many Requests ──────────────────────────────────
// Use when a client exceeds rate limits
// Reserved for future rate-limiting middleware (Issue #24)

export class RateLimitError extends ApiError {
  constructor(message = "Too many requests, please try again later") {
    super(429, message, "RATE_LIMITED")
    this.name = "RateLimitError"
  }
}


// ── 500 — Internal Server Error ──────────────────────────────
// Use for unexpected server-side failures
// The global handler also uses this as the fallback

export class InternalError extends ApiError {
  constructor(message = "An unexpected error occurred") {
    super(500, message, "INTERNAL_ERROR")
    this.name = "InternalError"
  }
}
