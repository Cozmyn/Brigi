'use client'
import Link from 'next/link'
import { type FormEvent, useEffect, useRef, useState } from 'react'
import { inquirySchema } from '@/lib/inquiry'
import { getInquiryAttribution } from '@/lib/attribution'
import { type SiteContent, type Locale } from '@/lib/site'
import { track } from './TrackedLink'

type Errors = Record<string, string>
export function BookingForm({
  content: c,
  selectedPackageName = '',
  locale = 'ro',
  initialPackage = 'unsure',
}: {
  content: Pick<SiteContent, 'booking' | 'packages' | 'events'> & Partial<Pick<SiteContent, 'analyticsEnabled'>>
  selectedPackageName?: string
  locale?: Locale
  initialPackage?: string
}) {
  const en = locale === 'en'
  const labels: Record<string, string> = { eventType: 'Event type *', eventDate: 'Event date', approximateTime: 'Approximate time', guestCount: 'Approximate guests', city: 'City / town *', county: 'County / region', venue: 'Venue', packageInterest: 'Performance package *', musicPreferences: 'Musical preferences', approximateBudget: 'Approximate budget (optional)', name: 'Name *', phone: 'Phone (or email)', email: 'Email (or phone)', preferredContact: 'Preferred contact method', message: 'Message / additional details' }
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle')
  const [errors, setErrors] = useState<Errors>({})
  const [mode, setMode] = useState<'quick' | 'detailed'>(selectedPackageName || initialPackage !== 'unsure' ? 'detailed' : 'quick')
  const [datePrecision, setDatePrecision] = useState<'exact' | 'month' | 'unknown'>(
    selectedPackageName || initialPackage !== 'unsure' ? 'exact' : 'unknown',
  )
  const packageToken = (p: (typeof c.packages)[number]) =>
    c.packages.filter((x) => x.formValue === p.formValue).length > 1
      ? `${p.formValue}:${p.id}`
      : p.formValue
  const initial =
    c.packages.find((p) => p.name === selectedPackageName) ||
    c.packages.find((p) => p.formValue === initialPackage)
  const [packageValue, setPackageValue] = useState(initial ? packageToken(initial) : initialPackage)
  const formRef = useRef<HTMLFormElement>(null)
  const idempotencyKey = useRef('')
  const started = useRef(false)
  useEffect(() => { idempotencyKey.current = crypto.randomUUID() }, [])
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
    if (!idempotencyKey.current) idempotencyKey.current = crypto.randomUUID()
    const payload = {
      ...data,
      ...getInquiryAttribution(c.analyticsEnabled === true),
      locale,
      inquiryMode: mode,
      datePrecision,
      packageInterest: packageValue.split(':')[0],
      selectedPackageName: c.packages.find((p) => packageToken(p) === packageValue)?.name || '',
      preferredContact: !String(data.phone || '').trim() && String(data.email || '').trim()
        ? 'email' : data.preferredContact,
      privacyAcknowledged: data.privacyAcknowledged === 'on',
      idempotencyKey: idempotencyKey.current,
    }
    const parsed = inquirySchema.safeParse(payload)
    if (!parsed.success) {
      const next: Errors = {}
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = en ? 'Please check this field.' : issue.message
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
      <label htmlFor={name}>{en ? labels[name] || label : label}</label>
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
        <p className="eyebrow">{en ? 'Inquiry received' : 'Cerere primită'}</p>
        <h2>{c.booking.successTitle}</h2>
        <p>{c.booking.successText}</p>
        <Link className="text-link" href={en ? '/en' : '/'}>
          {en ? 'Back to homepage' : 'Înapoi la pagina principală'} ↗
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
      aria-label={en ? 'Availability inquiry' : 'Cerere de disponibilitate'}
      aria-busy={status === 'submitting'}
    >
      {errors.form && (
        <div id="booking-error" className="form-error" role="alert" tabIndex={-1}>
          {errors.form}
        </div>
      )}
      <div className="booking-mode-switch" role="group" aria-label={en ? 'Inquiry type' : 'Tip cerere'}>
        <button type="button" aria-pressed={mode === 'quick'} onClick={() => setMode('quick')}>
          {en ? 'Quick inquiry' : 'Cerere rapidă'}
        </button>
        <button type="button" aria-pressed={mode === 'detailed'} onClick={() => setMode('detailed')}>
          {en ? 'Add event details' : 'Adaugă detaliile evenimentului'}
        </button>
      </div>
      <p className="form-note">
        {en ? 'You can ask for availability even if the date is undecided. One contact method is enough.'
          : 'Poți solicita disponibilitatea chiar dacă nu știi data exactă. Este suficient telefonul sau emailul.'}
      </p>
      <fieldset>
        <legend>01 / {en ? 'Your event' : 'Evenimentul'}</legend>
        <div className="field-grid">
          {field(
            'eventType',
            'Tip eveniment *',
            <select {...bind('eventType')} required defaultValue="">
              <option value="" disabled>
                {en ? 'Select event type' : 'Alege evenimentul'}
              </option>
              {c.events.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>,
          )}
          {field(
            'datePrecision',
            'Când are loc evenimentul?',
            <select {...bind('datePrecision')} value={datePrecision}
              onChange={(event) => setDatePrecision(event.target.value as 'exact' | 'month' | 'unknown')}>
              <option value="exact">{en ? 'Exact date' : 'Știu data exactă'}</option>
              <option value="month">{en ? 'Approximate month' : 'Știu doar luna'}</option>
              <option value="unknown">{en ? 'Not decided yet' : 'Nu știu încă'}</option>
            </select>,
            true,
          )}
          {datePrecision === 'exact' && field(
            'eventDate',
            'Data evenimentului *',
            <input {...bind('eventDate')} type="date" required />,
          )}
          {datePrecision === 'month' && field(
            'eventMonth',
            'Luna aproximativă *',
            <input {...bind('eventMonth')} type="month" required />,
          )}
          {mode === 'detailed' && field(
            'approximateTime',
            'Ora aproximativă',
            <input {...bind('approximateTime')} type="time" />,
          )}
          {mode === 'detailed' && field(
            'guestCount',
            'Număr aproximativ de invitați',
            <input
              {...bind('guestCount')}
              type="number"
              min="1"
              max="100000"
              inputMode="numeric"
            />,
          )}
          {field(
            'city',
            'Oraș / localitate *',
            <input {...bind('city')} autoComplete="address-level2" maxLength={120} required />,
          )}
          {mode === 'detailed' && field(
            'county',
            'Județ',
            <input {...bind('county')} autoComplete="address-level1" maxLength={120} />,
          )}
          {mode === 'detailed' && field(
            'venue',
            'Locație / numele locației',
            <input {...bind('venue')} maxLength={160} />,
            true,
          )}
        </div>
      </fieldset>
      <fieldset hidden={mode === 'quick'}>
        <legend>02 / {en ? 'Live performance' : 'Programul live'}</legend>
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
                <option key={item.id} value={packageToken(item)}>
                  {item.name} · {item.sets} × {item.duration} min
                </option>
              ))}
              <option value="unsure">{en ? 'Help me choose' : 'Doresc o recomandare'}</option>
              <option value="custom">{en ? 'Custom quote' : 'Ofertă personalizată'}</option>
            </select>,
            true,
          )}
          {field(
            'musicPreferences',
            'Preferințe muzicale',
            <input
              {...bind('musicPreferences')}
              maxLength={1000}
              placeholder={en ? 'Genres, atmosphere, special requests' : 'Genuri, atmosferă, cereri speciale'}
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
        <legend>03 / {en ? 'Contact details' : 'Datele tale de contact'}</legend>
        <div className="field-grid">
          {field(
            'name',
            'Nume *',
            <input {...bind('name')} autoComplete="name" maxLength={120} required />,
          )}
          {field(
            'phone',
            'Telefon (sau email)',
            <input
              {...bind('phone')}
              type="tel"
              autoComplete="tel"
              maxLength={24}
              placeholder="07… sau +40…"
            />,
          )}
          {field(
            'email',
            'Email (sau telefon)',
            <input {...bind('email')} type="email" autoComplete="email" maxLength={254} />,
            true,
          )}
          {field(
            'preferredContact',
            'Cum preferi să te contactăm?',
            <select {...bind('preferredContact')} defaultValue="phone">
              <option value="phone">{en ? 'Phone' : 'Telefon'}</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="email">Email</option>
            </select>,
            true,
          )}
          {mode === 'detailed' && field(
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
          {en ? <>I have read the <Link href="/confidentialitate" hrefLang="ro">privacy notice (Romanian)</Link> and agree to the use of my details to handle this inquiry. *</> : <>Am citit <Link href="/confidentialitate">informarea privind prelucrarea datelor</Link> și sunt de acord cu folosirea datelor pentru gestionarea cererii. *</>}
        </span>
      </label>
      {errors.privacyAcknowledged && (
        <span className="field-error" id="privacyAcknowledged-error">
          {errors.privacyAcknowledged}
        </span>
      )}
      <button className="button" type="submit" disabled={status === 'submitting'}>
        {status === 'submitting' ? en ? 'Sending...' : 'Se trimite…' : c.booking.submit}
        <span aria-hidden="true">↗</span>
      </button>
      <p className="form-note">{en ? '* Only the marked fields are required. An inquiry does not confirm a booking.' : '* Doar câmpurile marcate sunt obligatorii. Cererea nu confirmă rezervarea.'}</p>
    </form>
  )
}
