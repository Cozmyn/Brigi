import 'dotenv/config'
import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import { contentStore as store } from '../../src/cms/store'
import { getDB, closeDB } from '../../src/cms/db'
import {
  hashPassword,
  verifyPassword,
  createSession,
  authenticate,
  canManage,
  type User,
} from '../../src/cms/auth'
import { validateFields } from '../../src/cms/validation'
import { collections } from '../../src/cms/schema'
const ids: number[] = []
after(async () => {
  if (ids.length) await getDB()('cms_documents').whereIn('id', ids).delete()
  await closeDB()
})
test('MySQL publication keeps drafts private, validates slugs, isolates locales, redirects and revisions', async () => {
  const slug = `qa-${Date.now()}`
  const data = {
    slug,
    title: 'Public title',
    heroTitle: 'Live vocalist',
    visible: true,
    approvedForPublication: true,
    _status: 'draft',
  }
  const doc = await store.create({ collection: 'pages', data })
  ids.push(doc.id)
  assert.equal(await store.byID('pages', doc.id, { overrideAccess: false }), null)
  await store.update({ collection: 'pages', id: doc.id, data: { _status: 'published' } })
  assert.equal(
    (await store.byID('pages', doc.id, { overrideAccess: false }))?.title,
    'Public title',
  )
  await store.update({
    collection: 'pages',
    id: doc.id,
    data: { title: 'Private draft', _status: 'draft' },
  })
  assert.equal(
    (await store.byID('pages', doc.id, { overrideAccess: false }))?.title,
    'Public title',
  )
  assert.equal((await store.byID('pages', doc.id))?.title, 'Private draft')
  assert.equal(await store.byID('pages', doc.id, { locale: 'en', overrideAccess: false }), null)
  await store.update({
    collection: 'pages',
    id: doc.id,
    locale: 'en',
    data: { ...data, title: 'English title', _status: 'published' },
  })
  assert.equal(
    (await store.byID('pages', doc.id, { locale: 'en', overrideAccess: false }))?.title,
    'English title',
  )
  await store.update({
    collection: 'pages',
    id: doc.id,
    data: { slug: `${slug}-new`, _status: 'published' },
  })
  const redirects = await store.find({
    collection: 'redirects',
    where: { from: { equals: `/${slug}` } },
  })
  assert.equal(redirects.docs[0].to, `/${slug}-new`)
  ids.push(redirects.docs[0].id)
  assert.ok((await getDB()('cms_revisions').where({ document_id: doc.id })).length >= 2)
  await assert.rejects(
    store.create({ collection: 'pages', data: { ...data, slug: `${slug}-new` } }),
  )
  assert.equal((await store.byID('pages', doc.id))?.slug, `${slug}-new`)
  await store.unpublish('pages', doc.id)
  assert.equal(await store.byID('pages', doc.id, { overrideAccess: false }), null)
})
test('private collections and approved media are protected', async () => {
  const media = await store.create({
    collection: 'media',
    data: { alt: 'QA', approvedForPublication: false },
  })
  ids.push(media.id)
  assert.equal(await store.byID('media', media.id, { overrideAccess: false }), null)
  await assert.rejects(store.find({ collection: 'inquiries', overrideAccess: false }))
  await assert.rejects(store.create({ collection: 'pages', overrideAccess: false, data: {} }))
  const editor: User = {
    id: 1,
    role: 'editor',
    username: 'editor',
    displayName: 'Editor',
    active: true,
    canAccessInquiries: false,
  }
  assert.equal(canManage(editor, 'users'), false)
  assert.equal(canManage(editor, 'inquiries'), false)
  assert.equal(canManage(editor, 'pages'), true)
  assert.throws(() =>
    validateFields(collections.pages.fields, { title: 'A', heroTitle: 'B', slug: 'admin' }),
  )
})
test('passwords use salted scrypt and session revocation is effective', async () => {
  const password = `QA-${crypto.randomUUID()}`
  const hash = await hashPassword(password)
  assert.ok(await verifyPassword(password, hash))
  assert.equal(await verifyPassword('wrong-password', hash), false)
  assert.notEqual(hash, await hashPassword(password))
  const db = getDB()
  const [id] = await db('cms_users').insert({
    username: `qa-${Date.now()}`,
    display_name: 'QA',
    role: 'editor',
    active: true,
    password_hash: hash,
  })
  try {
    const token = await createSession({
      id,
      role: 'editor',
      username: 'qa',
      displayName: 'QA',
      active: true,
      canAccessInquiries: false,
    })
    const headers = new Headers({ cookie: `brigi_session=${token}` })
    assert.equal((await authenticate(headers))?.id, id)
    await db('cms_users').where({ id }).update({ active: false })
    assert.equal(await authenticate(headers), null)
  } finally {
    await db('cms_users').where({ id }).delete()
  }
})
