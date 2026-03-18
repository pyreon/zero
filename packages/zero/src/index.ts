// ─── Core ─────────────────────────────────────────────────────────────────────

export type { CreateAppOptions } from './app'
export { createApp } from './app'
export type { CreateServerOptions } from './entry-server'
export { createServer } from './entry-server'

// ─── Vite plugin ─────────────────────────────────────────────────────────────

export { zeroPlugin as default } from './vite-plugin'

// ─── File-system routing ─────────────────────────────────────────────────────

export {
  filePathToUrlPath,
  generateRouteModule,
  parseFileRoutes,
  scanRouteFiles,
} from './fs-router'

// ─── Config ──────────────────────────────────────────────────────────────────

export { defineConfig, resolveConfig } from './config'

// ─── ISR ─────────────────────────────────────────────────────────────────────

export { createISRHandler } from './isr'

// ─── Adapters ────────────────────────────────────────────────────────────────

export {
  bunAdapter,
  nodeAdapter,
  resolveAdapter,
  staticAdapter,
} from './adapters'

// ─── Components ─────────────────────────────────────────────────────────────

export type { ImageProps, ImageSource } from './image'
export { Image } from './image'
export type { LinkProps, LinkRenderProps, UseLinkReturn } from './link'
export { createLink, Link, useLink } from './link'
export type { ScriptProps, ScriptStrategy } from './script'
export { Script } from './script'

// ─── Middleware ──────────────────────────────────────────────────────────────

export type { CacheConfig, CacheRule } from './cache'
export { cacheMiddleware, securityHeaders, varyEncoding } from './cache'

// ─── Font optimization ─────────────────────────────────────────────────────

export type {
  FallbackMetrics,
  FontConfig,
  FontDisplay,
  GoogleFontInput,
  GoogleFontStatic,
  GoogleFontVariable,
  LocalFont,
} from './font'
export { fontPlugin, fontVariables } from './font'

// ─── Image processing ──────────────────────────────────────────────────────

export type {
  FormatSource,
  ImageFormat,
  ImagePluginConfig,
  ProcessedImage,
} from './image-plugin'
export { imagePlugin } from './image-plugin'

// ─── Theme ──────────────────────────────────────────────────────────────────

export type { Theme } from './theme'
export {
  initTheme,
  resolvedTheme,
  setTheme,
  ThemeToggle,
  theme,
  themeScript,
  toggleTheme,
} from './theme'

// ─── SEO ────────────────────────────────────────────────────────────────────

export type {
  ChangeFreq,
  JsonLdType,
  RobotsConfig,
  RobotsRule,
  SeoPluginConfig,
  SitemapConfig,
  SitemapEntry,
} from './seo'
export {
  generateRobots,
  generateSitemap,
  jsonLd,
  seoMiddleware,
  seoPlugin,
} from './seo'

// ─── Store ───────────────────────────────────────────────────────────────────

export type { StoreApi, StorePlugin } from '@pyreon/store'
export {
  addStorePlugin,
  batch,
  computed,
  defineStore,
  effect,
  resetAllStores,
  resetStore,
  signal,
} from '@pyreon/store'

// ─── Form ────────────────────────────────────────────────────────────────────

export type {
  FieldRegisterProps,
  FieldState,
  FormState,
  UseFieldArrayResult,
  UseFieldResult,
  UseFormOptions,
} from '@pyreon/form'
export {
  FormProvider,
  useField,
  useFieldArray,
  useForm,
  useFormContext,
  useFormState,
  useWatch,
} from '@pyreon/form'

// ─── Validation ──────────────────────────────────────────────────────────────

export type { SchemaAdapter, ValidationIssue } from '@pyreon/validation'
export { zodField, zodSchema } from '@pyreon/validation'

// ─── Query ───────────────────────────────────────────────────────────────────

export type {
  UseMutationResult,
  UseQueryResult,
} from '@pyreon/query'
export {
  QueryClient,
  QueryClientProvider,
  useInfiniteQuery,
  useIsFetching,
  useIsMutating,
  useMutation,
  useQuery,
  useQueryClient,
} from '@pyreon/query'

// ─── Table ───────────────────────────────────────────────────────────────────

export type { UseTableOptions } from '@pyreon/table'
export { flexRender, useTable } from '@pyreon/table'

// ─── Virtual ─────────────────────────────────────────────────────────────────

export type {
  UseVirtualizerOptions,
  UseVirtualizerResult,
} from '@pyreon/virtual'
export { useVirtualizer, useWindowVirtualizer } from '@pyreon/virtual'

// ─── i18n ────────────────────────────────────────────────────────────────────

export type { I18nInstance, I18nOptions } from '@pyreon/i18n'
export { createI18n, I18nProvider, Trans, useI18n } from '@pyreon/i18n'

// ─── Feature ─────────────────────────────────────────────────────────────────

export type { Feature, FeatureConfig } from '@pyreon/feature'
export { defineFeature, reference } from '@pyreon/feature'

// ─── Types ───────────────────────────────────────────────────────────────────

export type {
  Adapter,
  AdapterBuildOptions,
  FileRoute,
  ISRConfig,
  LoaderContext,
  RenderMode,
  RouteMeta,
  RouteModule,
  ZeroConfig,
} from './types'
