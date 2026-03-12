import { build as viteBuild } from "vite"
import { resolve, join } from "node:path"
import { existsSync } from "node:fs"
import { readFile } from "node:fs/promises"

export interface BuildOptions {
  mode?: string
}

export async function build(root: string | undefined, options: BuildOptions) {
  const projectRoot = resolve(root ?? ".")

  console.log("\n  ⚡ Zero building for production...\n")

  const start = performance.now()

  // Build client bundle
  console.log("  Building client...")
  await viteBuild({
    root: projectRoot,
    build: {
      outDir: "dist/client",
      ssrManifest: true,
    },
  })

  // Build server bundle
  console.log("  Building server...")
  await viteBuild({
    root: projectRoot,
    build: {
      outDir: "dist/server",
      ssr: "src/entry-server.ts",
      rollupOptions: {
        input: "src/entry-server.ts",
      },
    },
  })

  // SSG prerendering pass
  const configPath = join(projectRoot, "vite.config.ts")
  let zeroConfig: Record<string, unknown> | undefined

  // Try to load zero config to check for SSG mode
  try {
    const { loadConfigFromFile } = await import("vite")
    const loaded = await loadConfigFromFile({ command: "build", mode: "production" }, configPath)
    if (loaded) {
      // Extract zero config from plugin options
      const plugins = (loaded.config.plugins ?? []) as Array<{ name?: string; _zeroConfig?: Record<string, unknown> }>
      const zeroPlugin = plugins.find((p) => p && typeof p === "object" && "name" in p && p.name === "pyreon-zero")
      if (zeroPlugin && "_zeroConfig" in zeroPlugin) {
        zeroConfig = zeroPlugin._zeroConfig as Record<string, unknown>
      }
    }
  } catch (err) {
    console.warn("  ⚠ Config loading failed, skipping SSG:", err)
  }

  const renderMode = (zeroConfig?.mode as string) ?? options.mode ?? "ssr"

  if (renderMode === "ssg" || renderMode === "isr") {
    console.log("  Prerendering pages...")

    const serverEntry = join(projectRoot, "dist/server/entry-server.js")
    if (existsSync(serverEntry)) {
      try {
        const { prerender } = await import("@pyreon/server")
        const serverModule = await import(serverEntry)
        const handler = serverModule.default

        // Resolve paths to prerender
        let paths: string[] = ["/"]
        const ssgConfig = zeroConfig?.ssg as { paths?: string[] | (() => string[] | Promise<string[]>) } | undefined
        if (ssgConfig?.paths) {
          paths = typeof ssgConfig.paths === "function"
            ? await ssgConfig.paths()
            : ssgConfig.paths
        }

        const result = await prerender({
          handler,
          paths,
          outDir: join(projectRoot, "dist/client"),
        })

        console.log(`  ✓ Prerendered ${result.pages} pages`)
        if (result.errors.length > 0) {
          for (const err of result.errors) {
            console.error(`    ✗ ${err.path}: ${err.error}`)
          }
        }
      } catch (err) {
        console.error("  ✗ Prerendering failed:", err)
      }
    }
  }

  // Run adapter to produce deployable output
  const adapterName = (zeroConfig?.adapter as string) ?? "node"
  if (!(adapterName === "static" && renderMode === "ssg")) {
    try {
      const { resolveAdapter } = await import("@pyreon/zero")
      const adapter = resolveAdapter(zeroConfig ?? {})
      console.log(`  Running ${adapter.name} adapter...`)
      await adapter.build({
        serverEntry: join(projectRoot, "dist/server/entry-server.js"),
        clientOutDir: join(projectRoot, "dist/client"),
        outDir: join(projectRoot, "dist/output"),
        config: zeroConfig ?? {},
      })
      console.log(`  ✓ Adapter "${adapter.name}" complete`)
    } catch (err) {
      console.error(`  ✗ Adapter failed:`, err)
    }
  }

  const elapsed = Math.round(performance.now() - start)
  console.log(`\n  ✓ Built in ${elapsed}ms`)
  console.log("  Output: dist/\n")
}
