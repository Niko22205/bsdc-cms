import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
const adapter = new PrismaPg({ connectionString: 'postgresql://postgres.mrkvwaxquqewcgcvfpqy:hQnuAMiSZcptjnad@aws-1-eu-north-1.pooler.supabase.com:5432/postgres' })
const db = new PrismaClient({ adapter })

async function main() {
  await db.certificate.update({
    where: { id: 'cert-0' },
    data: { title: 'ISO 45001:2018', issuer: 'TÜV NORD', issueDate: new Date('2026-02-22') }
  })
  await db.certificate.update({
    where: { id: 'cert-1' },
    data: { title: 'ISO 9001:2015', issuer: 'TÜV NORD', issueDate: new Date('2026-02-22') }
  })
  await db.certificate.update({
    where: { id: 'cert-2' },
    data: { title: 'ISO 14001:2015', issuer: 'TÜV NORD', issueDate: new Date('2026-02-22') }
  })
  await db.certificate.update({
    where: { id: 'cert-3' },
    data: { title: 'КСБ — Група 3, Категории 3 и 4', issuer: 'Камара на строителите в България', issueDate: new Date('2025-09-30') }
  })
  await db.certificate.update({
    where: { id: 'cert-4' },
    data: { title: 'КСБ — Група 4, Категории 3 и 4', issuer: 'Камара на строителите в България', issueDate: new Date('2025-09-30') }
  })
  await db.certificate.update({
    where: { id: 'cert-5' },
    data: { title: 'БКР', issuer: 'Български Корабен Регистър', issueDate: new Date('2025-09-30') }
  })
  await db.certificate.update({
    where: { id: 'cert-6' },
    data: { title: 'БНАПД', issuer: 'БНАПД', issueDate: new Date('2025-09-30') }
  })

  await db.$disconnect()
  console.log('Done')
}

main().catch((e) => { console.error(e); process.exit(1) })
