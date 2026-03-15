import { resolve } from 'node:path'
import { createServer } from 'vite'

export interface DevOptions {
  port?: number
  host?: string | boolean
  open?: boolean
}

export async function dev(root: string | undefined, options: DevOptions) {
  const projectRoot = resolve(root ?? '.')

  const server = await createServer({
    root: projectRoot,
    server: {
      port: options.port ?? 3000,
      host: options.host === true ? '0.0.0.0' : options.host,
      open: options.open,
    },
  })

  await server.listen()
  server.printUrls()
}
