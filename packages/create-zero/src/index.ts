import { resolve, join, basename } from "node:path"
import { existsSync } from "node:fs"
import { cp, readFile, writeFile, mkdir } from "node:fs/promises"

// ─── Config ──────────────────────────────────────────────────────────────────

const TEMPLATE_DIR = resolve(import.meta.dirname, "../templates/default")

// ─── CLI ─────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2)
  const projectName = args[0]

  if (!projectName || projectName === "--help" || projectName === "-h") {
    console.log(`
  Usage: create-zero <project-name>

  Scaffold a new Pyreon Zero project.

  Example:
    bun create zero my-app
    npx create-zero my-app
`)
    process.exit(projectName ? 0 : 1)
  }

  const targetDir = resolve(process.cwd(), projectName)

  if (existsSync(targetDir)) {
    console.error(`\n  Error: Directory "${projectName}" already exists.\n`)
    process.exit(1)
  }

  console.log(`\n  ⚡ Creating Pyreon Zero project: ${projectName}\n`)

  // Copy template
  await cp(TEMPLATE_DIR, targetDir, { recursive: true })

  // Update package.json with project name
  const pkgPath = join(targetDir, "package.json")
  const pkg = JSON.parse(await readFile(pkgPath, "utf-8"))
  pkg.name = basename(projectName)
  await writeFile(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`)

  // Create .gitignore (can't be in template — npm ignores .gitignore in packages)
  await writeFile(
    join(targetDir, ".gitignore"),
    `node_modules
dist
.DS_Store
*.local
`,
  )

  console.log("  Done! To get started:\n")
  console.log(`    cd ${projectName}`)
  console.log("    bun install")
  console.log("    bun run dev\n")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
