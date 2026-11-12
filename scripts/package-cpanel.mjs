import { cp, mkdir, readFile, rm, writeFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'

// tsx pins esbuild as its own (nested) dependency in the committed npm lockfile.
// Resolve from tsx's installed package rather than assuming npm hoists esbuild.
const { build: compile } = createRequire(import.meta.resolve('tsx'))('esbuild')

const root = process.cwd()
const sha =
  process.env.GITHUB_SHA || execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
if (!/^[a-f0-9]{40}$/.test(sha)) throw new Error('A full source commit SHA is required.')
const out = path.join(root, 'artifacts')
const stage = path.join(out, 'package')
await rm(stage, { recursive: true, force: true })
await mkdir(stage, { recursive: true })
// Compile the idempotent CMS bootstrap for production-only Node dependencies.
// Source TypeScript and dev tools must never be installed on the cPanel host.
await compile({
  entryPoints: [path.join(root, 'scripts/seed-content.ts')],
  outfile: path.join(stage, 'seed-content.cjs'),
  platform: 'node', format: 'cjs', target: 'node24', bundle: true,
  packages: 'external', tsconfig: path.join(root, 'tsconfig.json'), logLevel: 'silent',
})
// Explicit allowlist. Never copy a workspace, .env, media, SQL exports or node_modules.
for (const file of [
  'app.cjs',
  'server.cjs',
  'next.config.mjs',
  'package.json',
  'package-lock.json',
  '.npmrc',
  'knexfile.mjs',
])
  await cp(path.join(root, file), path.join(stage, file))
await cp(path.join(root, 'migrations/mysql'), path.join(stage, 'migrations/mysql'), {
  recursive: true,
})
await cp(path.join(root, 'scripts/runtime-check.cjs'), path.join(stage, 'runtime-check.cjs'))
await cp(path.join(root, '.next'), path.join(stage, '.next'), {
  recursive: true,
  filter: (p) =>
    !['cache', 'dev', 'standalone'].includes(
      path.relative(path.join(root, '.next'), p).split(path.sep)[0],
    ),
})
// Only tracked public assets; private uploads cannot accidentally enter a release.
const publicFiles = execFileSync('git', ['ls-files', '-z', 'public'], { encoding: 'utf8' })
  .split('\0')
  .filter(Boolean)
for (const file of publicFiles) {
  if (file.startsWith('public/media/') || /(^|\/)\.env/.test(file))
    throw new Error('Private public asset selected.')
  await mkdir(path.dirname(path.join(stage, file)), { recursive: true })
  await cp(path.join(root, file), path.join(stage, file))
}
await mkdir(path.join(stage, 'public'), { recursive: true })
for (const file of [
  '.next/BUILD_ID',
  '.next/required-server-files.json',
  '.next/server/app-paths-manifest.json',
])
  await readFile(path.join(stage, file))
if (!(await readdir(path.join(stage, '.next/static'))).length)
  throw new Error('Missing browser assets.')
const manifest = {
  format: 'brigi-cpanel-v1',
  commit: sha,
  nodeMajor: 24,
  siteURL: process.env.SITE_URL || 'https://brigi.ro',
  builtAt: new Date().toISOString(),
  nodeModules: 'install-on-target',
}
await writeFile(path.join(stage, 'release.json'), JSON.stringify(manifest, null, 2) + '\n')
const archive = path.join(out, 'brigi-cpanel-build.tar.gz')
execFileSync('tar', ['-czf', archive, '-C', stage, '.'])
const hash = createHash('sha256')
  .update(await readFile(archive))
  .digest('hex')
await writeFile(archive + '.sha256', `${hash}  brigi-cpanel-build.tar.gz\n`)
console.log(
  `Prepared ${path.basename(archive)} for ${sha}; no dependencies or private configuration included.`,
)
