import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
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
      <h1 className="mb-6 text-xl font-semibold text-zinc-900">Edit Partner</h1>
      <PartnerForm action={action} initial={partner} submitLabel="Save Changes" />
    </div>
  )
}
