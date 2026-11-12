import { createCipheriv, createDecipheriv, randomBytes, scryptSync, createHash } from 'node:crypto'
import { createReadStream, createWriteStream } from 'node:fs'
import { open, appendFile } from 'node:fs/promises'
import { createGzip, createGunzip } from 'node:zlib'
import { Writable } from 'node:stream'
import { pipeline } from 'node:stream/promises'

export const MAGIC = Buffer.from('BRIGITTA-ENC-V1\n', 'ascii')
export const HEADER_BYTES = MAGIC.length + 16 + 12
export const TAG_BYTES = 16

function key(passphrase, salt) {
  if (typeof passphrase !== 'string' || passphrase.length < 24)
    throw new Error('BACKUP_ENCRYPTION_KEY must contain at least 24 characters.')
  return scryptSync(passphrase, salt, 32)
}

/** The whole compressed dump is authenticated with AES-256-GCM. */
export async function encryptBackupStream(source, filepath, passphrase) {
  const salt = randomBytes(16)
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key(passphrase, salt), iv)
  const output = createWriteStream(filepath, { flags: 'wx', mode: 0o600 })
  output.write(Buffer.concat([MAGIC, salt, iv]))
  await pipeline(source, createGzip({ level: 6 }), cipher, output)
  await appendFile(filepath, cipher.getAuthTag())
}

async function encryptionParts(filepath, passphrase) {
  const input = await open(filepath, 'r')
  try {
    const info = await input.stat()
    if (!info.isFile() || info.size < HEADER_BYTES + TAG_BYTES + 16)
      throw new Error('Backup file too short or invalid.')
    const header = Buffer.alloc(HEADER_BYTES)
    const tag = Buffer.alloc(TAG_BYTES)
    await input.read(header, 0, HEADER_BYTES, 0)
    await input.read(tag, 0, TAG_BYTES, info.size - TAG_BYTES)
    if (!header.subarray(0, MAGIC.length).equals(MAGIC))
      throw new Error('Unsupported encrypted backup format.')
    return {
      salt: header.subarray(MAGIC.length, MAGIC.length + 16),
      iv: header.subarray(MAGIC.length + 16, HEADER_BYTES),
      tag, end: info.size - TAG_BYTES - 1,
    }
  } finally { await input.close() }
}

/** Decrypt and authenticate to a Writable, never leave plaintext files behind. */
export async function decryptBackupTo(filepath, passphrase, target) {
  const parts = await encryptionParts(filepath, passphrase)
  const decipher = createDecipheriv('aes-256-gcm', key(passphrase, parts.salt), parts.iv)
  decipher.setAuthTag(parts.tag)
  await pipeline(
    createReadStream(filepath, { start: HEADER_BYTES, end: parts.end }),
    decipher, createGunzip(), target,
  )
}

/** Check that decryption, GCM authentication and gzip integrity all succeed. */
export async function verifyBackup(filepath, passphrase) {
  const digest = createHash('sha256')
  let bytes = 0
  const sink = new Writable({
    write(chunk, _encoding, done) {
      bytes += chunk.byteLength
      digest.update(chunk)
      done()
    },
  })
  await decryptBackupTo(filepath, passphrase, sink)
  if (!bytes) throw new Error('Encrypted backup is empty.')
  return { valid: true, bytes, plaintextSha256: digest.digest('hex') }
}
