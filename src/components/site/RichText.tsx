import type { ReactNode } from 'react'
type Node = {
  type?: string
  text?: string
  format?: number | string
  tag?: string
  url?: string
  fields?: { url?: string; newTab?: boolean }
  children?: Node[]
  listType?: string
}
function render(node: Node, key: number): ReactNode {
  if (node.type === 'text') {
    let value: ReactNode = node.text || ''
    const format = Number(node.format) || 0
    if (format & 1) value = <strong>{value}</strong>
    if (format & 2) value = <em>{value}</em>
    if (format & 8) value = <u>{value}</u>
    if (format & 4) value = <s>{value}</s>
    return <span key={key}>{value}</span>
  }
  const children = node.children?.map(render)
  if (node.type === 'linebreak') return <br key={key} />
  if (node.type === 'heading') {
    if (node.tag === 'h3') return <h3 key={key}>{children}</h3>
    if (node.tag === 'h4') return <h4 key={key}>{children}</h4>
    return <h2 key={key}>{children}</h2>
  }
  if (node.type === 'quote') return <blockquote key={key}>{children}</blockquote>
  if (node.type === 'list')
    return node.listType === 'number' ? (
      <ol key={key}>{children}</ol>
    ) : (
      <ul key={key}>{children}</ul>
    )
  if (node.type === 'listitem') return <li key={key}>{children}</li>
  if (node.type === 'link' || node.type === 'autolink') {
    const href = node.url || node.fields?.url || ''
    return /^(https?:\/\/|\/[^/]|mailto:|tel:)/.test(href) ? (
      <a key={key} href={href} rel="noopener noreferrer">
        {children}
      </a>
    ) : (
      <span key={key}>{children}</span>
    )
  }
  if (node.type === 'paragraph') return <p key={key}>{children}</p>
  return <span key={key}>{children}</span>
}
export function RichText({ data }: { data: unknown }) {
  const root = (data as { root?: Node })?.root
  return <>{root?.children?.map(render)}</>
}
