# Pyreon Zero

Full-stack meta-framework powered by [Pyreon](https://github.com/pyreon/pyreon)'s signal-based reactivity and [Vite](https://vite.dev).

## Quick Start

```bash
bun create @pyreon/zero my-app
cd my-app
bun install
bun run dev
```

The interactive CLI lets you pick your rendering mode, features, and AI toolchain.

## Packages

| Package | Description |
| --- | --- |
| [`@pyreon/zero`](packages/zero/) | Framework — routing, SSR, components, middleware, plugins |
| [`@pyreon/meta`](packages/meta/) | Ecosystem barrel — re-exports fundamentals + UI system |
| [`@pyreon/zero-cli`](packages/cli/) | CLI — dev, build, preview, doctor, context, create |
| [`@pyreon/create-zero`](packages/create-zero/) | Interactive project scaffolding |

## Features

**Routing & Rendering**
- File-based routing with layouts, error boundaries, loading states, route groups
- SSR (streaming + string), SSG, ISR, SPA rendering modes (per-route configurable)
- API routes — `.ts` files in `src/routes/api/` with HTTP method handlers
- Per-route middleware and navigation guards

**Components**
- `<Image>` — lazy load, srcset, blur-up, priority, CLS prevention
- `<Link>` — prefetch (hover/viewport), active state, 3-level API
- `<Script>` — loading strategies (beforeHydration, afterHydration, onIdle, onInteraction, onViewport)

**Server**
- Server actions — `defineAction()` for mutations with client/server boundary
- CORS, rate limiting, compression, cache, security middleware
- Node.js, Bun, and static deploy adapters

**Ecosystem (via @pyreon/meta)**
- State: `@pyreon/store` — signal-based stores
- Data: `@pyreon/query` — TanStack Query adapter
- Forms: `@pyreon/form` + `@pyreon/validation` — Zod/Valibot/ArkType
- CRUD: `@pyreon/feature` — schema-driven features
- Tables: `@pyreon/table`, Virtual lists: `@pyreon/virtual`
- i18n: `@pyreon/i18n` — translations, plurals, rich text
- Styling: `@pyreon/styler` — CSS-in-JS
- UI: `@pyreon/elements`, `@pyreon/coolgrid`, `@pyreon/hooks`
- Animations: `@pyreon/kinetic` + 120 presets

**DX**
- Theme system with anti-flash, Google Fonts self-hosting, SEO utilities
- Dev error overlay with source-mapped stack traces
- Route table printed on `zero dev` startup
- AI toolchain — MCP server, CLAUDE.md, `zero doctor`
- Testing utilities — `createTestContext`, `testMiddleware`, `createTestApiServer`

## Development

```bash
bun install
bun run dev           # Dev mode
bun run build         # Build all packages
bun run test          # Run tests (309 tests)
bun run typecheck     # Type check all packages
bun run test:template # Validate starter template
```

## License

[MIT](LICENSE)
