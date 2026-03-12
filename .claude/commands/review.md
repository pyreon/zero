Review the current changes for issues before committing.

1. Run `git diff` to see all changes
2. Check for:
   - Security issues (XSS, injection, secrets exposure)
   - Missing type exports in index.ts or package.json exports map
   - Unused imports or dead code
   - Breaking changes to the public API
   - Missing tests for new logic
3. Run `bunx biome check .` for lint/format issues
4. Run `bun run typecheck` for type errors
5. Run `bun run test` for test failures
6. Report findings concisely — only flag real issues
