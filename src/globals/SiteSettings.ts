import type { GlobalConfig } from '@/cms/model'
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  fields: [
    { name: 'brandName', type: 'text', defaultValue: 'BRIGITTA', required: true },
    {
      name: 'phone',
      type: 'text',
      validate: (v: unknown) =>
        !v || (typeof v === 'string' && /^[+\d ()-]{7,24}$/.test(v)) || 'Număr de telefon valid.',
    },
    { name: 'email', type: 'email' },
    { name: 'biography', type: 'textarea' },
    {
      name: 'analyticsEnabled',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description:
          'Statistici interne agregate, numai după acord. Fără IP, identificatori de vizitator sau cookie-uri analytics. Păstrare: 90 zile.',
      },
    },
    { name: 'googleVerification', type: 'text' },
    { name: 'bingVerification', type: 'text' },
    { name: 'whatsapp', type: 'text' },
    { name: 'defaultLocale', type: 'select', defaultValue: 'ro', options: ['ro', 'en'] },
    { name: 'publicSlaDays', type: 'number', defaultValue: 10 },
    { name: 'geographicArea', type: 'text', localized: true },
    {
      name: 'socialLinks',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true },
        {
          name: 'url',
          type: 'text',
          required: true,
          validate: (
            value: unknown,
            {
              previousValue,
            }: {
              previousValue?: unknown
            },
          ) => {
            const v = value === undefined ? previousValue : value
            return (typeof v === 'string' && /^https:\/\//.test(v)) || 'Adresă HTTPS completă.'
          },
        },
      ],
    },
  ],
}
