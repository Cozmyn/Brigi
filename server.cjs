/* eslint-disable @typescript-eslint/no-require-imports -- Passenger runtime is CommonJS. */
require('dotenv').config({
  path: process.env.DOTENV_CONFIG_PATH || require('node:path').join(__dirname, '.env'),
})
process.env.NODE_ENV = process.env.NODE_ENV || 'production'
const http = require('node:http')
const next = require('next')
const port = Number(process.env.PORT || 3000)
// Bind relative media paths to the application root, not the changing release directory.
const path = require('node:path')
if (process.env.MEDIA_DIR && !path.isAbsolute(process.env.MEDIA_DIR))
  process.env.MEDIA_DIR = path.resolve(
    path.dirname(process.env.DOTENV_CONFIG_PATH),
    process.env.MEDIA_DIR,
  )
const app = next({ dev: process.env.NODE_ENV !== 'production', dir: __dirname })
const handler = app.getRequestHandler()
app
  .prepare()
  .then(() => {
    const server = http.createServer((request, response) => handler(request, response))
    server.requestTimeout = 30000
    server.headersTimeout = 15000
    // Passenger intercepts the first http.Server.listen() and supplies its Unix socket.
    server.listen(port, process.env.BIND_HOST || '127.0.0.1', () =>
      console.log('Brigitta application ready'),
    )
  })
  .catch((error) => {
    console.error('Application startup failed:', error.message)
    process.exitCode = 1
  })
