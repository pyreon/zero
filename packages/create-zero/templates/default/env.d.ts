/// <reference types="vite/client" />

declare module 'virtual:zero/routes' {
  import type { RouteRecord } from '@pyreon/router'
  export const routes: RouteRecord[]
}

declare const __ZERO_MODE__: string
declare const __ZERO_BASE__: string
declare const __ZERO_DEVTOOLS__: boolean
