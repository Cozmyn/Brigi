import { lstatSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
let linked = false
try {
  linked = lstatSync('node_modules').isSymbolicLink()
} catch {}
const command = linked ? 'install' : 'ci'
console.log(
  `Installing with npm ${command}; ${linked ? 'preserving CloudLinux node_modules symlink' : 'using package-lock.json'}.`,
)
const result = spawnSync(
  process.platform === 'win32' ? 'npm.cmd' : 'npm',
  [command, '--include=dev', '--no-audit', '--no-fund'],
  { stdio: 'inherit' },
)
if (result.error) console.error(result.error.message)
process.exitCode = result.status ?? 1
