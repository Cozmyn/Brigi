export function LegalPage({
  title,
  text,
  pending,
}: {
  title: string
  text: string
  pending?: string
}) {
  return (
    <article className="legal-page">
      <p className="eyebrow">Informații</p>
      <h1>{title}</h1>
      <p className="legal-lede">{text}</p>
      {pending && <p className="notice">{pending}</p>}
    </article>
  )
}
