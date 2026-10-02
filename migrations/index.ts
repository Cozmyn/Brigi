import * as migration_20260804_121530_initial_schema from './20260804_121530_initial_schema'
import * as migration_20261001_104000_booking_details from './20261001_104000_booking_details'
import * as migration_20261001_150626_editorial_cms_analytics from './20261001_150626_editorial_cms_analytics'

export const migrations = [
  {
    up: migration_20260804_121530_initial_schema.up,
    down: migration_20260804_121530_initial_schema.down,
    name: '20260804_121530_initial_schema',
  },
  {
    up: migration_20261001_104000_booking_details.up,
    down: migration_20261001_104000_booking_details.down,
    name: '20261001_104000_booking_details',
  },
  {
    up: migration_20261001_150626_editorial_cms_analytics.up,
    down: migration_20261001_150626_editorial_cms_analytics.down,
    name: '20261001_150626_editorial_cms_analytics',
  },
]
