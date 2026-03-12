Prepare a release.

1. Run `/validate` to ensure everything passes
2. Check `git status` for uncommitted changes — commit or stash them
3. Run `bunx changeset` and help me create the changeset:
   - Which packages changed
   - Semver bump (major/minor/patch)
   - Description of changes
4. Run `bunx changeset version` to bump versions and generate CHANGELOG
5. Show me the version bumps and changelog entries for review
6. Do NOT publish — that happens via CI when merged to main
