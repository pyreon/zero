// ─── Core ─────────────────────────────────────────────────────────────────────

export { createApp } from "./app"
export type { CreateAppOptions } from "./app"

export { createServer } from "./entry-server"
export type { CreateServerOptions } from "./entry-server"

// ─── Vite plugin ─────────────────────────────────────────────────────────────

export { zeroPlugin as default } from "./vite-plugin"

// ─── File-system routing ─────────────────────────────────────────────────────

export {
  parseFileRoutes,
  filePathToUrlPath,
  scanRouteFiles,
  generateRouteModule,
} from "./fs-router"

// ─── Config ──────────────────────────────────────────────────────────────────

export { defineConfig, resolveConfig } from "./config"

// ─── ISR ─────────────────────────────────────────────────────────────────────

export { createISRHandler } from "./isr"

// ─── Adapters ────────────────────────────────────────────────────────────────

export { nodeAdapter, bunAdapter, staticAdapter, resolveAdapter } from "./adapters"

// ─── Components ─────────────────────────────────────────────────────────────

export { Image } from "./image"
export type { ImageProps, ImageSource } from "./image"

export { Link, createLink, useLink } from "./link"
export type { LinkProps, LinkRenderProps, UseLinkReturn } from "./link"

export { Script } from "./script"
export type { ScriptProps, ScriptStrategy } from "./script"

// ─── Middleware ──────────────────────────────────────────────────────────────

export { cacheMiddleware, securityHeaders, varyEncoding } from "./cache"
export type { CacheConfig, CacheRule } from "./cache"

// ─── Font optimization ─────────────────────────────────────────────────────

export { fontPlugin, fontVariables } from "./font"
export type { FontConfig, LocalFont, FontDisplay, FallbackMetrics } from "./font"

// ─── Image processing ──────────────────────────────────────────────────────

export { imagePlugin } from "./image-plugin"
export type { ImagePluginConfig, ImageFormat } from "./image-plugin"

// ─── Theme ──────────────────────────────────────────────────────────────────

export { ThemeToggle, theme, resolvedTheme, toggleTheme, setTheme, initTheme, themeScript } from "./theme"
export type { Theme } from "./theme"

// ─── SEO ────────────────────────────────────────────────────────────────────

export {
  generateSitemap,
  generateRobots,
  jsonLd,
  seoPlugin,
  seoMiddleware,
} from "./seo"
export type {
  SitemapConfig,
  SitemapEntry,
  RobotsConfig,
  RobotsRule,
  SeoPluginConfig,
} from "./seo"

// ─── Types ───────────────────────────────────────────────────────────────────

export type {
  ZeroConfig,
  RenderMode,
  ISRConfig,
  RouteModule,
  LoaderContext,
  RouteMeta,
  FileRoute,
  Adapter,
  AdapterBuildOptions,
} from "./types"
