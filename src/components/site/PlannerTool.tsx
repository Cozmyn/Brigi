'use client'

import { useState } from 'react'
import {
  initialPlanner, normalizePlanner, plannerStoreKey, type DateMode,
  type PlannerData, type PlannerMoment,
} from '@/lib/planner-model'
import { exportPlannerPDF } from '@/lib/planner-pdf'
import { track } from './TrackedLink'

export function PlannerTool({ locale }: { locale: 'ro' | 'en' }) {
  const en = locale === 'en'
  const [plan, setPlan] = useState<PlannerData>(initialPlanner)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const update = (key: keyof Omit<PlannerData, 'moments'>, value: string) =>
    setPlan((old) => ({ ...old, [key]: value }))
  const updateMoment = (id: string, patch: Partial<PlannerMoment>) =>
    setPlan((old) => ({ ...old, moments: old.moments.map((moment) =>
      moment.id === id ? { ...moment, ...patch } : moment) }))
  const addMoment = () => setPlan((old) => ({
    ...old, moments: old.moments.length >= 40 ? old.moments :
      [...old.moments, { id: crypto.randomUUID(), time: '', title: '', notes: '', done: false }],
  }))
  const save = () => {
    try {
      const valid = normalizePlanner(plan)
      if (!valid) throw new Error('Invalid')
      localStorage.setItem(plannerStoreKey, JSON.stringify(valid))
      setMessage(en ? 'Saved only on this device.' : 'Salvat doar pe acest dispozitiv.')
    } catch { setMessage(en ? 'Local storage is unavailable.' : 'Salvarea locală nu este disponibilă.') }
  }
  const load = () => {
    try {
      const raw = localStorage.getItem(plannerStoreKey)
      const parsed: unknown = raw ? JSON.parse(raw) : null
      const valid = normalizePlanner(parsed)
      if (!valid) throw new Error('No saved draft')
      setPlan(valid)
      setMessage(en ? 'Local draft loaded.' : 'Planul local a fost încărcat.')
    } catch { setMessage(en ? 'No valid saved draft on this device.' : 'Nu există un plan local valid.') }
  }
  const forget = () => {
    try { localStorage.removeItem(plannerStoreKey) } catch { /* still clear current state */ }
    setPlan(initialPlanner())
    setMessage(en ? 'Local draft and form cleared.' : 'Planul local și formularul au fost șterse.')
  }
  const download = async () => {
    if (busy) return
    setBusy(true)
    setMessage('')
    try {
      const result = await exportPlannerPDF(plan, locale)
      track('planner_exported')
      setMessage(en ? 'PDF downloaded (' + result.pages + ' page(s)).' :
        'PDF descărcat (' + result.pages + ' pagini).')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : (en ? 'Export failed.' : 'Exportul a eșuat.'))
    } finally { setBusy(false) }
  }
  return (
    <div className="tool-panel" data-testid="planner-tool">
      <p className="tools-note">{en
        ? 'An editable timeline. Nothing is sent to our server; saving to this device is optional.'
        : 'Cronologie editabilă. Nimic nu este trimis către server. Salvarea locală este opțională.'}
      </p>
      <div className="tools-field-grid">
        <label className="tools-field" htmlFor="plan-event">
          {en ? 'Event name' : 'Numele evenimentului'}
          <input id="plan-event" maxLength={120} value={plan.eventName}
            placeholder={en ? 'e.g. Our celebration' : 'ex. Seara noastră'}
            onChange={(event) => update('eventName', event.target.value)} />
        </label>
        <label className="tools-field" htmlFor="plan-type">
          {en ? 'Event type' : 'Tipul evenimentului'}
          <select id="plan-type" value={plan.eventType}
            onChange={(event) => update('eventType', event.target.value)}>
            <option value="nunta">{en ? 'Wedding' : 'Nuntă'}</option>
            <option value="corporate">{en ? 'Corporate' : 'Corporate'}</option>
            <option value="ceremonie">{en ? 'Ceremony' : 'Ceremonie'}</option>
            <option value="petrecere">{en ? 'Private event' : 'Eveniment privat'}</option>
            <option value="altul">{en ? 'Other' : 'Altul'}</option>
          </select>
        </label>
        <label className="tools-field" htmlFor="plan-date-mode">
          {en ? 'How certain is the date?' : 'Cât de sigură este data?'}
          <select id="plan-date-mode" value={plan.dateMode}
            onChange={(event) => update('dateMode', event.target.value as DateMode)}>
            <option value="unknown">{en ? 'Not chosen yet' : 'Nu știu încă'}</option>
            <option value="month">{en ? 'Approximate month' : 'Știu doar luna'}</option>
            <option value="exact">{en ? 'Exact date' : 'Dată exactă'}</option>
          </select>
        </label>
        {plan.dateMode === 'exact' &&
          <label className="tools-field" htmlFor="plan-date">{en ? 'Event date' : 'Data evenimentului'}
            <input id="plan-date" type="date" value={plan.eventDate}
              onChange={(event) => update('eventDate', event.target.value)} />
          </label>}
        {plan.dateMode === 'month' &&
          <label className="tools-field" htmlFor="plan-month">{en ? 'Approximate month' : 'Luna aproximativă'}
            <input id="plan-month" type="month" value={plan.eventMonth}
              onChange={(event) => update('eventMonth', event.target.value)} />
          </label>}
        <label className="tools-field" htmlFor="plan-city">
          {en ? 'City / location' : 'Oraș / localitate'}
          <input id="plan-city" maxLength={120} value={plan.city}
            onChange={(event) => update('city', event.target.value)} />
        </label>
        <label className="tools-field" htmlFor="plan-guests">
          {en ? 'Approximate guests' : 'Număr aproximativ de invitați'}
          <input id="plan-guests" type="number" min={1} max={100000} value={plan.guestCount}
            onChange={(event) => update('guestCount', event.target.value.slice(0, 6))} />
        </label>
      </div>
      <div className="tools-section-heading">
        <div>
          <span className="eyebrow">{en ? '02 / Timeline' : '02 / Cronologie'}</span>
          <h2>{en ? 'Organise every moment' : 'Așază fiecare moment'}</h2>
        </div>
        <button type="button" className="tools-small-button" onClick={addMoment}
          disabled={plan.moments.length >= 40}>{en ? 'Add moment' : 'Adaugă moment'}</button>
      </div>
      <p className="tools-note">{en
        ? 'Starting points are examples, not a booked performance or a confirmed schedule.'
        : 'Momentele inițiale sunt exemple editabile, nu un program sau o prestație confirmată.'}</p>
      <ol className="planner-moments">
        {plan.moments.map((moment, i) =>
          <li className="planner-moment" key={moment.id}>
            <div className="planner-index">{String(i + 1).padStart(2, '0')}</div>
            <div className="planner-moment-fields">
              <div className="tools-field-grid">
                <label className="tools-field" htmlFor={'plan-time-' + moment.id}>
                  {en ? 'Time' : 'Oră'}
                  <input id={'plan-time-' + moment.id} type="time" value={moment.time}
                    onChange={(event) => updateMoment(moment.id, { time: event.target.value })}/>
                </label>
                <label className="tools-field" htmlFor={'plan-title-' + moment.id}>
                  {en ? 'Moment' : 'Moment'}
                  <input id={'plan-title-' + moment.id} maxLength={120} value={moment.title}
                    onChange={(event) => updateMoment(moment.id, { title: event.target.value })}/>
                </label>
              </div>
              <label className="tools-field" htmlFor={'plan-notes-' + moment.id}>
                {en ? 'Notes / logistics' : 'Note și logistică'}
                <textarea id={'plan-notes-' + moment.id} rows={2} maxLength={300} value={moment.notes}
                  onChange={(event) => updateMoment(moment.id, { notes: event.target.value })}/>
              </label>
              <div className="planner-moment-actions">
                <label><input type="checkbox" checked={moment.done}
                  onChange={(event) => updateMoment(moment.id, { done: event.target.checked })}/>
                  {en ? 'Confirmed by me' : 'Confirmat de mine'}</label>
                <button type="button" onClick={() => setPlan((old) => ({
                  ...old, moments: old.moments.filter((item) => item.id !== moment.id),
                }))}>{en ? 'Remove' : 'Elimină'}</button>
              </div>
            </div>
          </li>)}
      </ol>
      <label className="tools-field tools-notes" htmlFor="plan-notes">
        {en ? 'Extra notes' : 'Note suplimentare'}
        <textarea id="plan-notes" rows={4} maxLength={2000} value={plan.notes}
          onChange={(event) => update('notes', event.target.value)}/>
      </label>
      <div className="tools-actions">
        <button type="button" className="tools-primary-button" onClick={() => void download()}
          disabled={busy}>{busy ? (en ? 'Generating…' : 'Generez PDF…') :
          (en ? 'Download PDF' : 'Descarcă PDF')}</button>
        <button type="button" className="tools-small-button" onClick={save}>
          {en ? 'Save on this device' : 'Salvează pe dispozitiv'}</button>
        <button type="button" className="tools-small-button" onClick={load}>
          {en ? 'Load saved draft' : 'Încarcă planul salvat'}</button>
        <button type="button" className="tools-text-button" onClick={forget}>
          {en ? 'Delete local draft' : 'Șterge planul local'}</button>
      </div>
      {message && <p role="status" className="tools-status">{message}</p>}
      <p className="tools-fine-print">{en
        ? 'The PDF is created in your browser, including Romanian characters. It is a printable image-based PDF. No automatic storage or server uploads.'
        : 'PDF-ul este generat în browser, cu diacritice românești. Este un PDF rasterizat, pregătit pentru imprimare. Nu există salvare automată sau încărcare pe server.'}</p>
    </div>
  )
}
