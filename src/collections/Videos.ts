import type { CollectionConfig } from '@/cms/model'
import { seoFields } from '@/fields/editorial'
export const Videos: CollectionConfig = {
  slug: 'videos',
  admin: { group: 'Media autentice', useAsTitle: 'title',
    description: 'Publică doar înregistrări autentice. URL-ul și posterul trebuie să fie aprobate, iar drepturile confirmate.',
    defaultColumns: ['title', 'slug', 'recordingContext', 'rightsConfirmed', 'approvedForPublication'] },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true, maxLength: 160 },
    { name: 'slug', label: 'URL local /video/[slug]', type: 'text', localized: true,
      maxLength: 160, validate: (value) => !value || (typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) ||
        'Folosește un slug simplu, fără /, spații sau parametri.' },
    { name: 'description', label: 'Ce se vede și se aude cu adevărat', type: 'textarea', localized: true, maxLength: 1200 },
    { name: 'publishedAt', label: 'Data reală a publicării înregistrării (ISO)', type: 'date' },
    { name: 'durationSeconds', label: 'Durata reală, în secunde', type: 'number', min: 1, max: 86400 },
    { name: 'transcript', label: 'Transcriere / context verificat', type: 'textarea', localized: true, maxLength: 10000 },
    { name: 'recordingContext', label: 'Tip înregistrare (nu eticheta studio ca live)', type: 'select',
      options: [{ label: 'Recital live', value: 'live' }, { label: 'Înregistrare de studio', value: 'studio' },
        { label: 'Repetiție', value: 'rehearsal' }, { label: 'Alt context', value: 'other' }] },
    { name: 'eventType', type: 'select', options: ['wedding', 'corporate', 'private', 'other'] },
    { name: 'kind', type: 'select', required: true, options: ['showreel', 'full', 'short'] },
    { name: 'poster', type: 'upload', relationTo: 'media' },
    { name: 'url', type: 'text' },
    { name: 'file', type: 'upload', relationTo: 'media' },
    { name: 'captions', type: 'upload', relationTo: 'media' },
    { name: 'featured', type: 'checkbox', defaultValue: false },
    { name: 'rightsConfirmed', label: 'Drepturile și permisiunile video sunt confirmate', type: 'checkbox', defaultValue: false },
    { name: 'visible', label: 'Vizibil pe website', type: 'checkbox', defaultValue: false },
    { name: 'approvedForPublication', label: 'Aprobare editorială pentru publicare', type: 'checkbox', defaultValue: false },
    { name: 'seo', type: 'group', fields: seoFields },
  ],
}
