import type { RouteRecord } from '@pyreon/router'
import type { Middleware, MiddlewareContext } from '@pyreon/server'
import { createHandler } from '@pyreon/server'
import { createApp } from './app'
import type { RouteMiddlewareEntry, ZeroConfig } from './types'

// ─── Server entry factory ───────────────────────────────────────────────────

export interface CreateServerOptions {
  /** Route definitions. */
  routes: RouteRecord[]
  /** Zero config. */
  config?: ZeroConfig
  /** Additional middleware. */
  middleware?: Middleware[]
  /** Per-route middleware from virtual:zero/route-middleware. */
  routeMiddleware?: RouteMiddlewareEntry[]
  /** HTML template override. */
  template?: string
  /** Client entry path. */
  clientEntry?: string
}

/**
 * Create a middleware that dispatches per-route middleware based on URL pattern matching.
 */
function createRouteMiddlewareDispatcher(
  entries: RouteMiddlewareEntry[],
): Middleware {
  return async (ctx: MiddlewareContext) => {
    for (const entry of entries) {
      if (matchPattern(entry.pattern, ctx.path)) {
        const mw = Array.isArray(entry.middleware)
          ? entry.middleware
          : [entry.middleware]
        for (const fn of mw) {
          const result = await fn(ctx)
          if (result) return result
        }
      }
    }
  }
}

/** Simple URL pattern matcher supporting :param and :param* segments. */
export function matchPattern(pattern: string, path: string): boolean {
  const patternParts = pattern.split('/').filter(Boolean)
  const pathParts = path.split('/').filter(Boolean)

  for (let i = 0; i < patternParts.length; i++) {
    const pp = patternParts[i]
    if (pp.endsWith('*')) return true // catch-all matches everything after
    if (pp.startsWith(':')) continue // dynamic segment matches anything
    if (pp !== pathParts[i]) return false
  }

  return patternParts.length === pathParts.length
}

/**
 * Create the SSR request handler for production.
 *
 * @example
 * import { routes } from "virtual:zero/routes"
 * import { routeMiddleware } from "virtual:zero/route-middleware"
 * import { createServer } from "@pyreon/zero"
 *
 * export default createServer({ routes, routeMiddleware })
 */
export function createServer(options: CreateServerOptions) {
  const config = options.config ?? {}

  const allMiddleware: Middleware[] = []

  // Per-route middleware runs first
  if (options.routeMiddleware?.length) {
    allMiddleware.push(createRouteMiddlewareDispatcher(options.routeMiddleware))
  }

  // Then global middleware from config and options
  allMiddleware.push(...(config.middleware ?? []))
  allMiddleware.push(...(options.middleware ?? []))

  const { App } = createApp({
    routes: options.routes,
    routerMode: 'history',
  })

  return createHandler({
    App,
    routes: options.routes,
    middleware: allMiddleware,
    mode: config.ssr?.mode ?? 'string',
    template: options.template,
    clientEntry: options.clientEntry,
  })
}
