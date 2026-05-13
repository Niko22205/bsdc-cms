import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
const adapter = new PrismaPg({ connectionString: 'postgresql://postgres.mrkvwaxquqewcgcvfpqy:hQnuAMiSZcptjnad@aws-1-eu-north-1.pooler.supabase.com:5432/postgres' })
const db = new PrismaClient({ adapter })

const certs = [
  { title: 'Сертификат ISO 45001', issuer: 'RECA', imageUrl: '/uploads/bsdc/certificates/17320030-Black-Sea-Diving-Center-45001-bg-20-page-001-724x1024-1.jpg', fileUrl: '/uploads/bsdc/certificates/17320030-Black-Sea-Diving-Center-45001-bg-20-page-001-724x1024-1.jpg' },
  { title: 'Сертификат QM RECA', issuer: 'RECA', imageUrl: '/uploads/bsdc/certificates/17320030-Black-Sea-Diving-Center-QM-bg-RECA-20-page-001-1086x1536-1.jpg', fileUrl: '/uploads/bsdc/certificates/17320030-Black-Sea-Diving-Center-QM-bg-RECA-20-page-001-1086x1536-1.jpg' },
  { title: 'Сертификат UM RECA', issuer: 'RECA', imageUrl: '/uploads/bsdc/certificates/17320030-Black-Sea-Diving-Center-UM-bg-RECA-20-page-001-1086x1536-1.jpg', fileUrl: '/uploads/bsdc/certificates/17320030-Black-Sea-Diving-Center-UM-bg-RECA-20-page-001-1086x1536-1.jpg' },
  { title: 'Членство КСБ', issuer: 'Камара на строителите в България', imageUrl: '/uploads/bsdc/certificates/ksb-3-3-300x212-1.jpg', fileUrl: '/uploads/bsdc/certificates/ksb-3-3-300x212-1.jpg' },
  { title: 'Членство КСБ 2', issuer: 'Камара на строителите в България', imageUrl: '/uploads/bsdc/certificates/ksb-4-34.jpg', fileUrl: '/uploads/bsdc/certificates/ksb-4-34.jpg' },
  { title: 'БКР', issuer: 'Български Корабен Регистър', imageUrl: '/uploads/bsdc/certificates/bkr.png', fileUrl: '/uploads/bsdc/certificates/bkr.png' },
  { title: 'БНАПД', issuer: 'БНАПД', imageUrl: '/uploads/bsdc/certificates/bnapd.png', fileUrl: '/uploads/bsdc/certificates/bnapd.png' },
]

async function main() {
  for (const [i, cert] of certs.entries()) {
    await db.certificate.upsert({
      where: { id: 'cert-' + i },
      update: cert,
      create: {
        id: 'cert-' + i,
        language: 'BG',
        published: true,
        sortOrder: i,
        issueDate: new Date('2020-01-01'),
        translationKey: 'cert-' + i,
        ...cert
      }
    })
    await db.media.create({
      data: {
        filename: cert.imageUrl.split('/').pop() ?? '',
        url: cert.imageUrl,
        mimeType: cert.imageUrl.endsWith('.png') ? 'image/png' : 'image/jpeg',
        size: 0
      }
    })
  }

  await db.$disconnect()
  console.log('Done - ' + certs.length + ' certificates added')
}

main().catch((e) => { console.error(e); process.exit(1) })
