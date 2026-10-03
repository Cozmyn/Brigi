/* eslint-disable @typescript-eslint/no-require-imports -- Runs without development tools. */
require('dotenv').config({ path: process.env.DOTENV_CONFIG_PATH })
const fs = require('node:fs')
const path = require('node:path')
const assert = require('node:assert/strict')
async function check() {
  assert.equal(
    Number(process.versions.node.split('.')[0]),
    24,
    'Activate Node 24 before deployment.',
  )
  const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'release.json'), 'utf8'))
  assert.equal(manifest.format, 'brigi-cpanel-v1')
  if (process.env.BRIGI_EXPECT_COMMIT)
    assert.equal(
      manifest.commit,
      process.env.BRIGI_EXPECT_COMMIT,
      'Artifact and source commit differ.',
    )
  if (process.env.BRIGI_CHECK_DOMAIN === 'true') {
    assert.equal(
      (process.env.SITE_URL || '').replace(/\/$/, ''),
      manifest.siteURL.replace(/\/$/, ''),
      'Artifact domain differs from SITE_URL.',
    )
    assert.ok(path.isAbsolute(process.env.MEDIA_DIR || ''), 'MEDIA_DIR must be absolute.')
  }
  const sharp = require('sharp')
  await sharp({ create: { width: 2, height: 2, channels: 3, background: '#234' } })
    .webp()
    .toBuffer()
  require('next')
  require('knex')
  const db = await require('mysql2/promise').createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
  })
  try {
    await db.query('SELECT 1')
  } finally {
    await db.end()
  }
  console.log('Runtime dependencies, Sharp and MySQL connection verified.')
}
check().catch((error) => {
  console.error(
    `Runtime preflight failed: ${error.code || error.name}. ${error.name === 'AssertionError' ? error.message : 'Check the private runtime configuration.'}`,
  )
  process.exitCode = 1
})
