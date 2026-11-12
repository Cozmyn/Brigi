import { describe, expect, it } from 'vitest'
import { safeAmount, calculateBudget, money } from '@/lib/planning-budget'
import { initialPlanner, normalizePlanner, plannedDate } from '@/lib/planner-model'
import { assemblePlannerPDF } from '@/lib/planner-pdf'
import { analyticsSchema } from '@/lib/analytics'

describe('planner validation and private export', () => {
  it('starts without a date and accepts useful Romanian diacritics', () => {
    const plan = initialPlanner()
    expect(plan.dateMode).toBe('unknown')
    plan.eventName = 'Nuntă — Cătălina și Ștefan'
    plan.moments[0].title = 'Întâmpinarea invitaților'
    expect(normalizePlanner(plan)?.eventName).toBe('Nuntă — Cătălina și Ștefan')
    expect(normalizePlanner(plan)?.moments[0].title).toContain('Î')
    expect(plannedDate(plan, 'ro')).toBe('De stabilit')
  })
  it('rejects malformed local snapshots and unsafe timeline values', () => {
    const plan = initialPlanner()
    expect(normalizePlanner({ ...plan, moments: new Array(41).fill({}) })).toBeNull()
    expect(normalizePlanner({ ...plan, dateMode: 'secret' })).toBeNull()
    expect(normalizePlanner({ ...plan, moments: [{ id: '1', time: '99:88' }] })).toBeNull()
  })
  it('builds a valid multi-page PDF wrapper with xref, page count and embedded JPEGs', () => {
    // An image marker verifies the envelope only; real JPEG pages are rendered in Playwright.
    const marker = btoa(String.fromCharCode(255, 216, 255, 217))
    const pages = [{ jpegBase64: marker, width: 1240, height: 1754 }]
    const bytes = assemblePlannerPDF([...pages, ...pages])
    const content = new TextDecoder('latin1').decode(bytes)
    expect(content.startsWith('%PDF-1.4')).toBe(true)
    expect(content).toContain('/Count 2')
    expect(content).toContain('/Filter /DCTDecode')
    const offset = Number(content.match(/startxref\n(\d+)/)?.[1])
    expect(content.slice(offset, offset + 4)).toBe('xref')
    expect(content.trimEnd().endsWith('%%EOF')).toBe(true)
    expect(() => assemblePlannerPDF([])).toThrow()
    expect(() => assemblePlannerPDF([{ ...pages[0], jpegBase64: btoa('not a jpeg') }])).toThrow()
  })
})
describe('honest costs and privacy-preserving tool events', () => {
  it('adds verified figures and user-entered costs with no fabricated price defaults', () => {
    expect(calculateBudget({ packageAmount: null, travel: '125,50', sound: '80', other: '' })).toEqual({
      total: 205.5, personalExtras: 205.5, invalid: false, includesVerifiedPackage: false,
    })
    expect(calculateBudget({ packageAmount: 700, travel: '125.50', sound: '', other: '' }).total).toBe(825.5)
    expect(calculateBudget({ packageAmount: null, travel: '', sound: '', other: '' }).total).toBe(0)
    expect(money(825.5, 'RON', 'ro')).toMatch(/825/)
  })
  it('refuses invalid, negative, excessively large or mixed-currency-like amounts', () => {
    for (const bad of ['-100', '1000001', '1.234,56', '10 EUR', 'abc', '1.234', '2e3'])
      expect(safeAmount(bad)).toBeNull()
    expect(calculateBudget({ packageAmount: null, travel: '100abc', sound: '', other: '' }).invalid).toBe(true)
    expect(calculateBudget({ packageAmount: Number.NaN, travel: '', sound: '', other: '' }).invalid).toBe(true)
  })
  it('permits only predefined consented tool events', () => {
    for (const event of ['planner_exported', 'format_compared', 'budget_calculated'])
      expect(analyticsSchema.safeParse({ consent: true, event, path: '/instrumente/planner' }).success).toBe(true)
    expect(analyticsSchema.safeParse({
      consent: false, event: 'planner_exported', path: '/instrumente/planner',
    }).success).toBe(false)
    expect(analyticsSchema.safeParse({
      consent: true, event: 'planner_exported', path: '/admin/instrumente',
    }).success).toBe(false)
  })
})
