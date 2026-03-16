# Pyreon Zero

Zero-config full-stack framework powered by [Pyreon](https://github.com/user/pyreon) and [Vite](https://vite.dev).

## Packages

| Package | Description |
| --- | --- |
| [`@pyreon/zero`](packages/zero/) | Core framework — routing, SSR, components, plugins |
| [`zero-cli`](packages/cli/) | CLI for dev, build, and preview |
| [`create-zero`](packages/create-zero/) | Project scaffolding tool |

## Quick Start

```bash
bun create zero my-app
cd my-app
bun run dev
```

## Features

- File-based routing with layouts, error boundaries, and loading states
- SSR, SSG, ISR, and SPA rendering modes
- Streaming server-side rendering
- Optimized `<Image>`, `<Link>`, and `<Script>` components
- Google Fonts with build-time self-hosting
- Dark/light theme system with no flash
- SEO utilities — sitemap, robots.txt, JSON-LD
- Cache and security middleware
- Node.js, Bun, and static adapters

## Development

```bash
bun install
bun run dev        # Dev mode
bun run build      # Build all packages
bun run test       # Run tests
bun run typecheck  # Type check all packages
```

## License

[MIT](LICENSE)
