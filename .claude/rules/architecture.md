## Architecture Rules

- Each `@pyreon/zero` subpath export (`./link`, `./cache`, etc.) must have a matching entry in `packages/zero/package.json` exports map with `bun`, `import`, and `types` conditions
- Shared utilities go in `packages/zero/src/utils/` — only extract when used by 2+ files
- Vite plugins follow the pattern: `export function pluginName(config = {}): Plugin`
- Middleware uses the `(request, next) => Promise<Response>` signature from `@pyreon/server`
- Use `withHeaders()` from `utils/with-headers.ts` for Response header modification in middleware
- Use `useIntersectionObserver()` from `utils/use-intersection-observer.ts` instead of raw IntersectionObserver
- Components that need customization should expose 3 levels: composable (`useX`), HOC (`createX`), default component
- The starter template in `packages/create-zero/templates/default/` is user-facing — prioritize readability over DRY
- Route modules can export: `default`, `loader`, `guard`, `meta`, `error`, `loading`, `middleware`, `renderMode`
- `@pyreon/meta` is the barrel for fundamentals, `@pyreon/zero` is the framework — never re-export fundamentals from zero directly
