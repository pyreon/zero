/// <reference types="vite/client" />

declare module 'virtual:zero/routes' {
  import type { RouteRecord } from '@pyreon/router'
  export const routes: RouteRecord[]
}

declare module 'virtual:zero/route-middleware' {
  import type { RouteMiddlewareEntry } from '@pyreon/zero'
  export const routeMiddleware: RouteMiddlewareEntry[]
}
