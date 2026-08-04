import { describe, expect, it } from 'vitest'
import { routeMap } from '@/lib/site'

describe('localized routes', () => {
  it('keeps Romanian at the root and English under /en', () => {
    expect(routeMap.ro.home).toBe('/')
    expect(routeMap.en.home).toBe('/en')
    expect(routeMap.ro.booking).toBe('/rezervare')
    expect(routeMap.en.booking).toBe('/en/booking')
  })
  it('does not expose contact or EPK routes', () => {
    expect(JSON.stringify(routeMap)).not.toContain('/contact')
    expect(JSON.stringify(routeMap)).not.toContain('/epk')
  })
})

