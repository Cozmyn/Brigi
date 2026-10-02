/** Repairs obsolete instrument positioning in public editorial copy, never URLs or private leads. */
export function vocalistCopy(text: string) {
  return text
    .replace(/sax(?:ophone)? performance/gi, 'live vocal performance')
    .replace(/saxophonist/gi, 'live vocalist')
    .replace(/saxophone/gi, 'vocals')
    .replace(/saxofonist(?:ă|a)?/gi, (word) =>
      word[0] === 'S' ? 'Solistă vocală' : 'solistă vocală',
    )
    .replace(/saxofon/gi, 'voce')
}
export function repairPublicText(value: unknown): unknown {
  if (typeof value === 'string') return vocalistCopy(value)
  if (Array.isArray(value)) return value.map(repairPublicText)
  if (value && typeof value === 'object') {
    const textKeys = new Set([
      'text',
      'title',
      'heading',
      'body',
      'description',
      'question',
      'answer',
      'item',
      'alt',
      'caption',
      'quote',
      'name',
      'heroTitle',
      'heroSummary',
      'heroEyebrow',
      'heroSubtitle',
      'heroAccent',
      'excerpt',
      'intro',
      'biography',
      'experienceTitle',
      'experienceText',
      'eventsTitle',
      'repertoireTitle',
      'repertoireText',
      'packagesTitle',
      'pricingNote',
      'processTitle',
      'aboutTitle',
      'faqTitle',
      'bookingTitle',
      'bookingText',
      'ogTitle',
      'ogDescription',
      'suitedFor',
    ])
    const result: Record<string, unknown> = {}
    for (const [key, item] of Object.entries(value))
      result[key] =
        typeof item === 'string'
          ? textKeys.has(key)
            ? vocalistCopy(item)
            : item
          : repairPublicText(item)
    return result
  }
  return value
}
