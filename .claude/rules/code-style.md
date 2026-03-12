## Code Style

- All source files use TypeScript with strict mode
- JSX via `@pyreon/vite-plugin` — never import `h` manually in `.tsx` files
- Use Biome for formatting and linting — run `bunx biome check .` before committing
- Prefer `signal`, `computed`, `effect` from `@pyreon/reactivity` — no React hooks
- Use `onMount` / `onCleanup` lifecycle hooks, not `useEffect`
- Prefer composition (composables like `useLink`) over inheritance
- Export types separately: `export type { Foo }` not mixed with value exports
- No default exports except Vite plugin (`export { zeroPlugin as default }`) and route components
- Keep files focused — one major export per file, group related types alongside
