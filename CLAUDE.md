# Pyreon Zero — Meta-Framework

## Overview

Zero is the meta-framework for Pyreon's signal-based UI. Built on Vite with file-based routing, SSR/SSG/ISR/SPA modes, adapters, and a CLI.

**Packages:** `@pyreon/zero` (core), `zero-cli` (CLI), `create-zero` (scaffolding)

## Monorepo

```text
packages/zero/        → @pyreon/zero
packages/cli/         → zero-cli (dev/build/preview)
packages/create-zero/ → create-zero + starter template
```

Depends on `../pyreon` and `../fundamentals` via `overrides` with `file:` paths.
Workspace resolution: `"bun": "./src/index.ts"` exports, `customConditions: ["bun"]`.

## Architecture

### Vite Plugin (`vite-plugin.ts`) — serves `virtual:zero/routes`, watches `src/routes/`, injects defines

### File-Based Routing (`fs-router.ts`)

`[param]` → dynamic, `[...param]` → catch-all, `_layout.tsx` → layout, `_error.tsx` → error boundary, `_loading.tsx` → loading, `(group)` → route group (stripped from URL), `index.tsx` → index

### Entry Points

- **Client** (`client.ts`): `startClient()` — auto-detects hydration vs SPA mount
- **Server** (`entry-server.ts`): `createServer()` — middleware, template, streaming SSR

### Adapters — `nodeAdapter()`, `bunAdapter()`, `staticAdapter()`, `resolveAdapter()`

### ISR (`isr.ts`) — `createISRHandler()` with stale-while-revalidate cache

### Components

- **`<Image>`** — lazy load, srcset, blur-up placeholder, priority mode, CLS prevention
- **`<Link>`** — client-side nav, prefetch (hover/viewport/none), active classes, `createLink()` HOC, `useLink()` composable
- **`<Script>`** — strategies: beforeHydration, afterHydration, onIdle, onInteraction, onViewport

### Link API (3 levels)

1. `useLink(props)` — composable returning handlers, active state, ref callback
2. `createLink(Component)` — HOC wrapping any component with link behavior (`LinkRenderProps`)
3. `Link` — default `<a>`-based link built on `createLink`

### Font Optimization (`font.ts`)

Google Fonts with build-time self-hosting (CDN fallback in dev), local fonts, size-adjusted fallbacks, configurable `font-display`.

### Image Processing (`image-plugin.ts`)

Build-time Vite plugin: `?optimize` imports, multiple sizes, WebP/AVIF via sharp (graceful fallback), base64 blur placeholders.

### Theme System (`theme.tsx`)

`theme` signal, `resolvedTheme()`, `toggleTheme()`, `setTheme()`, `initTheme()`, `ThemeToggle` component, `themeScript` (anti-flash inline script).

### Cache & Security (`cache.ts`)

`cacheMiddleware()` (immutable hashed assets, SWR, custom rules), `securityHeaders()`, `varyEncoding()`. Uses shared `withHeaders()` utility.

### SEO (`seo.ts`)

`generateSitemap()`, `generateRobots()`, `jsonLd()`, `seoPlugin()`, `seoMiddleware()`

### Shared Utilities (`utils/`)

- `use-intersection-observer.ts` — reusable observer composable (used by Image, Link)
- `with-headers.ts` — clone Response with modified headers (used by cache middleware)

## Package Exports

`.` (core), `./client`, `./config`, `./image`, `./link`, `./script`, `./font`, `./cache`, `./seo`, `./theme`, `./image-plugin`

## Starter Template (`packages/create-zero/templates/default/`)

Full-featured project: streaming SSR, dark/light theme, font optimization, SEO, cache middleware, guarded routes, error/loading boundaries. Routes: index, counter, about, posts/[id], (admin)/dashboard.

## CI/CD

- **ci.yml** — lint (Biome), typecheck, test (vitest), build + uncommitted changes check. Reusable via `workflow_call`.
- **security.yml** — CodeQL analysis, dependency review (blocks high CVEs + GPL), audit, OpenSSF Scorecard
- **pr-review.yml** — Claude Code auto-review on PRs + `@claude` mentions
- **release.yml** — gates on CI, then changesets version/publish

Changesets: fixed versioning (all packages bump together). `workspace:^` for peer deps.

## Config

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

## Testing

```bash
cd packages/zero && bun test   # vitest — pure logic tests in src/tests/
```

## Common Patterns

- Route exports: `default`, `loader`, `guard`, `meta`, `error`, `loading`, `middleware`, `renderMode`
- `useLoaderData<T>()`, `useRoute()`, `useHead()` from `@pyreon/router` / `@pyreon/head`
- `cacheMiddleware()` + `securityHeaders()` + `varyEncoding()` in server middleware

## Scripts

```bash
bun run build      # Build all packages
bun run dev        # Dev mode
bun run test       # Test all
bun run typecheck  # Type check all
```

## JSX

All `.tsx` files use JSX via `@pyreon/vite-plugin` + `@pyreon/compiler`. No explicit `h` import needed.
