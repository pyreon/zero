## Git & Release Rules

- Changesets for versioning: `bunx changeset` to create, `bunx changeset version` to bump
- Fixed versioning: `@pyreon/zero`, `zero-cli`, `create-zero` always share the same version
- Use `workspace:^` for inter-package peer deps (resolved at publish time)
- Use `workspace:*` for inter-package deps within the monorepo
- Never force push to main
- Commit messages: imperative mood, concise, explain "why" not "what"
- CI must pass (lint, typecheck, test, build) before merge to main
