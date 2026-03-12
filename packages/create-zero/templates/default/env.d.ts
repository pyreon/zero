/// <reference types="vite/client" />

declare module "virtual:zero/routes" {
  import type { RouteRecord } from "@pyreon/router"
  export const routes: RouteRecord[]
}
