import 'dotenv/config'
import { closeDB } from '../src/cms/db'
import { dispatchInquiryNotifications, requeueFailedNotifications } from '../src/lib/inquiry-notifications'

try {
  if (process.argv.includes('--retry-failed')) {
    const count = await requeueFailedNotifications()
    console.log('Requeued ' + count + ' failed notification(s).')
  }
  const result = await dispatchInquiryNotifications()
  console.log(JSON.stringify(result))
  if (!result.enabled)
    console.error('Notification webhook not configured; leads remain queued in MySQL.')
} catch (error) {
  console.error('Notification worker failed:', error instanceof Error ? error.message : 'unknown')
  process.exitCode = 1
} finally {
  await closeDB()
}
