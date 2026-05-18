import "dotenv/config"
import { Client } from "pg"

const MIGRATION_NAME = "20260518000000_add_about_why_us_timeline"

const sql = `
  ALTER TABLE "AboutContent" ADD COLUMN IF NOT EXISTS "whyUs" JSONB;
  ALTER TABLE "AboutContent" ADD COLUMN IF NOT EXISTS "timeline" JSONB;
`

async function run() {
  const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL
  if (!url) throw new Error("No DATABASE_URL found")

  const client = new Client({ connectionString: url, connectionTimeoutMillis: 15000 })
  await client.connect()
  console.log("Connected.")

  // Apply columns
  await client.query(sql)
  console.log("Columns applied (or already existed).")

  // Check if migration is already recorded
  const existing = await client.query(
    `SELECT id FROM _prisma_migrations WHERE migration_name = $1`,
    [MIGRATION_NAME]
  )

  if (existing.rowCount === 0) {
    await client.query(
      `INSERT INTO _prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
       VALUES (gen_random_uuid()::text, 'manual', now(), $1, NULL, NULL, now(), 1)`,
      [MIGRATION_NAME]
    )
    console.log("Migration recorded in _prisma_migrations.")
  } else {
    console.log("Migration already recorded — skipped insert.")
  }

  await client.end()
  console.log("Done.")
}

run().catch(e => { console.error(e); process.exit(1) })
