import type { Middleware } from "@pyreon/server"
import { withHeaders } from "./utils/with-headers"

// ─── Cache control middleware ───────────────────────────────────────────────
//
// Smart caching middleware that sets appropriate cache headers based on
// asset type, URL patterns, and build hashes.
//
// Strategies:
// - Immutable: hashed assets (JS/CSS bundles) — cached forever
// - Static: images, fonts, media — long cache with revalidation
// - Dynamic: HTML pages — short or no cache, stale-while-revalidate
// - API: JSON responses — no cache by default

export interface CacheConfig {
  /** Cache duration for immutable hashed assets (seconds). Default: 31536000 (1 year) */
  immutable?: number
  /** Cache duration for static assets like images/fonts (seconds). Default: 86400 (1 day) */
  static?: number
  /** Cache duration for pages (seconds). Default: 0 (no cache) */
  pages?: number
  /** Stale-while-revalidate window for pages (seconds). Default: 60 */
  staleWhileRevalidate?: number
  /** Custom rules by URL pattern. */
  rules?: CacheRule[]
}

export interface CacheRule {
  /** URL pattern to match (glob-style). e.g. "/api/*" */
  match: string
  /** Cache-Control header value. */
  control: string
}

const HASHED_ASSET = /\.[a-f0-9]{8,}\.\w+$/
const STATIC_EXT = /\.(png|jpe?g|gif|svg|webp|avif|ico|woff2?|ttf|otf|eot|mp4|webm|ogg|mp3|wav)$/i
const SCRIPT_EXT = /\.(js|css|mjs)$/i

function matchGlob(pattern: string, path: string): boolean {
  // Escape regex special chars, then convert glob wildcards
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&")
  const regex = escaped
    .replace(/\*/g, ".*")
    .replace(/\?/g, ".")
  return new RegExp(`^${regex}$`).test(path)
}

/**
 * Cache control middleware for Zero.
 * Automatically sets optimal Cache-Control headers based on asset type.
 *
 * @example
 * import { cacheMiddleware } from "@pyreon/zero/cache"
 *
 * export default createServer({
 *   routes,
 *   middleware: [
 *     cacheMiddleware({
 *       pages: 60,
 *       staleWhileRevalidate: 300,
 *       rules: [
 *         { match: "/api/*", control: "no-store" },
 *       ],
 *     }),
 *   ],
 * })
 */
export function cacheMiddleware(config: CacheConfig = {}): Middleware {
  const immutableDuration = config.immutable ?? 31536000
  const staticDuration = config.static ?? 86400
  const pageDuration = config.pages ?? 0
  const swr = config.staleWhileRevalidate ?? 60
  const rules = config.rules ?? []

  return (request, next) => {
    const url = new URL(request.url)
    const path = url.pathname

    return next(request).then((response) => {
      // Skip if Cache-Control is already set
      if (response.headers.has("Cache-Control")) return response

      // Check custom rules first
      for (const rule of rules) {
        if (matchGlob(rule.match, path)) {
          return withHeaders(response, (h) => h.set("Cache-Control", rule.control))
        }
      }

      let cacheControl: string

      if (HASHED_ASSET.test(path)) {
        // Hashed assets are immutable — cache forever
        cacheControl = `public, max-age=${immutableDuration}, immutable`
      } else if (SCRIPT_EXT.test(path)) {
        // Unhashed JS/CSS — short cache with revalidation
        cacheControl = `public, max-age=3600, stale-while-revalidate=${swr}`
      } else if (STATIC_EXT.test(path)) {
        // Static assets — long cache
        cacheControl = `public, max-age=${staticDuration}, stale-while-revalidate=${swr}`
      } else if (
        response.headers.get("content-type")?.includes("text/html")
      ) {
        // HTML pages
        if (pageDuration > 0) {
          cacheControl = `public, max-age=${pageDuration}, stale-while-revalidate=${swr}`
        } else {
          cacheControl = "no-cache"
        }
      } else {
        // Default: short cache
        cacheControl = `public, max-age=60, stale-while-revalidate=${swr}`
      }

      return withHeaders(response, (h) => h.set("Cache-Control", cacheControl))
    })
  }
}

/**
 * Security headers middleware.
 * Adds common security headers to all responses.
 */
export function securityHeaders(): Middleware {
  return (request, next) => {
    return next(request).then((response) =>
      withHeaders(response, (h) => {
        h.set("X-Content-Type-Options", "nosniff")
        h.set("X-Frame-Options", "DENY")
        h.set("X-XSS-Protection", "1; mode=block")
        h.set("Referrer-Policy", "strict-origin-when-cross-origin")
        h.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
      }),
    )
  }
}

/**
 * Compression detection middleware.
 * Sets Vary: Accept-Encoding header so caches can serve compressed variants.
 * Actual compression is handled by the runtime (Bun/Node) or reverse proxy.
 */
export function varyEncoding(): Middleware {
  return (request, next) => {
    return next(request).then((response) =>
      withHeaders(response, (h) => {
        const existing = h.get("Vary")
        if (!existing?.includes("Accept-Encoding")) {
          h.set("Vary", existing ? `${existing}, Accept-Encoding` : "Accept-Encoding")
        }
      }),
    )
  }
}
