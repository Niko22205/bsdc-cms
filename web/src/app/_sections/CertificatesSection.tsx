import type { Certificate } from "@/generated/prisma/client"
import { CertificateCard, type CertificateItem } from "./_components/CertificateCard"

type Props = {
  certificates: Certificate[]
}

export function CertificatesSection({ certificates }: Props) {
  if (certificates.length === 0) return null

  const items: CertificateItem[] = certificates.map((c) => ({
    id: c.id,
    title: c.title,
    issuer: c.issuer,
    issueDate: c.issueDate ? c.issueDate.toISOString().slice(0, 7) : null,
    imageUrl: c.imageUrl,
    fileUrl: c.fileUrl,
    description: c.description,
  }))

  return (
    <section id="certificates" className="px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
          Сертификати
        </h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c) => (
            <CertificateCard key={c.id} certificate={c} />
          ))}
        </div>
      </div>
    </section>
  )
}
