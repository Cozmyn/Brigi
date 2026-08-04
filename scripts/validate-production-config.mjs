const requiredWhenLive = ['SITE_URL', 'PUBLIC_PHONE', 'PUBLIC_WHATSAPP', 'PRIVACY_OPERATOR', 'PRIVACY_CONTACT', 'INQUIRY_RETENTION_DAYS']

if (process.env.PRODUCTION_GATES_CLOSED === 'true') {
  const missing = requiredWhenLive.filter((key) => !process.env[key] || /replace|placeholder|example/i.test(process.env[key]))
  if (missing.length) {
    console.error(`Production configuration is incomplete: ${missing.join(', ')}`)
    process.exit(1)
  }
  if (!/^https:\/\//.test(process.env.SITE_URL || '')) {
    console.error('SITE_URL must use HTTPS for production.')
    process.exit(1)
  }
}

console.log(process.env.PRODUCTION_GATES_CLOSED === 'true' ? 'Production gates validated.' : 'Preview build: production gates remain open.')

