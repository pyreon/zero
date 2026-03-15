import { existsSync } from 'node:fs'
import { cp, readFile, writeFile } from 'node:fs/promises'
import { basename, join, resolve } from 'node:path'

// ─── Config ──────────────────────────────────────────────────────────────────

const TEMPLATE_DIR = resolve(import.meta.dirname, '../templates/default')

// ─── CLI ─────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2)
  const projectName = args[0]

  if (!projectName || projectName === '--help' || projectName === '-h') {
    process.exit(projectName ? 0 : 1)
  }

  const targetDir = resolve(process.cwd(), projectName)

  if (existsSync(targetDir)) {
    process.exit(1)
  }

  // Copy template
  await cp(TEMPLATE_DIR, targetDir, { recursive: true })

  // Update package.json with project name
  const pkgPath = join(targetDir, 'package.json')
  const pkg = JSON.parse(await readFile(pkgPath, 'utf-8'))
  pkg.name = basename(projectName)
  await writeFile(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`)

  // Create .gitignore (can't be in template — npm ignores .gitignore in packages)
  await writeFile(
    join(targetDir, '.gitignore'),
    `node_modules
dist
.DS_Store
*.local
`,
  )
}

main().catch((_err) => {
  process.exit(1)
})
