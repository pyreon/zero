import { existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { build as viteBuild } from 'vite'

export interface BuildOptions {
  mode?: string
}

export async function build(root: string | undefined, options: BuildOptions) {
  const projectRoot = resolve(root ?? '.')

  const start = performance.now()
  await viteBuild({
    root: projectRoot,
    build: {
      outDir: 'dist/client',
      ssrManifest: true,
    },
  })
  await viteBuild({
    root: projectRoot,
    build: {
      outDir: 'dist/server',
      ssr: 'src/entry-server.ts',
      rollupOptions: {
        input: 'src/entry-server.ts',
      },
    },
  })

  // SSG prerendering pass
  const configPath = join(projectRoot, 'vite.config.ts')
  let zeroConfig: Record<string, unknown> | undefined

  // Try to load zero config to check for SSG mode
  try {
    const { loadConfigFromFile } = await import('vite')
    const loaded = await loadConfigFromFile(
      { command: 'build', mode: 'production' },
      configPath,
    )
    if (loaded) {
      // Extract zero config from plugin options
      const plugins = (loaded.config.plugins ?? []) as Array<{
        name?: string
        _zeroConfig?: Record<string, unknown>
      }>
      const zeroPlugin = plugins.find(
        (p) =>
          p && typeof p === 'object' && 'name' in p && p.name === 'pyreon-zero',
      )
      if (zeroPlugin && '_zeroConfig' in zeroPlugin) {
        zeroConfig = zeroPlugin._zeroConfig as Record<string, unknown>
      }
    }
  } catch {
    // Config loading is optional — fall back to defaults
  }

  const renderMode = (zeroConfig?.mode as string) ?? options.mode ?? 'ssr'

  if (renderMode === 'ssg' || renderMode === 'isr') {
    const serverEntry = join(projectRoot, 'dist/server/entry-server.js')
    if (existsSync(serverEntry)) {
      try {
        const { prerender } = await import('@pyreon/server')
        const serverModule = await import(serverEntry)
        const handler = serverModule.default

        // Resolve paths to prerender
        let paths: string[] = ['/']
        const ssgConfig = zeroConfig?.ssg as
          | { paths?: string[] | (() => string[] | Promise<string[]>) }
          | undefined
        if (ssgConfig?.paths) {
          paths =
            typeof ssgConfig.paths === 'function'
              ? await ssgConfig.paths()
              : ssgConfig.paths
        }

        const result = await prerender({
          handler,
          paths,
          outDir: join(projectRoot, 'dist/client'),
        })
        if (result.errors.length > 0) {
          for (const err of result.errors) {
            console.warn('Prerender error:', err)
          }
        }
      } catch {
        // Prerender is best-effort — build continues without it
      }
    }
  }

  // Run adapter to produce deployable output
  const adapterName = (zeroConfig?.adapter as string) ?? 'node'
  if (!(adapterName === 'static' && renderMode === 'ssg')) {
    try {
      const { resolveAdapter } = await import('@pyreon/zero')
      const adapter = resolveAdapter(zeroConfig ?? {})
      await adapter.build({
        serverEntry: join(projectRoot, 'dist/server/entry-server.js'),
        clientOutDir: join(projectRoot, 'dist/client'),
        outDir: join(projectRoot, 'dist/output'),
        config: zeroConfig ?? {},
      })
    } catch {
      // Adapter build is optional — output may not need it
    }
  }

  const elapsed = Math.round(performance.now() - start)
  console.log(`Build completed in ${elapsed}ms`)
}
