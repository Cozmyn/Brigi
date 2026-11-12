'use client'

import Link from 'next/link'
import { useState } from 'react'
import { calculateBudget, money, type VerifiedOffer } from '@/lib/planning-budget'
import { track } from './TrackedLink'

export function EstimateTool({ offers, locale }: { offers: VerifiedOffer[]; locale: 'ro' | 'en' }) {
  const en = locale === 'en'
  const [currency, setCurrency] = useState<'EUR' | 'RON'>('EUR')
  const [selectedId, setSelectedId] = useState('')
  const [travel, setTravel] = useState('')
  const [sound, setSound] = useState('')
  const [other, setOther] = useState('')
  const [calculated, setCalculated] = useState(false)
  const eligible = offers.filter((offer) => offer.currency === currency)
  const selected = eligible.find((offer) => offer.id === selectedId)
  const budget = calculateBudget({ packageAmount: selected?.price ?? null, travel, sound, other })
  const hasInput = Boolean(selected || travel || sound || other)
  const change = (setter: (value: string) => void, value: string) => {
    setter(value); setCalculated(false)
  }
  return <div className="tool-panel" data-testid="estimate-tool">
    <p className="tools-note">{en
      ? 'Transparent arithmetic, never an automatic quotation. Only commercially verified packages have published prices; other amounts come exclusively from you.'
      : 'Calcul transparent, nu ofertă automată. Prețurile apar doar pentru pachete reverificate comercial; alte sume sunt introduse exclusiv de tine.'}</p>
    <div className="tools-field-grid">
      <label className="tools-field" htmlFor="estimate-currency">{en ? 'Currency' : 'Monedă'}
        <select id="estimate-currency" value={currency} onChange={(event) => {
          setCurrency(event.target.value as 'EUR' | 'RON'); setSelectedId(''); setCalculated(false)
        }}><option value="EUR">EUR (€)</option><option value="RON">RON (lei)</option></select>
      </label>
      <label className="tools-field" htmlFor="estimate-package">
        {en ? 'Verified musical package (optional)' : 'Pachet reverificat (opțional)'}
        <select id="estimate-package" value={selectedId}
          onChange={(event) => change(setSelectedId, event.target.value)}>
          <option value="">{en ? 'No verified package selected' : 'Fără pachet selectat'}</option>
          {eligible.map((offer) => <option value={offer.id} key={offer.id}>
            {offer.label} · {offer.fromPricing ? en ? 'from ' : 'de la ' : ''}
            {money(offer.price, currency, locale)}
          </option>)}
        </select>
      </label>
    </div>
    {!eligible.length && <p className="tools-status">{en
      ? 'No commercially verified package is published in this currency. You can still total your personal amounts.'
      : 'Nu există pachet reverificat în această monedă. Poți aduna propriile costuri.'}</p>}
    <div className="tools-field-grid">
      <label className="tools-field" htmlFor="estimate-travel">{en
        ? 'Your travel budget' : 'Bugetul tău pentru deplasare'}
        <input id="estimate-travel" type="text" inputMode="decimal" value={travel} maxLength={10}
          placeholder="0" onChange={(e) => change(setTravel, e.target.value)}/>
      </label>
      <label className="tools-field" htmlFor="estimate-sound">{en
        ? 'Your technical / sound budget' : 'Bugetul tău pentru tehnic / sonorizare'}
        <input id="estimate-sound" type="text" inputMode="decimal" value={sound} maxLength={10}
          placeholder="0" onChange={(e) => change(setSound, e.target.value)}/>
      </label>
      <label className="tools-field" htmlFor="estimate-other">{en
        ? 'Other amounts you enter' : 'Alte sume introduse de tine'}
        <input id="estimate-other" type="text" inputMode="decimal" value={other} maxLength={10}
          placeholder="0" onChange={(e) => change(setOther, e.target.value)}/>
      </label>
    </div>
    <p className="tools-fine-print">{en
      ? 'Use one currency; no exchange rates, invented travel costs, per-guest multipliers or hidden fees.'
      : 'Folosește o singură monedă. Fără cursuri de schimb, deplasări inventate, multiplicatori per invitat sau taxe ascunse.'}</p>
    <button type="button" className="tools-primary-button" onClick={() => {
      setCalculated(true); if (!budget.invalid) track('budget_calculated')
    }}>{en ? 'Calculate planning sum' : 'Calculează suma de planificare'}</button>
    {calculated && <div className="tools-estimate-result" role="status" aria-live="polite">
      {budget.invalid ? <p>{en
        ? 'Enter amounts from 0 to 1,000,000 with no more than two decimals.'
        : 'Introdu sume de la 0 la 1.000.000, cu cel mult două zecimale.'}</p>
        : hasInput && budget.total !== null ? <>
          <span className="eyebrow">{en ? 'Planning subtotal' : 'Subtotal pentru planificare'}</span>
          <strong>{money(budget.total, currency, locale)}</strong>
          {selected && <p>{en ? 'Commercially verified package: ' : 'Pachet reverificat: '}
            {selected.label} · {selected.fromPricing ? en ? 'from ' : 'de la ' : ''}
            {money(selected.price, currency, locale)}</p>}
          <p>{en ? 'Additional amounts supplied by you: ' : 'Sume suplimentare introduse de tine: '}
            {money(budget.personalExtras || 0, currency, locale)}</p>
          <p className="tools-fine-print">{selected?.fromPricing
            ? en ? 'The package has a starting price. This total is a lower-bound arithmetic exercise, not the final cost.'
              : 'Pachetul are preț „de la”. Acest total este doar un calcul minim orientativ, nu costul final.'
            : en ? 'Personal planning only: not a Brigitta quote or confirmed availability.'
              : 'Doar pentru planificare: nu este o ofertă Brigitta sau disponibilitate confirmată.'}</p>
          {selected && <Link className="tools-inline-link" href={selected.href}>
            {en ? 'Ask about this package' : 'Întreabă despre acest pachet'} ↗</Link>}
        </> : <p>{en ? 'Choose a verified package or enter your own amount.' :
          'Alege un pachet reverificat sau introdu cel puțin o sumă.'}</p>}
    </div>}
    <Link className="tools-inline-link" href={en ? '/en/booking' : '/rezervare'}>
      {en ? 'Request a tailored quote' : 'Solicită o ofertă personalizată'} ↗
    </Link>
  </div>
}
