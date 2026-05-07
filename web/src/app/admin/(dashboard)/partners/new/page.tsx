import { PartnerForm } from "../_components/PartnerForm"
import { createPartner } from "../actions"

export default function NewPartnerPage() {
  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-zinc-900">New Partner</h1>
      <PartnerForm action={createPartner} submitLabel="Create Partner" />
    </div>
  )
}
