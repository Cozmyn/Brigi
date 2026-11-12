// MySQL/MariaDB DDL auto-commits; non-destructive, restartable migration.
export async function up(db) {
  if (await db.schema.hasTable('inquiry_outbox')) return
  await db.schema.createTable('inquiry_outbox', (t) => {
    t.increments('id')
    t.integer('inquiry_id').unsigned().notNullable().unique()
      .references('id').inTable('cms_documents').onDelete('CASCADE')
    t.string('status', 16).notNullable().defaultTo('pending')
    t.integer('attempts').unsigned().notNullable().defaultTo(0)
    t.timestamp('next_attempt_at').notNullable().defaultTo(db.fn.now())
    t.timestamp('leased_until').nullable()
    t.string('lease_token', 36).nullable()
    t.timestamp('delivered_at').nullable()
    t.string('last_error', 150).nullable()
    t.timestamp('created_at').notNullable().defaultTo(db.fn.now())
    t.timestamp('updated_at').notNullable().defaultTo(db.fn.now())
    t.index(['status', 'next_attempt_at'])
    t.index(['status', 'leased_until'])
  })
}
export async function down() {
  throw new Error('Destructive rollback disabled. Restore a verified backup instead.')
}
