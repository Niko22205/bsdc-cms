import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
const adapter = new PrismaPg({ connectionString: 'postgresql://postgres.mrkvwaxquqewcgcvfpqy:hQnuAMiSZcptjnad@aws-1-eu-north-1.pooler.supabase.com:5432/postgres' })
const db = new PrismaClient({ adapter })

async function main() {
  await db.certificate.upsert({
    where: { id: 'cert-0' },
    update: {
      title: 'ISO 45001:2018',
      issuer: 'TÜV NORD',
      issueDate: new Date('2020-01-01'),
      imageUrl: '/uploads/bsdc/certificates/17320030-Black-Sea-Diving-Center-45001-bg-20-page-001-724x1024-1.jpg',
      fileUrl: '/uploads/bsdc/certificates/17320030-Black-Sea-Diving-Center-45001-bg-20-page-001-724x1024-1.jpg',
      published: true,
    },
    create: {
      id: 'cert-0',
      language: 'BG',
      translationKey: 'cert-0',
      title: 'ISO 45001:2018',
      issuer: 'TÜV NORD',
      issueDate: new Date('2020-01-01'),
      imageUrl: '/uploads/bsdc/certificates/17320030-Black-Sea-Diving-Center-45001-bg-20-page-001-724x1024-1.jpg',
      fileUrl: '/uploads/bsdc/certificates/17320030-Black-Sea-Diving-Center-45001-bg-20-page-001-724x1024-1.jpg',
      published: true,
      sortOrder: 0,
    },
  })

  const total = await db.certificate.count()
  await db.$disconnect()
  console.log(`ISO 45001:2018 restored. Total certificates: ${total}`)
}

main().catch((e) => { console.error(e); process.exit(1) })
