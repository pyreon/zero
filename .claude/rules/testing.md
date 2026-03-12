## Testing Rules

- Tests live in `packages/zero/src/tests/` using vitest
- Pure logic tests only — no DOM, no browser environment needed
- Test file naming: `<module>.test.ts` matching the source file
- Export internal helpers as named exports when they need testing (e.g., `parseGoogleFamily`)
- Run tests with `bun run test` (workspace-wide) or `cd packages/zero && bun test` (single package)
- Always run tests after modifying framework code before considering work complete
