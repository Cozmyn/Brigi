/** Safe, offline suggestions derived exclusively from the editor's own copy. */
export function editorialSlug(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[șş]/gi, 's').replace(/[țţ]/gi, 't')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 145)
    .replace(/-+$/g, '')
}
const text = (value: unknown) => typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : ''
export function editorialSEOSuggestion(data: Record<string, unknown>, brand = 'Brigitta') {
  const sourceTitle = text(data.title) || text(data.heroTitle) || text(data.name)
  const title = sourceTitle.length > 64 ? sourceTitle.slice(0, 61).replace(/\s+\S*$/, '') + '…' : sourceTitle
  const naturalTitle = title && !title.toLowerCase().includes(brand.toLowerCase()) ? title + ' | ' + brand : title
  const sourceDescription = text(data.summary) || text(data.excerpt) ||
    text(data.heroSummary) || text(data.description)
  const description = sourceDescription.length > 160
    ? sourceDescription.slice(0, 157).replace(/\s+\S*$/, '') + '…' : sourceDescription
  return {
    slug: editorialSlug(sourceTitle),
    title: naturalTitle.slice(0, 90),
    description: description.slice(0, 200),
  }
}
export function editorialSEOFeedback(data: Record<string, unknown>) {
  const seo = (data.seo && typeof data.seo === 'object' && !Array.isArray(data.seo))
    ? data.seo as Record<string, unknown> : {}
  const title = text(seo.title) || text(data.title) || text(data.heroTitle)
  const description = text(seo.description) || text(data.summary) || text(data.excerpt)
  const issues: string[] = []
  if (title.length < 25) issues.push('Titlul SEO este prea puțin descriptiv.')
  if (title.length > 70) issues.push('Titlul este lung; Google îl poate scurta în rezultate.')
  if (description.length < 70) issues.push('Descrierea ar putea explica mai clar beneficiul pentru cititor.')
  if (description.length > 165) issues.push('Meta descrierea este lungă; poate fi trunchiată.')
  if (!text(data.slug)) issues.push('Lipsește slugul pentru URL.')
  if (seo.noindex === true) issues.push('Pagina este setată noindex.')
  return { title, description, issues }
}
