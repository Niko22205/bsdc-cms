import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { PageHeader } from "../../../../_components/ui/PageHeader"
import { PartnerForm } from "../../_components/PartnerForm"
import { updatePartner } from "../../actions"

type Props = {
  params: Promise<{ id: string }>
}

export default async function EditPartnerPage({ params }: Props) {
  const { id } = await params
  const partner = await prisma.partner.findUnique({ where: { id } })
  if (!partner) notFound()

  const action = updatePartner.bind(null, partner.id)

  return (
    <div>
      <PageHeader title="Edit Partner" description={partner.name} />
      <div className="max-w-2xl rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
        <PartnerForm action={action} initial={partner} submitLabel="Save Changes" />
      </div>
    </div>
  )
}
