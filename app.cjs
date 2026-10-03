/* eslint-disable @typescript-eslint/no-require-imports -- Passenger startup is CommonJS. */
require('dotenv').config()
process.env.NODE_ENV = process.env.NODE_ENV || 'production'
const http = require('node:http')
const next = require('next')
const port = Number(process.env.PORT || 3000)
const app = next({ dev: process.env.NODE_ENV !== 'production', dir: __dirname })
const handler = app.getRequestHandler()
app
  .prepare()
  .then(() => {
    const server = http.createServer((request, response) => handler(request, response))
    server.requestTimeout = 30000
    server.headersTimeout = 15000
    // Passenger intercepts the first listen() call and supplies its own socket.
    server.listen(port, process.env.BIND_HOST || '127.0.0.1', () =>
      console.log('Brigitta application ready'),
    )
  })
  .catch((error) => {
    console.error('Application startup failed:', error.message)
    process.exitCode = 1
  })
