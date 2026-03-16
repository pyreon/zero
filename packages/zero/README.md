# @pyreon/zero

Core meta-framework for building full-stack apps with [Pyreon](https://github.com/user/pyreon) and [Vite](https://vite.dev).

## Install

```bash
bun add @pyreon/zero
```

## Features

- **File-based routing** — `[param]`, `[...catchAll]`, `_layout`, `_error`, `_loading`, `(groups)`
- **Rendering modes** — SSR, SSG, ISR, SPA (per-route configurable)
- **Components** — `<Image>` (lazy load, srcset, blur-up), `<Link>` (prefetch, active state), `<Script>` (loading strategies)
- **Theme** — Dark/light/system with `theme` signal, `<ThemeToggle>`, and anti-flash inline script
- **Fonts** — Google Fonts self-hosting at build time, local fonts, size-adjusted fallbacks
- **Image optimization** — Build-time processing via `?optimize` imports (WebP/AVIF, blur placeholders)
- **SEO** — Sitemap, robots.txt, JSON-LD helpers (Vite plugin + dev middleware)
- **Cache & security** — `cacheMiddleware()`, `securityHeaders()`, `varyEncoding()`
- **Adapters** — Node.js, Bun, static

## Usage

```ts
// vite.config.ts
import pyreon from "@pyreon/vite-plugin"
import zero from "@pyreon/zero"

export default {
  plugins: [pyreon(), zero({ mode: "ssr" })],
}
```

## Subpath Exports

| Export | Description |
| --- | --- |
| `@pyreon/zero` | Vite plugin, config, adapters |
| `@pyreon/zero/client` | Client-side entry (`startClient`) |
| `@pyreon/zero/image` | `<Image>` component |
| `@pyreon/zero/link` | `<Link>`, `useLink`, `createLink` |
| `@pyreon/zero/script` | `<Script>` component |
| `@pyreon/zero/theme` | Theme system and `<ThemeToggle>` |
| `@pyreon/zero/font` | Font optimization plugin |
| `@pyreon/zero/cache` | Cache and security middleware |
| `@pyreon/zero/seo` | SEO plugin, sitemap, robots.txt |
| `@pyreon/zero/image-plugin` | Image optimization Vite plugin |
| `@pyreon/zero/config` | Config types |

## License

[MIT](LICENSE)
