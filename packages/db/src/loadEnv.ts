import { config } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const packageRoot = resolve(fileURLToPath(new URL('.', import.meta.url)), '..')
const repoRoot = resolve(packageRoot, '../..')

for (const file of ['.env', '.env.local']) {
  const path = resolve(repoRoot, file)
  if (existsSync(path)) {
    config({ path })
  }
}
