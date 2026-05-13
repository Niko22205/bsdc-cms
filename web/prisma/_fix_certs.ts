import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
const adapter = new PrismaPg({ connectionString: 'postgresql://postgres.mrkvwaxquqewcgcvfpqy:hQnuAMiSZcptjnad@aws-1-eu-north-1.pooler.supabase.com:5432/postgres' })
const db = new PrismaClient({ adapter })

async function main() {
  const deleted = await db.certificate.deleteMany({
    where: { issueDate: null }
  })
  const remaining = await db.certificate.count()
  await db.$disconnect()
  console.log(`Deleted: ${deleted.count} duplicates`)
  console.log(`Remaining certificates: ${remaining}`)
}

main().catch((e) => { console.error(e); process.exit(1) })
