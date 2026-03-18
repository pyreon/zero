# Anti-patterns — Common Mistakes in Pyreon Zero Apps

## React patterns that don't apply here
- **Never** use `useState`, `useEffect`, `useCallback`, `useMemo` — these are React hooks
- **Never** import `h` manually in `.tsx` files — JSX transform handles it
- **Never** return cleanup functions from `onMount` — use `onUnmount` separately

## Signal mistakes
- **Never** create signals inside the render return function — they must be in the component body
- **Never** nest `effect()` inside `effect()` — effects are flat, use `computed()` for derived state
- **Never** set 3+ signals individually without `batch()` — causes unnecessary re-renders
- **Never** call `signal(value)` to set — use `signal.set(value)` or `signal.update(fn)`
- **Never** forget to call signal as function to read: use `count()` not `count`

## JSX reactive expressions
- **Never** use bare signal reads in JSX text — wrap in arrow: `{() => count()}` not `{count()}`
- **Never** return `undefined` from reactive JSX attributes — return empty string `''` instead
- **Never** use reactive functions for `aria-current` — compute it as a static value

## Effect cleanup
- `effect()` returns an `Effect` object with `.dispose()` — not a raw function
- Use `onUnmount(() => dispose.dispose())` for cleanup, not `onUnmount(dispose)`

## Store mistakes
- **Never** import `signal`/`computed`/`effect` from `@pyreon/reactivity` in app code — use `@pyreon/store` re-exports
- **Never** call `defineStore` inside a component — it's a module-level declaration
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

## Devtools mistakes
- **Never** call `initDevtools()` without checking `__ZERO_DEVTOOLS__` — it will bundle devtools registries in production
- **Never** import from `@pyreon/store/devtools` directly in app code — use `getDevtoolsRegistry()` from `@pyreon/zero/devtools`
- **Never** call `initDevtools()` more than once — it's idempotent but wasteful

## Hydration
- `hydrateRoot(container, vnode)` — container first, then vnode (not reversed)
- The `startClient()` function handles this automatically — prefer it over manual hydration
