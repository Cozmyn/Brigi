'use client'
import Link from 'next/link'
import { type FormEvent, useEffect, useRef, useState } from 'react'
import { inquirySchema } from '@/lib/inquiry'
import { siteContent as c, type Locale } from '@/lib/site'
import { track } from './TrackedLink'

type Errors = Record<string, string>
export function BookingForm({
  locale: _locale,
  initialPackage = 'unsure',
}: {
  locale?: Locale
  initialPackage?: string
}) {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle')
  const [errors, setErrors] = useState<Errors>({})
  const [packageValue, setPackageValue] = useState(initialPackage)
  const formRef = useRef<HTMLFormElement>(null)
  const idempotencyKey = useRef('')
  const started = useRef(false)
  const attribution = useRef<Record<string, string>>({})
  useEffect(() => {
    idempotencyKey.current = crypto.randomUUID()
    const params = new URLSearchParams(window.location.search)
    const value: Record<string, string> = {
      landingPath: window.location.pathname + window.location.search,
      referrer: document.referrer.slice(0, 500),
    }
    for (const [query, field] of [
      ['utm_source', 'utmSource'],
      ['utm_medium', 'utmMedium'],
      ['utm_campaign', 'utmCampaign'],
      ['utm_content', 'utmContent'],
      ['utm_term', 'utmTerm'],
    ]) {
      if (params.get(query)) value[field] = params.get(query)!.slice(0, 120)
    }
    try {
      const saved = sessionStorage.getItem('brigitta:attribution')
      if (!saved) sessionStorage.setItem('brigitta:attribution', JSON.stringify(value))
      attribution.current = saved ? JSON.parse(saved) : value
    } catch {
      attribution.current = value
    }
  }, [])
  const focusErrors = (next: Errors) => {
    setErrors(next)
    requestAnimationFrame(() => {
      const first = Object.keys(next)[0]
      if (first === 'form') document.getElementById('booking-error')?.focus()
      else (formRef.current?.elements.namedItem(first) as HTMLElement | null)?.focus()
    })
  }
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (status === 'submitting') return
    const data = Object.fromEntries(new FormData(event.currentTarget).entries())
    const payload = {
      ...data,
      ...attribution.current,
      locale: 'ro',
      privacyAcknowledged: data.privacyAcknowledged === 'on',
      idempotencyKey: idempotencyKey.current,
    }
    const parsed = inquirySchema.safeParse(payload)
    if (!parsed.success) {
      const next: Errors = {}
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message
      focusErrors(next)
      return
    }
    setStatus('submitting')
    setErrors({})
    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Idempotency-Key': idempotencyKey.current,
        },
        body: JSON.stringify(parsed.data),
      })
      const result = await response.json()
      if (!response.ok) {
        setStatus('idle')
        focusErrors(
          result.fields || {
            form:
              response.status === 429
                ? 'Ai trimis mai multe cereri într-un timp scurt. Încearcă din nou mai târziu.'
                : 'Cererea nu a putut fi salvată. Încearcă din nou; datele tale sunt încă în formular.',
          },
        )
        return
      }
      setStatus('success')
      track('contact_form_submitted', { package: parsed.data.packageInterest })
      requestAnimationFrame(() => document.getElementById('booking-success')?.focus())
    } catch {
      setStatus('idle')
      focusErrors({
        form: 'Conexiunea a fost întreruptă. Verifică internetul și încearcă din nou.',
      })
    }
  }
  const bind = (name: string) => ({
    id: name,
    name,
    'aria-invalid': Boolean(errors[name]),
    'aria-describedby': errors[name] ? `${name}-error` : undefined,
  })
  const field = (name: string, label: string, children: React.ReactNode, wide = false) => (
    <div className={`field ${wide ? 'wide' : ''}`}>
      <label htmlFor={name}>{label}</label>
      {children}
      {errors[name] && (
        <span className="field-error" id={`${name}-error`}>
          {errors[name]}
        </span>
      )}
    </div>
  )
  if (status === 'success')
    return (
      <div className="booking-success" id="booking-success" tabIndex={-1} role="status">
        <span className="success-mark" aria-hidden="true">
          ✓
        </span>
        <p className="eyebrow">Cerere primită</p>
        <h2>{c.booking.successTitle}</h2>
        <p>{c.booking.successText}</p>
        <Link className="text-link" href="/">
          Înapoi la pagina principală ↗
        </Link>
      </div>
    )
  return (
    <form
      className="booking-form"
      ref={formRef}
      onSubmit={submit}
      noValidate
      onFocus={() => {
        if (!started.current) {
          started.current = true
          track('contact_form_started')
        }
      }}
      aria-label="Cerere de disponibilitate"
      aria-busy={status === 'submitting'}
    >
      {errors.form && (
        <div id="booking-error" className="form-error" role="alert" tabIndex={-1}>
          {errors.form}
        </div>
      )}
      <fieldset>
        <legend>01 / Evenimentul</legend>
        <div className="field-grid">
          {field(
            'eventType',
            'Tip eveniment *',
            <select {...bind('eventType')} required defaultValue="">
              <option value="" disabled>
                Alege evenimentul
              </option>
              {c.events.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>,
          )}
          {field(
            'eventDate',
            'Data evenimentului *',
            <input {...bind('eventDate')} type="date" required />,
          )}
          {field(
            'approximateTime',
            'Ora aproximativă',
            <input {...bind('approximateTime')} type="time" />,
          )}
          {field(
            'guestCount',
            'Număr aproximativ de invitați *',
            <input
              {...bind('guestCount')}
              type="number"
              min="1"
              max="100000"
              required
              inputMode="numeric"
            />,
          )}
          {field(
            'city',
            'Oraș / localitate *',
            <input {...bind('city')} autoComplete="address-level2" maxLength={120} required />,
          )}
          {field(
            'county',
            'Județ *',
            <input {...bind('county')} autoComplete="address-level1" maxLength={120} required />,
          )}
          {field(
            'venue',
            'Locație / numele locației',
            <input {...bind('venue')} maxLength={160} />,
            true,
          )}
        </div>
      </fieldset>
      <fieldset>
        <legend>02 / Programul live</legend>
        <div className="field-grid">
          {field(
            'packageInterest',
            'Pachet dorit *',
            <select
              {...bind('packageInterest')}
              required
              value={packageValue}
              onChange={(event) => {
                setPackageValue(event.target.value)
                track('package_selected', { package: event.target.value })
              }}
            >
              {c.packages.map((item) => (
                <option key={item.id} value={item.formValue}>
                  {item.name} · {item.sets} × {item.duration} min
                </option>
              ))}
              <option value="unsure">Doresc o recomandare</option>
              <option value="custom">Ofertă personalizată</option>
            </select>,
            true,
          )}
          {field(
            'musicPreferences',
            'Preferințe muzicale',
            <input
              {...bind('musicPreferences')}
              maxLength={1000}
              placeholder="Genuri, atmosferă, cereri speciale"
            />,
            true,
          )}
          {field(
            'approximateBudget',
            'Buget aproximativ (opțional)',
            <input {...bind('approximateBudget')} maxLength={120} placeholder="ex. 750 €" />,
            true,
          )}
        </div>
      </fieldset>
      <fieldset>
        <legend>03 / Datele tale de contact</legend>
        <div className="field-grid">
          {field(
            'name',
            'Nume *',
            <input {...bind('name')} autoComplete="name" maxLength={120} required />,
          )}
          {field(
            'phone',
            'Telefon *',
            <input
              {...bind('phone')}
              type="tel"
              autoComplete="tel"
              maxLength={24}
              required
              placeholder="07… sau +40…"
            />,
          )}
          {field(
            'email',
            'Email *',
            <input {...bind('email')} type="email" autoComplete="email" maxLength={254} required />,
            true,
          )}
          {field(
            'preferredContact',
            'Cum preferi să te contactăm?',
            <select {...bind('preferredContact')} defaultValue="phone">
              <option value="phone">Telefon</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="email">Email</option>
            </select>,
            true,
          )}
          {field(
            'message',
            'Mesaj / informații suplimentare',
            <textarea {...bind('message')} rows={4} maxLength={2000} />,
            true,
          )}
        </div>
      </fieldset>
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <label className="check-row">
        <input {...bind('privacyAcknowledged')} type="checkbox" required />
        <span>
          Am citit <Link href="/confidentialitate">informarea privind prelucrarea datelor</Link> și
          sunt de acord cu folosirea datelor pentru gestionarea cererii. *
        </span>
      </label>
      {errors.privacyAcknowledged && (
        <span className="field-error" id="privacyAcknowledged-error">
          {errors.privacyAcknowledged}
        </span>
      )}
      <button className="button" type="submit" disabled={status === 'submitting'}>
        {status === 'submitting' ? 'Se trimite…' : c.booking.submit}
        <span aria-hidden="true">↗</span>
      </button>
      <p className="form-note">* Câmpuri obligatorii. Cererea nu confirmă rezervarea.</p>
    </form>
  )
}
