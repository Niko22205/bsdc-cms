import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
const adapter = new PrismaPg({ connectionString: 'postgresql://postgres.mrkvwaxquqewcgcvfpqy:hQnuAMiSZcptjnad@aws-1-eu-north-1.pooler.supabase.com:5432/postgres' })
const db = new PrismaClient({ adapter })

async function main() {
  const certs = await db.certificate.findMany({ orderBy: { sortOrder: 'asc' } })
  for (const c of certs) {
    console.log(`[${c.id}] ${c.title} — ${c.issuer} — issueDate: ${c.issueDate} — published: ${c.published}`)
  }
  await db.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
