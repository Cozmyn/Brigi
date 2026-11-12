import 'dotenv/config'
import { checkSite } from './monitor-core.mjs'

const base = process.env.MONITOR_SITE_URL || process.env.SITE_URL
const expected = process.env.MONITOR_EXPECT_INDEXABLE
if (expected !== 'true' && expected !== 'false') {
  console.error('Set MONITOR_EXPECT_INDEXABLE=true or false. This script never changes it.')
  process.exitCode = 2
} else if (!base) {
  console.error('MONITOR_SITE_URL or SITE_URL is required.')
  process.exitCode = 2
} else {
  try {
    const result = await checkSite(base, { expectedIndexable: expected === 'true' })
    console.log(JSON.stringify(result))
    if (result.status !== 'ok') process.exitCode = 1
  } catch (error) {
    console.error(error instanceof Error ? error.message : 'Monitor configuration error')
    process.exitCode = 2
  }
}
