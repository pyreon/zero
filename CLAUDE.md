# Pyreon Zero — Meta-Framework

## Overview
Zero is the meta-framework layer for the Pyreon ecosystem. Think Next.js but for Pyreon's signal-based UI.
Built on Vite. Provides file-based routing, SSR, SSG, ISR, SPA modes, adapters, and a CLI.

**Three packages:**
- `@pyreon/zero` — core framework (Vite plugin, file-based routing, app assembly, ISR, adapters, components, middleware, SEO)
- `zero-cli` — CLI commands (`zero dev`, `zero build`, `zero preview`)
- `create-zero` — project scaffolding (`bun create zero my-app`)

## Monorepo Structure
```
packages/
  zero/           → @pyreon/zero (core framework)
  cli/            → zero-cli (dev/build/preview commands)
  create-zero/    → create-zero (project scaffolding + starter template)
docs/             → Documentation (getting-started, routing, configuration, api)
```

## Ecosystem Dependency Graph
Zero depends on packages from two sibling repos:
- `../pyreon` — core framework (`@pyreon/core`, `@pyreon/reactivity`, `@pyreon/runtime-dom`, `@pyreon/runtime-server`, `@pyreon/router`, `@pyreon/head`, `@pyreon/server`, `@pyreon/vite-plugin`)
- `../fundamentals` — ecosystem libraries (`@pyreon/store`, etc.)

These are linked via `overrides` in root `package.json` using `file:` paths.

## Workspace Resolution
Same pattern as pyreon core: each package exports `"bun": "./src/index.ts"` so no build step needed during development. Root tsconfig has `customConditions: ["bun"]`.

## Key Architecture

### Vite Plugin (`packages/zero/src/vite-plugin.ts`)
- Serves `virtual:zero/routes` — auto-generated route tree from filesystem
- Watches `src/routes/` for file add/remove → triggers full reload via HMR
- Injects `__ZERO_MODE__` and `__ZERO_BASE__` defines
- Sets `resolve.conditions: ["bun"]`
- Exposes `_zeroConfig` property so build command can read config

### File-Based Routing (`packages/zero/src/fs-router.ts`)
Core conventions:
- `[param]` → `:param` (dynamic), `[...param]` → `:param*` (catch-all)
- `_layout.tsx` → layout wrapper (parent route with children)
- `_error.tsx` → error boundary, `_loading.tsx` → loading fallback
- `(group)` → route group (stripped from URL)
- `index.tsx` → index route

`generateRouteModule()` builds a nested route tree:
- Each route file is `import * as _mN` for accessing `loader`, `guard`, `meta`, `error` exports
- Components are lazy-loaded via `@pyreon/router`'s `lazy()`
- `_error.tsx` → `errorComponent`, `_loading.tsx` → `lazy()` loading option
- `_layout.tsx` → parent route wrapping children
- `clean()` helper strips undefined props at runtime

### App Assembly (`packages/zero/src/app.ts`)
`createApp()` composes: `HeadProvider` → `RouterProvider` → Layout → `RouterView`
Used by both `startClient()` and `createServer()`.

### Entry Points
- **Client** (`packages/zero/src/client.ts`): `startClient()` — auto-detects hydration (SSR content present) vs fresh mount (SPA)
- **Server** (`packages/zero/src/entry-server.ts`): `createServer()` — wraps `@pyreon/server`'s `createHandler()` with middleware, template, and streaming support

### ISR (`packages/zero/src/isr.ts`)
`createISRHandler()` wraps an SSR handler with in-memory stale-while-revalidate cache.
Response headers: `x-isr-cache: HIT|MISS|STALE`, `x-isr-age: <seconds>`.

### Adapters (`packages/zero/src/adapters/`)
- `nodeAdapter()` — generates standalone `node:http` server with static file serving
- `bunAdapter()` — generates `Bun.serve()` entry with native `Bun.file()` serving
- `staticAdapter()` — copies client build output (for SSG/static hosting)
- `resolveAdapter(config)` — resolves adapter from `ZeroConfig.adapter` string

### Components (`packages/zero/src/`)
- **`<Image>`** (`image.tsx`) — optimized image component with:
  - Lazy loading via IntersectionObserver (200px rootMargin)
  - Responsive `srcset` generation from width descriptors
  - Blur-up placeholder with CSS transition
  - Priority mode for LCP images (disables lazy, adds `fetchpriority="high"`)
  - Automatic aspect-ratio to prevent CLS
  - Import: `import { Image } from "@pyreon/zero/image"`

- **`<Link>`** (`link.tsx`) — navigation link with prefetching:
  - Client-side navigation via `router.push()`
  - Prefetch strategies: `"hover"` (default), `"viewport"`, `"none"`
  - `activeClass` / `exactActiveClass` for current route styling
  - Deduplicates prefetch requests via internal Set
  - Import: `import { Link } from "@pyreon/zero/link"`

- **`<Script>`** (`script.tsx`) — optimized third-party script loading:
  - Strategies: `"beforeHydration"`, `"afterHydration"` (default), `"onIdle"`, `"onInteraction"`, `"onViewport"`
  - Deduplication via `id` prop
  - Import: `import { Script } from "@pyreon/zero/script"`

### Font Optimization (`packages/zero/src/font.ts`)
Vite plugin for automatic font optimization:
- Google Fonts: parses family strings, generates optimized CSS URL, injects preconnect hints
- **Build-time self-hosting**: downloads Google Fonts CSS + woff2 files, rewrites URLs to local `/assets/fonts/` paths
- Falls back to CDN in dev mode for fast startup
- Local fonts: generates `@font-face` declarations, preload tags
- Size-adjusted fallback fonts via `FallbackMetrics` to eliminate CLS during font loading
- Configurable `font-display` strategy (default: `"swap"`)
- Import: `import { fontPlugin } from "@pyreon/zero/font"`

### Image Processing Pipeline (`packages/zero/src/image-plugin.ts`)

Build-time image optimization Vite plugin:

- Handles `?optimize` query on image imports
- Generates multiple sizes (default: 640, 1024, 1920)
- Converts to WebP/AVIF via sharp (graceful fallback if sharp unavailable)
- Creates base64 blur placeholders (16px thumbnail)
- Binary header parsing for JPEG/PNG/WebP dimensions (no deps needed)
- Import: `import { imagePlugin } from "@pyreon/zero/image-plugin"`

### Theme System (`packages/zero/src/theme.tsx`)

Dark/light/system theme support:

- `theme` signal, `resolvedTheme()`, `toggleTheme()`, `setTheme()`
- `initTheme()` — reads localStorage, watches `prefers-color-scheme` changes
- `ThemeToggle` JSX component with sun/moon SVG icons
- `themeScript` — inline script string to prevent flash of wrong theme (include in HTML `<head>`)
- Uses `document.documentElement.dataset.theme` for CSS targeting
- Import: `import { ThemeToggle, initTheme, themeScript } from "@pyreon/zero/theme"`

### Cache & Security Middleware (`packages/zero/src/cache.ts`)
- `cacheMiddleware()` — smart Cache-Control headers:
  - Hashed assets → `immutable` (1 year)
  - Static assets (images/fonts) → long cache + SWR
  - HTML pages → no-cache or configurable duration
  - Custom rules via URL pattern matching
- `securityHeaders()` — X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy
- `varyEncoding()` — sets Vary: Accept-Encoding for cache-aware compression
- Import: `import { cacheMiddleware, securityHeaders } from "@pyreon/zero/cache"`

### SEO Utilities (`packages/zero/src/seo.ts`)
- `generateSitemap()` — creates sitemap.xml from file-based routes
- `generateRobots()` — creates robots.txt with configurable rules
- `jsonLd()` — generates JSON-LD structured data script tags
- `seoPlugin()` — Vite plugin that emits sitemap.xml + robots.txt at build time
- `seoMiddleware()` — serves sitemap/robots dynamically during dev
- Import: `import { seoPlugin, jsonLd } from "@pyreon/zero/seo"`

### Build Pipeline (CLI `packages/cli/src/commands/build.ts`)
1. `vite.build()` client bundle with SSR manifest → `dist/client/`
2. `vite.build()` server SSR bundle → `dist/server/`
3. SSG prerendering pass (if mode is `ssg` or `isr`) via `@pyreon/server`'s `prerender()`
4. Adapter build → `dist/output/`

### Starter Template (`packages/create-zero/templates/default/`)
A full-featured Zero project showcasing all framework features:
- `vite.config.ts` — `pyreon()` + `zero()` + `fontPlugin()` + `seoPlugin()`
- `src/entry-client.ts` — imports global CSS, `startClient({ routes })`
- `src/entry-server.ts` — streaming SSR with `securityHeaders()` + `cacheMiddleware()` + `varyEncoding()`
- `src/global.css` — dark/light theme design system with CSS variables, smooth theme transitions
- `src/routes/_layout.tsx` — root layout with `<Link>` nav, `<ThemeToggle>`, and footer
- `src/routes/_error.tsx` — error boundary page
- `src/routes/_loading.tsx` — loading spinner fallback
- `src/routes/index.tsx` — hero landing page with feature cards
- `src/routes/counter.tsx` — signal reactivity demo (signal, computed)
- `src/routes/about.tsx` — about page with stack overview
- `src/routes/posts/index.tsx` — posts list with server-side `loader`
- `src/routes/posts/[id].tsx` — dynamic post detail with `loader` + `useLoaderData`
- `src/routes/(admin)/dashboard.tsx` — guarded route with `guard` function + per-route `middleware`
- `public/favicon.svg` — branded SVG favicon
- `env.d.ts` — virtual module type declaration
- `index.html` — SSR placeholders, theme-color meta, favicon, anti-flash theme script

## JSX
All route files use JSX (not `h()` calls). The `@pyreon/vite-plugin` handles transform via `@pyreon/compiler`. No explicit `h` import needed in `.tsx` files.

## Config
Zero config is passed as an argument to the Vite plugin:
```ts
import pyreon from "@pyreon/vite-plugin"
import zero from "@pyreon/zero"
import { fontPlugin } from "@pyreon/zero/font"
import { seoPlugin } from "@pyreon/zero/seo"

export default {
  plugins: [
    pyreon(),
    zero({ mode: "ssr" }),
    fontPlugin({ google: ["Inter:wght@400;500;700"] }),
    seoPlugin({ sitemap: { origin: "https://example.com" } }),
  ],
}
```

`defineConfig()` from `@pyreon/zero/config` provides type-safe config for standalone config files.

## Package Exports
`@pyreon/zero` exports these subpaths:
- `.` — core (createApp, createServer, vite plugin, adapters, ISR)
- `./client` — client entry (startClient)
- `./config` — configuration (defineConfig, resolveConfig)
- `./image` — `<Image>` component
- `./link` — `<Link>` component
- `./script` — `<Script>` component
- `./font` — font optimization plugin
- `./cache` — cache/security middleware
- `./seo` — SEO utilities and plugin
- `./theme` — theme system (ThemeToggle, signals, initTheme)
- `./image-plugin` — build-time image processing plugin

## Testing
```bash
cd packages/zero && bun test    # vitest — fs-router, ISR, config tests
```

Tests are in `packages/zero/src/tests/`. Use vitest with no special environment needed (pure logic tests).

## Common Patterns
- Route module exports: `default` (component), `loader`, `guard`, `meta`, `error`, `loading`, `middleware`, `renderMode`
- `useLoaderData<T>()` from `@pyreon/router` to access loader data in components
- `useRoute()` from `@pyreon/router` for current route params/query
- `useHead()` from `@pyreon/head` for document head management
- `<Link href="/path" prefetch="hover">` for client-side navigation with prefetching
- `<Image src="/img.jpg" width={800} height={600} placeholder="/img-blur.jpg">` for optimized images
- `cacheMiddleware()` + `securityHeaders()` in server middleware stack

## Scripts
```bash
bun run build       # Build all packages
bun run dev         # Dev mode all packages
bun run test        # Test all packages
bun run typecheck   # Type check all packages
```
