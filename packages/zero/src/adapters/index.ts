export { nodeAdapter } from "./node"
export { bunAdapter } from "./bun"
export { staticAdapter } from "./static"

import type { Adapter, ZeroConfig } from "../types"
import { nodeAdapter } from "./node"
import { bunAdapter } from "./bun"
import { staticAdapter } from "./static"

/**
 * Resolve the adapter from config.
 * Returns a built-in adapter or throws if unknown.
 */
export function resolveAdapter(config: ZeroConfig): Adapter {
  const name = config.adapter ?? "node"

  switch (name) {
    case "node":
      return nodeAdapter()
    case "bun":
      return bunAdapter()
    case "static":
      return staticAdapter()
    default:
      throw new Error(`[zero] Unknown adapter: "${name}". Use "node", "bun", or "static".`)
  }
}
