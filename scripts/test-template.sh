#!/usr/bin/env bash
set -euo pipefail

# Test that the starter template scaffolds and passes validation.
# Uses local workspace packages via overrides since @pyreon/zero
# isn't published with resolved deps yet.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
TEMPLATE_DIR="$ROOT_DIR/packages/create-zero/templates/default"
TEMP_DIR=$(mktemp -d)
TEST_APP="$TEMP_DIR/test-zero-app"

cleanup() {
  rm -rf "$TEMP_DIR"
}
trap cleanup EXIT

echo "==> Scaffolding template to $TEST_APP"
cp -r "$TEMPLATE_DIR" "$TEST_APP"

# Simulate create-zero: update package name + add .gitignore
cd "$TEST_APP"
cat package.json | sed 's/"my-zero-app"/"test-zero-app"/' > package.json.tmp
mv package.json.tmp package.json
echo -e "node_modules\ndist" > .gitignore

echo "==> Installing dependencies"
bun install --no-save 2>&1 || {
  echo ""
  echo "WARNING: bun install failed (expected if @pyreon/zero is not yet published with resolved deps)"
  echo "Falling back to validating template files directly..."
  echo ""

  echo "==> Checking template files exist"
  for f in \
    "src/entry-client.ts" \
    "src/entry-server.ts" \
    "src/routes/index.tsx" \
    "src/routes/_layout.tsx" \
    "src/routes/_error.tsx" \
    "src/routes/_loading.tsx" \
    "src/routes/counter.tsx" \
    "src/routes/about.tsx" \
    "src/routes/posts/index.tsx" \
    "src/routes/posts/new.tsx" \
    "src/routes/(admin)/dashboard.tsx" \
    "src/features/posts.ts" \
    "src/stores/app.ts" \
    "vite.config.ts" \
    "tsconfig.json" \
    "env.d.ts" \
    "CLAUDE.md" \
    ".mcp.json" \
    "index.html" \
    "package.json"; do
    if [ ! -f "$f" ]; then
      echo "FAIL: Missing template file: $f"
      exit 1
    fi
  done
  echo "All template files present."

  echo ""
  echo "==> Checking package.json has required scripts"
  for script in dev build preview doctor "doctor:fix" "doctor:ci"; do
    if ! grep -q "\"$script\"" package.json; then
      echo "FAIL: Missing script: $script"
      exit 1
    fi
  done
  echo "All required scripts present."

  echo ""
  echo "==> Checking package.json has AI toolchain deps"
  for dep in "@pyreon/cli" "@pyreon/mcp"; do
    if ! grep -q "\"$dep\"" package.json; then
      echo "FAIL: Missing devDependency: $dep"
      exit 1
    fi
  done
  echo "AI toolchain deps present."

  echo ""
  echo "==> Checking .mcp.json is valid"
  if ! python3 -c "import json; json.load(open('.mcp.json'))" 2>/dev/null; then
    echo "FAIL: .mcp.json is not valid JSON"
    exit 1
  fi
  echo ".mcp.json is valid."

  echo ""
  echo "==> Checking CLAUDE.md has anti-React rules"
  if ! grep -q "Do NOT use React" CLAUDE.md; then
    echo "FAIL: CLAUDE.md missing anti-React guidance"
    exit 1
  fi
  echo "CLAUDE.md has anti-React rules."

  echo ""
  echo "==> Checking no React patterns in template source"
  if grep -rn "useState\|useEffect\|useMemo\|useCallback\|className=" src/ 2>/dev/null; then
    echo "FAIL: React patterns found in template source"
    exit 1
  fi
  echo "No React patterns in template."

  echo ""
  echo "All template validation checks passed!"
  exit 0
}

# If install succeeded, run full validation
echo "==> Running pyreon doctor"
bunx @pyreon/cli doctor

echo "==> Checking TypeScript"
bunx tsc --noEmit

echo ""
echo "All template checks passed!"
