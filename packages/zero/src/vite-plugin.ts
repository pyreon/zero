import type { Plugin } from "vite"
import { resolveConfig } from "./config"
import { generateRouteModule, scanRouteFiles } from "./fs-router"
import type { ZeroConfig } from "./types"

const VIRTUAL_ROUTES_ID = "virtual:zero/routes"
const RESOLVED_VIRTUAL_ROUTES_ID = `\0${VIRTUAL_ROUTES_ID}`

/**
 * Zero Vite plugin — adds file-based routing and zero-config conventions
 * on top of @pyreon/vite-plugin.
 *
 * @example
 * // vite.config.ts
 * import pyreon from "@pyreon/vite-plugin"
 * import zero from "@pyreon/zero"
 *
 * export default {
 *   plugins: [pyreon(), zero()],
 * }
 */
export function zeroPlugin(userConfig: ZeroConfig = {}): Plugin {
  const config = resolveConfig(userConfig)
  let routesDir: string
  let root: string

  const plugin: Plugin & { _zeroConfig: ZeroConfig } = {
    name: "pyreon-zero",
    enforce: "pre",
    _zeroConfig: userConfig,

    configResolved(resolvedConfig) {
      root = resolvedConfig.root
      routesDir = `${root}/src/routes`
    },

    resolveId(id) {
      if (id === VIRTUAL_ROUTES_ID) {
        return RESOLVED_VIRTUAL_ROUTES_ID
      }
    },

    async load(id) {
      if (id === RESOLVED_VIRTUAL_ROUTES_ID) {
        try {
          const files = await scanRouteFiles(routesDir)
          return generateRouteModule(files, routesDir)
        } catch {
          // Routes dir doesn't exist yet — return empty routes
          return `export const routes = []`
        }
      }
    },

    configureServer(server) {
      // Watch routes directory for changes
      server.watcher.add(`${routesDir}/**/*.{tsx,jsx,ts,js}`)

      // Invalidate virtual module when route files change
      server.watcher.on("all", (event, path) => {
        if (
          path.startsWith(routesDir) &&
          (event === "add" || event === "unlink")
        ) {
          const mod = server.moduleGraph.getModuleById(RESOLVED_VIRTUAL_ROUTES_ID)
          if (mod) {
            server.moduleGraph.invalidateModule(mod)
            server.ws.send({ type: "full-reload" })
          }
        }
      })
    },

    config() {
      return {
        resolve: {
          conditions: ["bun"],
        },
        server: {
          port: config.port,
        },
        define: {
          __ZERO_MODE__: JSON.stringify(config.mode),
          __ZERO_BASE__: JSON.stringify(config.base),
        },
      }
    },
  }

  return plugin
}
