/**
 * Compatibility helpers: public editorial content must never be rewritten on read.
 * Historical corrections require a separate, reviewed migration with a backup.
 */
export function vocalistCopy(text: string): string {
  return text
}

export function repairPublicText<T>(value: T): T {
  return value
}
