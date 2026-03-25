# Anti-patterns — Common Mistakes in Pyreon Zero

## React patterns that don't apply here
- **Never** use `useState`, `useEffect`, `useCallback`, `useMemo` — these are React hooks
- **Never** import `h` manually in `.tsx` files — JSX transform handles it
- **Never** return cleanup functions from `onMount` — use `onUnmount` separately
- **Never** use `className` or `htmlFor` — use `class` and `for`

## Signal mistakes
- **Never** create signals inside the render return function — they must be in the component body
- **Never** nest `effect()` inside `effect()` — effects are flat, use `computed()` for derived state
- **Never** set 3+ signals individually without `batch()` — causes unnecessary re-renders
- **Never** call `signal(value)` to set — use `signal.set(value)` or `signal.update(fn)`
- **Never** forget to call signal as function to read: use `count()` not `count`
- **Stale closures**: Don't capture `signal.peek()` in a closure that outlives the current tick. Use `signal()` (subscribing read) inside effects/computeds
- **Signal in hot path**: Don't create signals inside render functions or loops — create them once in setup

## JSX attribute casing
- **Always** use camelCase for events: `onClick`, `onMouseEnter`, `onTouchStart`, `onLoad`
- **Never** use lowercase DOM event names: `onclick`, `onmouseenter`, `ontouchstart`, `onload`
- **Always** use `srcSet` not `srcset`, `fetchPriority` not `fetchpriority`

## JSX reactive expressions
- **Never** use bare signal reads in JSX text — wrap in arrow: `{() => count()}` not `{count()}`
- **Never** return `undefined` from reactive JSX attributes — return empty string `''` or use conditional spread `{...(value ? { attr: value } : {})}`
- Use conditional spreads for optional attributes with `exactOptionalPropertyTypes`

## Effect cleanup
- `effect()` returns an `Effect` object with `.dispose()` — not a raw function
- Use `onUnmount(() => dispose.dispose())` for cleanup, not `onUnmount(dispose)`
- Prefer `onCleanup()` inside effects for inline cleanup

## Context pattern
- **Never** use `<Context.Provider value={...}>` JSX — Pyreon contexts don't have a `.Provider` component
- Use `provide(context, value)` from `@pyreon/core` — it calls `pushContext` + `onUnmount(popContext)` automatically
- For manual control: `pushContext(new Map([[ctx.id, value]]))` + `onUnmount(() => popContext())`
- Always throw if context is missing: `if (!instance) throw new Error("[zero] useX() must be used within <XProvider>")`

## Store mistakes
- **Never** import `signal`/`computed`/`effect` from `@pyreon/reactivity` in app code — use `@pyreon/store` re-exports
- **Never** call `defineStore` inside a component — it's a module-level declaration
- `useStore()` returns `{ store, patch, subscribe }` — destructure `store` to access state
- Store setup function runs once (singleton) — don't rely on it re-running

## Form mistakes
- **Never** create form instances inside render — `useForm()` goes in the component body
- **Never** forget `type: 'checkbox'` when registering checkbox inputs

## Query mistakes
- **Never** forget `QueryClientProvider` in root layout — queries silently fail without it
- **Never** call `useQuery` outside a component — it needs the reactive context

## Middleware signature
- Middleware uses `(ctx: MiddlewareContext) => Response | void | Promise<Response | void>`
- Return `void` / `undefined` to pass through (don't short-circuit)
- Use `withHeaders()` from `utils/with-headers.ts` to modify Response headers

## Architecture mistakes
- **Never** bundle `@pyreon/core` or `@pyreon/reactivity` — they must be peer dependencies
- **Never** import from another package's `src/` directly — use the package name
- Duck-type external library interfaces instead of importing their types — avoids hard version coupling
- Error messages prefixed with `[zero]` and include actionable guidance

## Testing mistakes
- Test the public API as consumers use it, not internal implementation details
- Always run tests from the package directory
- Test error cases (throws, invalid inputs, edge cases) not just happy paths

## File organization
- If a source file exceeds ~300 lines, consider splitting
- Tests go in `src/tests/`, not `__tests__/` or root
- Every new public function/type must be exported from `src/index.ts`

## Hydration
- `hydrateRoot(container, vnode)` — container first, then vnode (not reversed)
- The `startClient()` function handles this automatically — prefer it over manual hydration
