import type { Locale } from '@/lib/site'

export function LegalPage({ locale, title, text }: { locale: Locale; title: string; text: string }) {
  return <article className="legal-page"><p className="eyebrow">{locale === 'ro' ? 'Informații' : 'Information'}</p><h1>{title}</h1><p className="legal-lede">{text}</p><div className="notice"><strong>{locale === 'ro' ? 'Poartă de producție' : 'Production gate'}</strong><p>{locale === 'ro' ? 'Această pagină este intenționat conservatoare. Identitatea juridică și regula de retenție nu sunt inventate și trebuie completate înainte de lansarea publică.' : 'This page is intentionally conservative. Legal identity and the retention rule are not invented and must be completed before public launch.'}</p></div></article>
}
