Plan and implement a new feature for @pyreon/zero.

Before writing any code:
1. Ask me what the feature should do if not clear from context
2. Identify which files need changes
3. Check if a new subpath export is needed in package.json
4. Present a brief plan for approval

When implementing:
1. Write the feature in `packages/zero/src/`
2. Export from `index.ts` (values and types separately)
3. Add subpath export to `package.json` if it's a new module
4. Add tests in `packages/zero/src/tests/`
5. Update the starter template if it showcases the feature
6. Run lint, typecheck, and tests
7. Update CLAUDE.md if the feature changes architecture (keep under 200 lines)
