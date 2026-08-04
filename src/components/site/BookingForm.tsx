'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { routeMap, type Locale } from '@/lib/site'

type Errors = Record<string, string>

export function BookingForm({ locale }: { locale: Locale }) {
  const [step, setStep] = useState(1)
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errors, setErrors] = useState<Errors>({})
  const [idempotencyKey] = useState(() => crypto.randomUUID())

  const ro = locale === 'ro'
  const validateStepOne = (form: HTMLFormElement) => {
    const data = new FormData(form); const next: Errors = {}
    for (const field of ['eventDate', 'city', 'eventType', 'guestCount']) if (!data.get(field)) next[field] = ro ? 'Completează acest câmp.' : 'Complete this field.'
    setErrors(next); return Object.keys(next).length === 0
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const form = event.currentTarget
    if (step === 1) { if (validateStepOne(form)) { setStep(2); setErrors({}); requestAnimationFrame(() => document.querySelector<HTMLElement>('#step-heading')?.focus()) }; return }
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, unknown>
    data.locale = locale; data.privacyAcknowledged = data.privacyAcknowledged === 'on'; data.idempotencyKey = idempotencyKey
    const params = new URLSearchParams(window.location.search)
    for (const [query, field] of [['utm_source','utmSource'],['utm_medium','utmMedium'],['utm_campaign','utmCampaign'],['utm_content','utmContent'],['utm_term','utmTerm']]) if (params.get(query)) data[field] = params.get(query)!
    data.referrer = document.referrer; data.landingPath = window.location.pathname
    setStatus('submitting'); setErrors({})
    try {
      const response = await fetch('/api/inquiries', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Idempotency-Key': idempotencyKey }, body: JSON.stringify(data) })
      const result = await response.json()
      if (!response.ok) { setStatus('error'); setErrors(result.fields || { form: ro ? 'Cererea nu a putut fi trimisă. Verifică datele și încearcă din nou.' : 'The enquiry could not be sent. Check the details and try again.' }); return }
      setStatus('success'); history.replaceState({}, '', window.location.pathname)
    } catch { setStatus('error'); setErrors({ form: ro ? 'Conexiunea a fost întreruptă. Încearcă din nou.' : 'The connection was interrupted. Please try again.' }) }
  }

  if (status === 'success') return <section className="booking-success" aria-live="polite"><span className="success-mark">✓</span><p className="eyebrow">{ro ? 'Cerere înregistrată' : 'Enquiry received'}</p><h1>{ro ? 'Cererea a ajuns la Brigitta.' : 'Your enquiry has reached Brigitta.'}</h1><p>{ro ? 'Brigitta verifică data și detaliile și răspunde personal prin metoda selectată, în maximum 10 zile calendaristice. Poți reveni pe această pagină fără ca cererea să fie trimisă din nou.' : 'Brigitta checks the date and details and replies personally through your selected method within 10 calendar days. You can return to this page without the enquiry being submitted again.'}</p><Link className="button" href={routeMap[locale].home}>{ro ? 'Înapoi acasă' : 'Back home'}</Link></section>

  return <form className="booking-form" onSubmit={submit} noValidate>
    <div className="form-progress" aria-label={ro ? 'Progres formular' : 'Form progress'}><span className={step >= 1 ? 'active' : ''}>1 <em>{ro ? 'Eveniment' : 'Event'}</em></span><i /><span className={step >= 2 ? 'active' : ''}>2 <em>{ro ? 'Contact' : 'Contact'}</em></span></div>
    {errors.form && <div className="form-error" role="alert">{errors.form}</div>}
    <div className={step === 1 ? 'form-step' : 'form-step hidden'} aria-hidden={step !== 1}>
      <p className="eyebrow">01 · {ro ? 'Detalii' : 'Details'}</p><h2 id="step-heading" tabIndex={-1}>{ro ? 'Spune-ne despre eveniment' : 'Tell us about the event'}</h2>
      <div className="field-grid">
        <Field label={ro ? 'Data evenimentului' : 'Event date'} name="eventDate" error={errors.eventDate}><input id="eventDate" name="eventDate" type="text" placeholder={ro ? 'ex. 14 septembrie 2027' : 'e.g. 14 September 2027'} aria-invalid={Boolean(errors.eventDate)} /></Field>
        <Field label={ro ? 'Oraș / localitate' : 'City / town'} name="city" error={errors.city}><input id="city" name="city" type="text" autoComplete="address-level2" aria-invalid={Boolean(errors.city)} /></Field>
        <Field label={ro ? 'Tip de eveniment' : 'Event type'} name="eventType" error={errors.eventType}><select id="eventType" name="eventType" defaultValue=""><option value="" disabled>{ro ? 'Alege tipul' : 'Choose a type'}</option><option value="wedding">{ro ? 'Nuntă' : 'Wedding'}</option><option value="ceremony">{ro ? 'Ceremonie' : 'Ceremony'}</option><option value="corporate">Corporate</option><option value="anniversary">{ro ? 'Aniversare' : 'Anniversary'}</option><option value="cocktail">Cocktail</option><option value="public">{ro ? 'Eveniment public' : 'Public event'}</option><option value="other">{ro ? 'Altul' : 'Other'}</option></select></Field>
        <Field label={ro ? 'Număr aproximativ de invitați' : 'Approximate guest count'} name="guestCount" error={errors.guestCount}><input id="guestCount" name="guestCount" type="number" min="1" inputMode="numeric" /></Field>
        <Field label={ro ? 'Locație (opțional)' : 'Venue (optional)'} name="venue"><input id="venue" name="venue" type="text" /></Field>
      </div>
      <button className="button" type="submit">{ro ? 'Continuă la contact' : 'Continue to contact'} <span aria-hidden="true">→</span></button>
    </div>
    <div className={step === 2 ? 'form-step' : 'form-step hidden'} aria-hidden={step !== 2}>
      <p className="eyebrow">02 · {ro ? 'Contact și format' : 'Contact and format'}</p><h2 tabIndex={-1}>{ro ? 'Cum putem reveni la tine?' : 'How should we reach you?'}</h2>
      <div className="field-grid">
        <Field label={ro ? 'Nume' : 'Name'} name="name" error={errors.name}><input id="name" name="name" type="text" required autoComplete="name" /></Field>
        <Field label={ro ? 'Telefon' : 'Phone'} name="phone" error={errors.phone}><input id="phone" name="phone" type="tel" required autoComplete="tel" placeholder="+40" /></Field>
        <Field label={ro ? 'Contact preferat' : 'Preferred contact'} name="preferredContact" error={errors.preferredContact}><select id="preferredContact" name="preferredContact" defaultValue="whatsapp"><option value="whatsapp">WhatsApp</option><option value="phone">{ro ? 'Apel telefonic' : 'Phone call'}</option></select></Field>
        <Field label={ro ? 'Pachet' : 'Package'} name="packageInterest" error={errors.packageInterest}><select id="packageInterest" name="packageInterest" defaultValue="unsure"><option value="1x45">1 × 45 min</option><option value="2x45">2 × 45 min</option><option value="3x45">3 × 45 min</option><option value="unsure">{ro ? 'Nu știu încă' : 'Not sure yet'}</option></select></Field>
        <Field label={ro ? 'Mesaj (opțional)' : 'Message (optional)'} name="message" wide><textarea id="message" name="message" rows={5} maxLength={2000} placeholder={ro ? 'Atmosferă, program, cerințe sau orice detaliu util.' : 'Atmosphere, programme, requirements or any useful detail.'} /></Field>
      </div>
      <div className="honeypot" aria-hidden="true"><label htmlFor="website">Website</label><input id="website" name="website" tabIndex={-1} autoComplete="off" /></div>
      <label className="check-row"><input type="checkbox" name="privacyAcknowledged" required /><span>{ro ? 'Am citit ' : 'I have read the '}<Link href={routeMap[locale].privacy}>{ro ? 'informarea privind prelucrarea datelor' : 'data processing notice'}</Link>.</span></label>
      <div className="button-row"><button className="text-button" type="button" onClick={() => setStep(1)}>← {ro ? 'Înapoi' : 'Back'}</button><button className="button" type="submit" disabled={status === 'submitting' || !idempotencyKey}>{status === 'submitting' ? (ro ? 'Se trimite…' : 'Sending…') : (ro ? 'Trimite cererea' : 'Send enquiry')}</button></div>
    </div>
  </form>
}

function Field({ label, name, error, wide, children }: { label: string; name: string; error?: string; wide?: boolean; children: React.ReactNode }) {
  return <div className={wide ? 'field wide' : 'field'}><label htmlFor={name}>{label}</label>{children}{error && <span className="field-error" id={`${name}-error`}>{error}</span>}</div>
}
