/* eslint-disable @typescript-eslint/no-require-imports -- Passenger startup is CommonJS. */
const fs = require('node:fs')
const path = require('node:path')
const current = path.join(__dirname, '.deploy/current')
// The root launcher has no npm dependencies. Keep CloudLinux's root symlink intact.
let release = __dirname
try {
  fs.lstatSync(current)
  release = fs.realpathSync(current)
} catch (error) {
  if (error.code !== 'ENOENT' || fs.existsSync(path.join(__dirname, '.deploy'))) throw error
}
process.env.DOTENV_CONFIG_PATH = path.join(__dirname, '.env')
require(path.join(release, 'server.cjs'))
