import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
const adapter = new PrismaPg({ connectionString: 'postgresql://postgres.mrkvwaxquqewcgcvfpqy:hQnuAMiSZcptjnad@aws-1-eu-north-1.pooler.supabase.com:5432/postgres' })
const db = new PrismaClient({ adapter })

async function main() {
  const r1 = await db.certificate.updateMany({
    where: { title: 'Сертификат ISO 45001' },
    data: { title: 'ISO 45001:2018', issuer: 'TÜV NORD' }
  })

  const r2 = await db.certificate.updateMany({
    where: { title: 'Сертификат QM RECA' },
    data: { title: 'ISO 9001:2015', issuer: 'TÜV NORD' }
  })

  const r3 = await db.certificate.updateMany({
    where: { title: 'Сертификат UM RECA' },
    data: { title: 'ISO 14001:2015', issuer: 'TÜV NORD' }
  })

  const r4 = await db.certificate.updateMany({
    where: { title: { contains: 'КСБ' } },
    data: { issuer: 'Камара на строителите в България' }
  })

  await db.$disconnect()
  console.log(`ISO 45001: ${r1.count} updated`)
  console.log(`ISO 9001:  ${r2.count} updated`)
  console.log(`ISO 14001: ${r3.count} updated`)
  console.log(`КСБ:       ${r4.count} updated`)
  console.log('Done')
}

main().catch((e) => { console.error(e); process.exit(1) })
