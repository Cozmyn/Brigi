import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

const config = [
  ...nextVitals,
  ...nextTypescript,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
    },
  },
  { ignores: ['.next/**', 'node_modules/**', 'src/payload-types.ts', 'src/payload-generated-schema.ts'] },
  { files: ['migrations/**/*.ts'], rules: { '@typescript-eslint/no-unused-vars': 'off' } },
  // Authenticated previews must send cookies; the public Next image optimizer does not.
  { files: ['src/components/admin/**/*.tsx'], rules: { '@next/next/no-img-element': 'off' } },
]

export default config
