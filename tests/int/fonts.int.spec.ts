import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const expected = [
  ['BodoniModa-normal.ttf', 'c5d582f8003ae692761dd8e9ce69de23cb9fea53'],
  ['BodoniModa-italic.ttf', '174375b9265ac430071f6f1f20de8dbe088c61c1'],
  ['Manrope.ttf', '75274da58537d6123b14f2cd0c355ad4681fc2b3'],
  ['BodoniModa-OFL.txt', '973cec73f0874f3b7821a44ff43e4a4c88e44844'],
  ['Manrope-OFL.txt', 'e271172a9ed0cddc895aabb6509f1c7d880b492d'],
]

describe('vendored font integrity and integration', () => {
  it.each(expected)('preserves the upstream bytes of %s', (filename, expectedBlob) => {
    const bytes = readFileSync(`src/assets/fonts/${filename}`)
    const actual = createHash('sha1')
      .update(Buffer.from(`blob ${bytes.length}\0`)).update(bytes).digest('hex')
    expect(actual).toBe(expectedBlob)
    if (filename.endsWith('-OFL.txt'))
      expect(bytes.toString('utf8')).toContain('SIL OPEN FONT LICENSE Version 1.1')
  })

  it('records the immutable source and verified Romanian characters', () => {
    const manifest = JSON.parse(readFileSync('src/assets/fonts/sources.json', 'utf8')) as {
      revision: string
      romanianGlyphsVerified: string
      files: { filename: string; gitBlob: string; sha256: string }[]
    }
    expect(manifest.revision).toBe('c30b221beb0c1da59d563feb91ec8656a1fa972a')
    expect(manifest.romanianGlyphsVerified).toBe('ĂăÂâÎîȘșȚț')
    expect(manifest.files).toHaveLength(expected.length)
    for (const [filename, gitBlob] of expected) {
      const record = manifest.files.find((entry) => entry.filename === filename)
      expect(record?.gitBlob).toBe(gitBlob)
      expect(record?.sha256).toBe(createHash('sha256')
        .update(readFileSync(`src/assets/fonts/${filename}`)).digest('hex'))
    }
  })

  it('shares a local-only font module across both public layouts', () => {
    const module = readFileSync('src/lib/fonts.ts', 'utf8')
    expect(module).toContain("from 'next/font/local'")
    expect(module).not.toContain('next/font/google')
    expect(module).toContain("variable: '--font-serif'")
    expect(module).toContain("variable: '--font-sans'")
    expect(module).toContain("weight: '400 500', style: 'normal'")
    expect(module).toContain("weight: '400 500', style: 'italic'")
    expect(module).toContain("weight: '200 800', style: 'normal'")
    for (const path of ['src/app/(frontend)/layout.tsx', 'src/app/(english)/layout.tsx']) {
      const layout = readFileSync(path, 'utf8')
      expect(layout).toContain("import { serif, sans } from '@/lib/fonts'")
      expect(layout).not.toContain('next/font/google')
      expect(layout).toContain('${serif.variable} ${sans.variable}')
    }
  })
})
