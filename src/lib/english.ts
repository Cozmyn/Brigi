import { siteContent, type SiteContent } from './site'
export const englishContent: SiteContent = {
  ...siteContent,
  artist: { ...siteContent.artist, profession: 'Professional live vocalist', biography: 'Brigitta is a professional live vocalist, former Vocea României contestant and former SISTEM vocalist, with original music releases. She performs Romanian and international music at weddings, christenings, private celebrations and corporate events.', credentials: ['Former Vocea României contestant', 'Former SISTEM vocalist', 'Original music releases'] },
  hero: { kicker: 'Live vocalist / Weddings & events', title: ['Brigitta.', 'A voice for your evening.'], description: 'Romanian and international repertoire for weddings, private celebrations and corporate events. A live programme planned around your guests and schedule.' },
  cta: { availability: 'Check availability', phone: 'Call now', quote: 'Request a quote' },
  headerCTA: { label: 'Check availability', href: '/en/booking' },
  footerText: 'Live vocals. Romanian and international music. Your event.',
  navigation: [{ label: 'Home', href: '/en' }, { label: 'Packages', href: '/en#pachete' }, { label: 'Contact', href: '/en/booking' }],
  packages: [], faqs: [], events: [
    { id: 'wedding', title: 'Wedding', description: '', href: '/en/booking' },
    { id: 'ceremony', title: 'Christening', description: '', href: '/en/booking' },
    { id: 'corporate', title: 'Corporate event', description: '', href: '/en/booking' },
    { id: 'anniversary', title: 'Anniversary', description: '', href: '/en/booking' },
    { id: 'other', title: 'Private party or other event', description: '', href: '/en/booking' },
  ],
  booking: { ...siteContent.booking, title: 'Tell us about your event.', description: 'Send the date, location and a few musical preferences. Availability and the final programme are confirmed individually.', submit: 'Send inquiry', successTitle: 'Your inquiry has been received.', successText: 'We will review the details and contact you. Sending an inquiry does not automatically reserve the date.' },
  headings: { ...siteContent.headings, packages: 'Choose your live programme.' },
  pricingNote: 'Indicative starting prices. The final quote depends on the date, location, travel, technical requirements and agreed performance format.',
}
