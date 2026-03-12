Run the full validation pipeline to ensure everything is healthy.

Run these in parallel where possible:
1. `bunx biome check .` — lint and format
2. `bun run typecheck` — TypeScript
3. `bun run test` — vitest
4. `bun run build` — production build

Report results as a checklist:
- [ ] Lint: pass/fail
- [ ] Types: pass/fail
- [ ] Tests: pass/fail (X/Y passed)
- [ ] Build: pass/fail

If anything fails, diagnose and fix it.
