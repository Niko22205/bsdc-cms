import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { CertificateForm } from "../../_components/CertificateForm"
import { updateCertificate } from "../../actions"

type Props = {
  params: Promise<{ id: string }>
}

export default async function EditCertificatePage({ params }: Props) {
  const { id } = await params
  const certificate = await prisma.certificate.findUnique({ where: { id } })
  if (!certificate) notFound()

  const action = updateCertificate.bind(null, certificate.id)

  const initial = {
    ...certificate,
    issueDate: certificate.issueDate ? certificate.issueDate.toISOString().slice(0, 10) : null,
  }

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-zinc-900">Edit Certificate</h1>
      <CertificateForm action={action} initial={initial} submitLabel="Save Changes" />
    </div>
  )
}
