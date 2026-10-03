import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('CloudLinux deployment compatibility', () => {
  it('avoids process substitution and descriptor filesystem dependencies', () => {
    const script = readFileSync('scripts/deploy-cpanel.sh', 'utf8')
    // Check both input and output process substitution, even without intervening spaces.
    expect(script).not.toMatch(/[<>]\s*\(/)
    expect(script).not.toMatch(/\/dev\/fd|\/proc\/(?:self|\$\$|\d+)\/fd/)
  })
})
