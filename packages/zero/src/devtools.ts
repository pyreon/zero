/**
 * Zero Devtools — registers all fundamentals devtools registries
 * so they're available to the @pyreon/devtools Chrome extension.
 *
 * Automatically enabled in dev mode, disabled in production.
 * Override via `zero({ devtools: true/false })` in config.
 *
 * @example
 * // In entry-client.ts — automatic when devtools is enabled:
 * import { initDevtools } from "@pyreon/zero/devtools"
 * initDevtools()
 *
 * @example
 * // Manual usage with specific registries:
 * import { initDevtools } from "@pyreon/zero/devtools"
 * initDevtools({ store: true, form: true, i18n: false })
 */

export interface DevtoolsConfig {
  /** Enable store devtools. Default: true */
  store?: boolean
  /** Enable form devtools. Default: true */
  form?: boolean
  /** Enable i18n devtools. Default: true */
  i18n?: boolean
}

interface DevtoolsRegistry {
  store: typeof import('@pyreon/store/devtools') | null
  form: typeof import('@pyreon/form/devtools') | null
  i18n: typeof import('@pyreon/i18n/devtools') | null
}

const registry: DevtoolsRegistry = {
  store: null,
  form: null,
  i18n: null,
}

let initialized = false

/**
 * Initialize devtools registries. Call once at app startup.
 * Each registry is lazily imported to enable tree-shaking
 * when devtools are disabled.
 */
export async function initDevtools(config: DevtoolsConfig = {}): Promise<void> {
  if (initialized) return
  initialized = true

  const { store = true, form = true, i18n = true } = config

  const imports: Promise<void>[] = []

  if (store) {
    imports.push(
      import('@pyreon/store/devtools').then((mod) => {
        registry.store = mod
      }),
    )
  }

  if (form) {
    imports.push(
      import('@pyreon/form/devtools').then((mod) => {
        registry.form = mod
      }),
    )
  }

  if (i18n) {
    imports.push(
      import('@pyreon/i18n/devtools').then((mod) => {
        registry.i18n = mod
      }),
    )
  }

  await Promise.all(imports)
}

/** Check whether devtools have been initialized. */
export function isDevtoolsEnabled(): boolean {
  return initialized
}

/** Access loaded devtools registries for advanced use. */
export function getDevtoolsRegistry(): Readonly<DevtoolsRegistry> {
  return registry
}

/**
 * Reset devtools state. Useful for testing.
 * @internal
 */
export function _resetDevtools(): void {
  initialized = false
  registry.store = null
  registry.form = null
  registry.i18n = null
}
