import { PageHeader } from "../../../_components/ui/PageHeader"
import { PartnerForm } from "../_components/PartnerForm"
import { createPartner } from "../actions"

export default function NewPartnerPage() {
  return (
    <div>
      <PageHeader title="New Partner" description="Add a partner logo and link." />
      <div className="max-w-2xl rounded-xl border border-white/[0.07] bg-white/[0.04] p-8">
        <PartnerForm action={createPartner} submitLabel="Create Partner" />
      </div>
    </div>
  )
}
