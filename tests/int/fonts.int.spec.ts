import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const directory = 'src/assets/fonts'
const expected = [
  ['BodoniModa-normal.ttf', 'c5d582f8003ae692761dd8e9ce69de23cb9fea53'],
  ['BodoniModa-italic.ttf', '174375b9265ac430071f6f1f20de8dbe088c61c1'],
  ['Manrope.ttf', '75274da58537d6123b14f2cd0c355ad4681fc2b3'],
  ['BodoniModa-OFL.txt', '973cec73f0874f3b7821a44ff43e4a4c88e44844'],
  ['Manrope-OFL.txt', 'e271172a9ed0cddc895aabb6509f1c7d880b492d'],
]

describe('vendored local fonts', () => {
  it.each(expected)('keeps the approved source bytes for %s', (filename, expectedBlob) => {
    const bytes = readFileSync(`${directory}/${filename}`)
    const actual = createHash('sha1')
      .update(Buffer.from(`blob ${bytes.length}\0`)).update(bytes).digest('hex')
    expect(actual).toBe(expectedBlob)
  })

  it('preserves the source manifest and both OFL licenses', () => {
    const manifest = JSON.parse(readFileSync(`${directory}/sources.json`, 'utf8'))
    expect(manifest.revision).toBe('c30b221beb0c1da59d563feb91ec8656a1fa972a')
    expect(manifest.romanianGlyphsVerified).toBe('ĂăÂâÎîȘșȚț')
    expect(manifest.files).toHaveLength(5)
    for (const filename of ['BodoniModa-OFL.txt', 'Manrope-OFL.txt'])
      expect(readFileSync(`${directory}/${filename}`, 'utf8')).toContain('SIL OPEN FONT LICENSE Version 1.1')
  })

  it.each(['src/app/(frontend)/layout.tsx', 'src/app/(english)/layout.tsx'])(
    'uses the shared local module in %s', (filename) => {
      const source = readFileSync(filename, 'utf8')
      expect(source).toContain("import { serif, sans } from '@/lib/fonts'")
      expect(source).not.toContain('next/font/google')
      expect(source).toContain('serif.variable')
      expect(source).toContain('sans.variable')
    },
  )

  it('retains font variables, supported weights and both serif styles', () => {
    const source = readFileSync('src/lib/fonts.ts', 'utf8')
    expect(source).toContain("from 'next/font/local'")
    expect(source).toContain("variable: '--font-serif'")
    expect(source).toContain("variable: '--font-sans'")
    expect(source).toContain("weight: '400 500', style: 'normal'")
    expect(source).toContain("weight: '400 500', style: 'italic'")
    expect(source).toContain("weight: '200 800'")
  })
})
