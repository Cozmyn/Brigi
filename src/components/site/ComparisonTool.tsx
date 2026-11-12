'use client'

import Link from 'next/link'
import { useState } from 'react'
import { money, type ComparisonItem } from '@/lib/planning-budget'
import { track } from './TrackedLink'

export function ComparisonTool({ items, locale }: { items: ComparisonItem[]; locale: 'ro' | 'en' }) {
  const en = locale === 'en'
  const [first, setFirst] = useState(items[0]?.id || '')
  const [second, setSecond] = useState(items[1]?.id || '')
  const a = items.find((item) => item.id === first)
  const b = items.find((item) => item.id === second)
  const price = (item: ComparisonItem) =>
    item.price === null || !item.currency
      ? en ? 'Price on request' : 'Preț nepublicat; solicită ofertă'
      : (item.fromPricing ? en ? 'From ' : 'De la ' : '') + money(item.price, item.currency, locale)
  const fields = [
    { label: en ? 'Description' : 'Descriere', value: (item: ComparisonItem) => item.summary },
    { label: en ? 'Line-up' : 'Componență reală', value: (item: ComparisonItem) => item.lineup },
    { label: en ? 'Suitable occasions' : 'Contexte potrivite', value: (item: ComparisonItem) => item.suitableFor },
    { label: en ? 'Technical requirements' : 'Cerințe tehnice', value: (item: ComparisonItem) => item.technicalRequirements },
    { label: en ? 'Published duration' : 'Durată publicată', value: (item: ComparisonItem) => item.duration },
    { label: en ? 'Verified price' : 'Preț reverificat', value: price },
  ]
  return <div className="tool-panel" data-testid="comparison-tool">
    <p className="tools-note">{en
      ? 'Only published, approved formats and commercially verified offers are listed. Missing details remain unconfirmed.'
      : 'Afișăm numai formate publicate și aprobate sau oferte reverificate comercial. Detaliile necunoscute rămân neconfirmate.'}</p>
    {items.length ? <>
      <div className="tools-field-grid">
        <label className="tools-field" htmlFor="compare-one">{en ? 'First option' : 'Prima opțiune'}
          <select id="compare-one" value={first} onChange={(event) => {
            setFirst(event.target.value); track('format_compared')
          }}>
            <option value="">{en ? 'Choose' : 'Alege'}</option>
            {items.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
        </label>
        <label className="tools-field" htmlFor="compare-two">{en ? 'Second option' : 'A doua opțiune'}
          <select id="compare-two" value={second} onChange={(event) => {
            setSecond(event.target.value); track('format_compared')
          }}>
            <option value="">{en ? 'Choose' : 'Alege'}</option>
            {items.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
        </label>
      </div>
      {a && b && a.id !== b.id ? <div className="tools-table-scroll">
        <table className="tools-compare-table">
          <thead><tr><th scope="col">{en ? 'Criterion' : 'Criteriu'}</th>
            <th scope="col">{a.label}</th><th scope="col">{b.label}</th></tr></thead>
          <tbody>{fields.map(({ label, value }) =>
            <tr key={label}><th scope="row">{label}</th>
              <td>{value(a) || (en ? 'Not confirmed' : 'Neconfirmat')}</td>
              <td>{value(b) || (en ? 'Not confirmed' : 'Neconfirmat')}</td></tr>)}</tbody>
        </table>
      </div> : <p className="tools-status" role="status">{en
        ? 'Choose two different published options.' : 'Alege două opțiuni publicate diferite.'}</p>}
      {a && b && a.id !== b.id && <div className="tools-actions">
        <Link href={a.href} className="tools-small-button">{en ? 'Details: ' : 'Detalii: '}{a.label}</Link>
        <Link href={b.href} className="tools-small-button">{en ? 'Details: ' : 'Detalii: '}{b.label}</Link>
      </div>}
    </> : <p role="status" className="tools-empty">{en
      ? 'There are no approved formats or verified offers to compare yet.'
      : 'Nu există încă formate aprobate ori oferte reverificate pentru comparație.'}</p>}
    <p className="tools-fine-print">{en
      ? 'Comparison does not reserve a date or promise a price.'
      : 'Comparația nu rezervă o dată și nu garantează un preț.'}</p>
    <Link className="tools-inline-link" href={en ? '/en/booking' : '/rezervare'}>
      {en ? 'Request a personal recommendation' : 'Solicită o recomandare pentru evenimentul tău'} ↗
    </Link>
  </div>
}
