import type { RouteRecord } from '@pyreon/router'
import type { Middleware } from '@pyreon/server'
import { createHandler } from '@pyreon/server'
import { createApp } from './app'
import type { ZeroConfig } from './types'

// ─── Server entry factory ───────────────────────────────────────────────────

export interface CreateServerOptions {
  /** Route definitions. */
  routes: RouteRecord[]
  /** Zero config. */
  config?: ZeroConfig
  /** Additional middleware. */
  middleware?: Middleware[]
  /** HTML template override. */
  template?: string
  /** Client entry path. */
  clientEntry?: string
}

/**
 * Create the SSR request handler for production.
 *
 * @example
 * import { routes } from "virtual:zero/routes"
 * import { createServer } from "@pyreon/zero"
 *
 * export default createServer({ routes })
 */
export function createServer(options: CreateServerOptions) {
  const config = options.config ?? {}
  const allMiddleware = [
    ...(config.middleware ?? []),
    ...(options.middleware ?? []),
  ]

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
