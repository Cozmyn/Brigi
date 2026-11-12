/** Amounts supplied by the visitor are not a commercial quote from Brigitta. */
export type VerifiedOffer = {
  id: string
  label: string
  sets: number
  duration: number
  price: number
  currency: 'RON' | 'EUR'
  fromPricing: boolean
  description: string
  href: string
}
export type ComparisonItem = {
  id: string
  kind: 'format' | 'package'
  label: string
  summary: string
  lineup: string
  suitableFor: string
  technicalRequirements: string
  duration: string
  price: number | null
  currency: 'RON' | 'EUR' | null
  fromPricing: boolean
  href: string
}
export const safeAmount = (value: string): number | null => {
  if (!/^(?:0|[1-9]\d{0,6})(?:[.,]\d{1,2})?$/.test(value.trim())) return null
  const number = Number(value.replace(',', '.'))
  return Number.isFinite(number) && number <= 1_000_000 ? number : null
}
export type BudgetInput = { packageAmount: number | null; travel: string; sound: string; other: string }
export type BudgetResult = {
  total: number | null
  personalExtras: number | null
  invalid: boolean
  includesVerifiedPackage: boolean
}
export function calculateBudget(input: BudgetInput): BudgetResult {
  const values = [input.travel, input.sound, input.other]
  const extras = values.map((value) => value.trim() === '' ? 0 : safeAmount(value))
  const validPackage = input.packageAmount === null ||
    (Number.isFinite(input.packageAmount) && input.packageAmount >= 0 && input.packageAmount <= 1_000_000)
  if (!validPackage || extras.some((value) => value === null))
    return { total: null, personalExtras: null, invalid: true, includesVerifiedPackage: false }
  const personalExtras = Math.round((extras as number[]).reduce((n, value) => n + value, 0) * 100) / 100
  const total = Math.round((personalExtras + (input.packageAmount || 0)) * 100) / 100
  return { total, personalExtras, invalid: false, includesVerifiedPackage: input.packageAmount !== null }
}
export function money(value: number, currency: 'EUR' | 'RON', locale: 'ro' | 'en') {
  return new Intl.NumberFormat(locale === 'en' ? 'en-GB' : 'ro-RO', {
    style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 2,
  }).format(value)
}
