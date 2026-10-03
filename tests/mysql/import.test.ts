import 'dotenv/config'
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile, readdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import sharp from 'sharp'
import { getDB, closeDB } from '../../src/cms/db'
import { contentStore as store } from '../../src/cms/store'
const exec = promisify(execFile)

test('legacy import remaps media/locales, preserves publication and dates, and rolls back failures', async () => {
  assert.match(process.env.DB_NAME || '', /_test$/, 'Use a dedicated empty test database.')
  const db = getDB()
  const temporary = await mkdtemp(path.join(tmpdir(), 'brigi-import-'))
  const target = path.join(temporary, 'uploads')
  let fixtureDatabase = false
  try {
    assert.equal(Number((await db('cms_documents').count({ n: '*' }).first())?.n), 0)
    assert.equal(Number((await db('cms_globals').count({ n: '*' }).first())?.n), 0)
    fixtureDatabase = true
    await mkdir(path.join(temporary, 'media'))
    await sharp({ create: { width: 40, height: 50, channels: 3, background: '#294741' } })
      .png()
      .toFile(path.join(temporary, 'media/photo.png'))
    const published = {
      title: 'Program public',
      slug: 'import-qa',
      heroTitle: 'Voce live',
      visible: true,
      approvedForPublication: true,
      _status: 'published',
      sections: [{ heading: 'Scenă', body: 'Program vocal.', image: 81 }],
    }
    const fixture = {
      format: 'brigi-content-v1',
      collections: {
        media: {
          ro: [
            {
              id: 81,
              alt: 'Imagine de test',
              approvedForPublication: true,
              importFile: 'media/photo.png',
            },
          ],
        },
        pages: {
          ro: [
            {
              ...published,
              id: 90,
              title: 'Ciornă privată',
              _status: 'draft',
              importPublished: published,
              createdAt: 'invalid',
            },
          ],
          en: [{ ...published, id: 90, title: 'English programme', heroTitle: 'Live vocals' }],
        },
        inquiries: {
          ro: [
            {
              id: 110,
              locale: 'ro',
              status: 'confirmed',
              eventDate: '2027-06-01',
              city: 'Test',
              eventType: 'wedding',
              guestCount: 80,
              packageInterest: '1x45',
              name: 'QA fictional inquiry',
              phone: '+40700000000',
              preferredContact: 'phone',
              privacyAcknowledged: true,
              createdAt: '2024-06-01T10:00:00.000Z',
            },
          ],
        },
      },
      globals: {
        'home-settings': {
          ro: { photos: { hero: 81 } },
          en: { heroTitle: 'English homepage', photos: { hero: 81 } },
        },
      },
    }
    const file = path.join(temporary, 'content.json')
    const run = (...extra: string[]) =>
      exec(process.execPath, ['--import', 'tsx', 'scripts/import-content.ts', file, ...extra], {
        env: { ...process.env, MEDIA_DIR: target },
      })
    await writeFile(file, JSON.stringify(fixture))
    await assert.rejects(run(), /Invalid createdAt/)
    assert.equal(Number((await db('cms_documents').count({ n: '*' }).first())?.n), 0)
    assert.deepEqual(await readdir(target), [])
    fixture.collections.pages.ro[0].createdAt = '2024-01-15T12:00:00.000Z'
    await writeFile(file, JSON.stringify(fixture))
    await run('--dry-run')
    assert.equal(Number((await db('cms_documents').count({ n: '*' }).first())?.n), 0)
    await run()
    const draft = (await store.find({ collection: 'pages' })).docs[0]
    assert.equal(draft.title, 'Ciornă privată')
    assert.equal(
      (await store.byID('pages', draft.id, { overrideAccess: false }))?.title,
      'Program public',
    )
    assert.equal(
      (await store.byID('pages', draft.id, { locale: 'en', overrideAccess: false }))?.title,
      'English programme',
    )
    const media = (await store.find({ collection: 'media' })).docs[0]
    assert.notEqual(media.id, 81)
    assert.equal(
      (await store.findGlobal({ slug: 'home-settings', depth: 0 })).photos?.hero,
      media.id,
    )
    assert.ok(media.url?.endsWith('.webp'))
    const inquiry = (await store.find({ collection: 'inquiries' })).docs[0]
    assert.equal(inquiry.status, 'confirmed')
    assert.match(inquiry.createdAt, /^2024-06-01/)
    await assert.rejects(run(), /empty content database/)
    assert.equal((await store.find({ collection: 'pages' })).totalDocs, 1)
  } finally {
    if (fixtureDatabase) {
      await db('cms_documents').delete()
      await db('cms_globals').delete()
      await db('cms_audit').delete()
    }
    await closeDB()
    await rm(temporary, { recursive: true, force: true })
  }
})
