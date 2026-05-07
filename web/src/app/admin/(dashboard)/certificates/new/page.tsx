import { CertificateForm } from "../_components/CertificateForm"
import { createCertificate } from "../actions"

export default function NewCertificatePage() {
  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-zinc-900">New Certificate</h1>
      <CertificateForm action={createCertificate} submitLabel="Create Certificate" />
    </div>
  )
}
