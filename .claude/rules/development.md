# Development Rules

## Signal Reactivity

- Every public reactive value MUST be a `Signal<T>` or `Computed<T>` — never a raw value that could go stale.
- Use `batch()` when setting multiple signals in a single operation to coalesce notifications.
- Use `signal.peek()` when reading without subscribing (e.g., inside event handlers, snapshot code).
- Never read signals inside constructors or module-level code — only inside effects, computeds, or component render functions.

## Package Boundaries

- Each package is independent. Never import from another `@pyreon/*` package's `src/` directly — use the package name.
- Peer dependencies (`@pyreon/core`, `@pyreon/reactivity`) are resolved at the consumer's level — never bundle them.
- `@pyreon/meta` is the barrel for fundamentals + UI system — `@pyreon/zero` is the framework. Never re-export fundamentals from zero directly.
- Shared utilities go in `packages/zero/src/utils/` — only extract when used by 2+ files.

## Context Pattern

All context-based APIs follow the same structure:

```typescript
const XContext = createContext<T | null>(null)

function XProvider(props) {
  pushContext(new Map([[XContext.id, props.instance]]))
  onUnmount(() => popContext())
  return props.children
}

function useX(): T {
  const instance = useContext(XContext)
  if (!instance) throw new Error("[zero] useX() must be used within <XProvider>")
  return instance
}
```

Or using `provide()` helper:

```typescript
function XProvider(props) {
  provide(XContext, props.instance)
  return props.children
}
```

## Component Customization Pattern

Components that need customization expose 3 levels:

1. `useX(props)` — composable returning handlers, state, ref callback
2. `createX(Component)` — HOC wrapping any component with behavior
3. `X` — default component built on `createX`

Example: `useLink()` → `createLink(Component)` → `Link`

## Error Messages

Prefix all thrown errors with `[zero]` and include actionable guidance:
```typescript
throw new Error("[zero] Missing #app container element. Add <div id=\"app\"> to your index.html.")
```

## Middleware Pattern

All middleware follows `(ctx: MiddlewareContext) => Response | void | Promise<Response | void>`:
- Return `Response` to short-circuit
- Return `void` / `undefined` to pass through
- Use `withHeaders()` from `utils/with-headers.ts` for header modification

## Vite Plugin Pattern

Vite plugins follow: `export function pluginName(config = {}): Plugin`

## Route Module Exports

Route files can export: `default`, `loader`, `guard`, `meta`, `error`, `loading`, `middleware`, `renderMode`

## Version Alignment

- All 4 packages (`zero`, `meta`, `zero-cli`, `create-zero`) share the same version (fixed versioning via changesets).
- `workspace:^` for inter-package peer deps (resolved at publish time).
- When bumping Pyreon deps, update: zero package.json, cli package.json, meta package.json, create-zero pyreonVersion(), template package.json, and CLAUDE.md.
- Always run `rm -f bun.lock && bun install` after version changes.

## Bun Quirks

- Bun doesn't resolve `extends` chains into `node_modules` for `jsxImportSource` — always duplicate it in root tsconfig.
- `customConditions: ["bun"]` needed for workspace deps to resolve in CI (lib/ not built).
- `bun run --filter='*' test` runs all workspace package tests — individual failures may cascade.
