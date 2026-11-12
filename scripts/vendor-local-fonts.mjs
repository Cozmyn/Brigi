import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'

const revision = 'c30b221beb0c1da59d563feb91ec8656a1fa972a'
const directory = 'src/assets/fonts'
const assets = [
  ['ofl/bodonimoda/BodoniModa[opsz,wght].ttf', 'BodoniModa-normal.ttf', 'c5d582f8003ae692761dd8e9ce69de23cb9fea53'],
  ['ofl/bodonimoda/BodoniModa-Italic[opsz,wght].ttf', 'BodoniModa-italic.ttf', '174375b9265ac430071f6f1f20de8dbe088c61c1'],
  ['ofl/manrope/Manrope[wght].ttf', 'Manrope.ttf', '75274da58537d6123b14f2cd0c355ad4681fc2b3'],
  ['ofl/bodonimoda/OFL.txt', 'BodoniModa-OFL.txt', '973cec73f0874f3b7821a44ff43e4a4c88e44844'],
  ['ofl/manrope/OFL.txt', 'Manrope-OFL.txt', 'e271172a9ed0cddc895aabb6509f1c7d880b492d'],
]

function hasGlyph(font, codepoint) {
  let cmap
  const tableCount = font.readUInt16BE(4)
  for (let index = 0; index < tableCount; index++) {
    const record = 12 + index * 16
    if (font.toString('ascii', record, record + 4) === 'cmap')
      cmap = font.readUInt32BE(record + 8)
  }
  if (cmap === undefined) throw new Error('Font has no cmap table.')
  const count = font.readUInt16BE(cmap + 2)
  for (let index = 0; index < count; index++) {
    const record = cmap + 4 + index * 8
    const platform = font.readUInt16BE(record)
    const encoding = font.readUInt16BE(record + 2)
    if (platform !== 0 && !(platform === 3 && [1, 10].includes(encoding))) continue
    const subtable = cmap + font.readUInt32BE(record + 4)
    const format = font.readUInt16BE(subtable)
    if (format === 12) {
      const groups = font.readUInt32BE(subtable + 12)
      for (let group = 0; group < groups; group++) {
        const offset = subtable + 16 + group * 12
        const start = font.readUInt32BE(offset)
        const end = font.readUInt32BE(offset + 4)
        if (codepoint >= start && codepoint <= end &&
            font.readUInt32BE(offset + 8) + codepoint - start !== 0) return true
      }
    }
    if (format === 4 && codepoint <= 0xffff) {
      const segments = font.readUInt16BE(subtable + 6) / 2
      for (let segment = 0; segment < segments; segment++) {
        const end = font.readUInt16BE(subtable + 14 + segment * 2)
        const start = font.readUInt16BE(subtable + 16 + segments * 2 + segment * 2)
        if (codepoint < start || codepoint > end) continue
        const delta = font.readInt16BE(subtable + 16 + segments * 4 + segment * 2)
        const rangePosition = subtable + 16 + segments * 6 + segment * 2
        const range = font.readUInt16BE(rangePosition)
        const glyph = range === 0
          ? (codepoint + delta) & 0xffff
          : font.readUInt16BE(rangePosition + range + (codepoint - start) * 2)
        if (glyph !== 0 && (range === 0 || ((glyph + delta) & 0xffff) !== 0)) return true
      }
    }
  }
  return false
}

const checked = []
for (const [source, filename, expectedBlob] of assets) {
  const url = `https://raw.githubusercontent.com/google/fonts/${revision}/${source.split('/').map(encodeURIComponent).join('/')}`
  const response = await fetch(url, { signal: AbortSignal.timeout(60000) })
  if (!response.ok) throw new Error(`Download failed for ${filename}: ${response.status}`)
  const bytes = Buffer.from(await response.arrayBuffer())
  const actualBlob = createHash('sha1')
    .update(Buffer.from(`blob ${bytes.length}\0`)).update(bytes).digest('hex')
  if (actualBlob !== expectedBlob) throw new Error(`Source hash mismatch: ${filename}`)
  if (filename.endsWith('.ttf')) {
    for (const character of 'ĂăÂâÎîȘșȚț')
      if (!hasGlyph(bytes, character.codePointAt(0)))
        throw new Error(`Missing Romanian glyph ${character} in ${filename}`)
  } else if (!bytes.toString('utf8').includes('SIL OPEN FONT LICENSE Version 1.1')) {
    throw new Error(`Unexpected license: ${filename}`)
  }
  checked.push({ source, filename, gitBlob: expectedBlob, sha256: createHash('sha256').update(bytes).digest('hex'), bytes })
}

// Write only after every source, license and glyph check has succeeded.
await mkdir(directory, { recursive: true })
for (const asset of checked) await writeFile(`${directory}/${asset.filename}`, asset.bytes)
const manifest = {
  repository: 'google/fonts',
  revision,
  romanianGlyphsVerified: 'ĂăÂâÎîȘșȚț',
  files: checked.map(({ source, filename, gitBlob, sha256 }) => ({ source, filename, gitBlob, sha256 })),
}
await writeFile(`${directory}/sources.json`, JSON.stringify(manifest, null, 2) + '\n')
console.log(`Verified ${checked.length} assets and Romanian glyph coverage in all three font files.`)
