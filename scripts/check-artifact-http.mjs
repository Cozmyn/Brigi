import assert from 'node:assert/strict'
const base = process.argv[2]
const response = await fetch(base)
assert.equal(response.status, 200)
const html = await response.text()
const assets = [
  ...new Set(
    [...html.matchAll(/(?:src|href)="([^" ]*\/_next\/static\/[^" ]+)"/g)].map((m) => m[1]),
  ),
]
assert.ok(assets.length > 0, 'No browser assets in rendered HTML.')
for (const asset of assets) assert.equal((await fetch(new URL(asset, base))).status, 200, asset)
assert.equal((await fetch(`${base}/admin/login`)).status, 200)
assert.equal((await fetch(`${base}/absent-artifact-qa-page`)).status, 404)
assert.equal((await fetch(`${base}/favicon.svg`)).status, 200)
console.log(`Clean artifact serves homepage, admin, 404 and ${assets.length} browser assets.`)
