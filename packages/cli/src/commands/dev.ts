import { createServer } from "vite"
import { resolve } from "node:path"

export interface DevOptions {
  port?: number
  host?: string | boolean
  open?: boolean
}

export async function dev(root: string | undefined, options: DevOptions) {
  const projectRoot = resolve(root ?? ".")

  console.log("\n  ⚡ Zero dev server starting...\n")

  const server = await createServer({
    root: projectRoot,
    server: {
      port: options.port ?? 3000,
      host: options.host === true ? "0.0.0.0" : options.host,
      open: options.open,
    },
  })

  await server.listen()
  server.printUrls()

  console.log("\n  Ready in", `${Math.round(performance.now())}ms`)
}
