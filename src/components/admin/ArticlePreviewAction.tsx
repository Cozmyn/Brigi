'use client'

export function articlePreviewURL(documentID: unknown, locale: unknown): string | null {
  if (typeof documentID !== 'number' || !Number.isSafeInteger(documentID) ||
      !/^[1-9][0-9]{0,14}$/.test(String(documentID))) return null
  if (locale !== 'ro' && locale !== 'en') return null
  return `/admin/preview/articles/${documentID}?locale=${locale}`
}

export function ArticlePreviewAction({ documentID, locale }: { documentID: unknown; locale: unknown }) {
  const href = articlePreviewURL(documentID, locale)
  if (!href) return <p role="status">Salvează articolul și selectează RO sau EN pentru a deschide preview-ul.</p>
  return <div className="admin-field">
    <a className="admin-button" href={href} target="_blank" rel="noopener noreferrer">
      Previzualizează draftul salvat ({locale === 'en' ? 'EN' : 'RO'})
    </a>
    <p>Se afișează versiunea salvată. Modificările nesalvate nu apar în preview. Nu se publică articolul.</p>
  </div>
}
