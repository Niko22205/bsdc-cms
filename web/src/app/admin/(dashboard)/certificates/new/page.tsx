import { PageHeader } from "../../../_components/ui/PageHeader"
import { CertificateForm } from "../_components/CertificateForm"
import { createCertificate } from "../actions"

export default function NewCertificatePage() {
  return (
    <div>
      <PageHeader title="New Certificate" description="Add a certification or accreditation." />
      <div className="max-w-2xl rounded-xl border border-white/[0.07] bg-white/[0.04] p-8">
        <CertificateForm action={createCertificate} submitLabel="Create Certificate" />
      </div>
    </div>
  )
}
