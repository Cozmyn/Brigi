import * as initial from './20260804_121530_initial_schema'
import * as booking from './20261001_104000_booking_details'
export const migrations = [
  { up: initial.up, down: initial.down, name: '20260804_121530_initial_schema' },
  { up: booking.up, down: booking.down, name: '20261001_104000_booking_details' },
]
