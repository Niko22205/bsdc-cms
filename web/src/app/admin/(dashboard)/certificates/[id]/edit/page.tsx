import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { PageHeader } from "../../../../_components/ui/PageHeader"
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
      <PageHeader title="Edit Certificate" description={certificate.title} />
      <div className="max-w-2xl rounded-xl border border-white/[0.07] bg-white/[0.04] p-8">
        <CertificateForm action={action} initial={initial} submitLabel="Save Changes" />
      </div>
    </div>
  )
}
