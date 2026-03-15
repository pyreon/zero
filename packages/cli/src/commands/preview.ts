import { resolve } from 'node:path'
import { preview as vitePreview } from 'vite'

export interface PreviewOptions {
  port?: number
  host?: string | boolean
}

export async function preview(
  root: string | undefined,
  options: PreviewOptions,
) {
  const projectRoot = resolve(root ?? '.')

  const server = await vitePreview({
    root: projectRoot,
    preview: {
      port: options.port ?? 3000,
      host: options.host === true ? '0.0.0.0' : options.host,
    },
  })

  server.printUrls()
}
